/**
 * AuthContext — Estado de autenticação e personagens
 *
 * Todo o acesso ao OTClient passa pelo OTClientBridge.
 * Nunca chama NativeModules diretamente — use este contexto.
 *
 * Fluxo:
 *  1. login(account, password)      → OTClientBridge.requestCharacterList()
 *  2. OTClient emite OTC_CharacterList ou OTC_LoginError
 *  3. Contexto atualiza estado → navegação vai para CharacterSelect
 *  4. selectCharacter(char)         → OTClientBridge.launchGame()
 *  5. OTClient emite OTC_GameStarted / OTC_GameClosed
 */

import React, {
  createContext, useContext, useEffect, useReducer, useCallback,
} from 'react';
import {
  requestCharacterList,
  launchGame,
  onOTCEvent,
  OTCEvents,
} from '../OTClientBridge';

const GAME_HOST = '192.168.18.247';
const GAME_PORT = '7171';

// ── State / Reducer ───────────────────────────────────────────────────────────
const INITIAL = {
  status: 'idle',       // 'idle' | 'loading' | 'authenticated' | 'in_game'
  account: null,
  password: null,       // guardado só para relogin após voltar do jogo
  characters: [],
  selectedCharacter: null,
  error: null,
  serverStatus: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, status: 'loading', error: null,
               account: action.account, password: action.password };
    case 'LOGIN_SUCCESS':
      return { ...state, status: 'authenticated', characters: action.characters, error: null };
    case 'LOGIN_ERROR':
      return { ...state, status: 'idle', error: action.message };
    case 'GAME_STARTED':
      return { ...state, status: 'in_game', selectedCharacter: action.character };
    case 'GAME_CLOSED':
      return { ...state, status: 'authenticated' }; // volta para seleção de personagem
    case 'LOGOUT':
      return INITIAL;
    case 'SERVER_STATUS':
      return { ...state, serverStatus: action.data };
    default:
      return state;
  }
}

// ── Contexto ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // ── Assina eventos do OTClient ────────────────────────────────────────────
  useEffect(() => {
    const unsubs = [
      // OTClient retornou a lista de personagens → login bem-sucedido
      onOTCEvent(OTCEvents.CHARACTER_LIST, ({ characters }) => {
        dispatch({ type: 'LOGIN_SUCCESS', characters: characters ?? [] });
      }),

      // OTClient retornou erro de login
      onOTCEvent(OTCEvents.LOGIN_ERROR, ({ message }) => {
        dispatch({ type: 'LOGIN_ERROR', message: message ?? 'Credenciais inválidas.' });
      }),

      // Jogo iniciou
      onOTCEvent(OTCEvents.GAME_STARTED, ({ character }) => {
        dispatch({ type: 'GAME_STARTED', character });
      }),

      // Jogo fechou → volta para seleção de personagem
      onOTCEvent(OTCEvents.GAME_CLOSED, () => {
        dispatch({ type: 'GAME_CLOSED' });
      }),

      // Status do servidor
      onOTCEvent(OTCEvents.SERVER_STATUS, (data) => {
        dispatch({ type: 'SERVER_STATUS', data });
      }),
    ];

    return () => unsubs.forEach(fn => fn()); // cleanup
  }, []);

  // ── Ações ─────────────────────────────────────────────────────────────────

  /** Inicia login: pede ao OTClient a lista de personagens via protocolo Tibia */
  const login = useCallback((account, password) => {
    dispatch({ type: 'LOGIN_START', account, password });
    requestCharacterList(GAME_HOST, GAME_PORT, account, password);
  }, []);

  /** Seleciona personagem e lança o jogo */
  const selectCharacter = useCallback((character) => {
    launchGame(GAME_HOST, GAME_PORT, state.account, state.password, character.name);
  }, [state.account, state.password]);

  /** Logout limpa tudo */
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      selectCharacter,
      logout,
      GAME_HOST,
      GAME_PORT,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
