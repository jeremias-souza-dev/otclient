/**
 * AuthContext — Estado de autenticação e personagens
 *
 * Gerencia o fluxo completo de login:
 * 1. Autentica com a API Laravel (POST /api/auth/login)
 * 2. Recebe a lista de personagens do servidor
 * 3. Armazena no contexto para a tela de seleção de personagem
 * 4. Ao escolher um personagem, lança o OTClient via módulo nativo
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { NativeModules, Alert } from 'react-native';

// ── Configuração ──────────────────────────────────────────────────────────────
const API_BASE_URL = 'https://seu-servidor.com/api'; // URL da sua API Laravel
const GAME_HOST    = '192.168.18.247';
const GAME_PORT    = '7171';

// ── Contexto ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Estado inicial ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  isAuthenticated: false,
  account: null,      // string — e-mail/nome da conta
  token: null,        // string — token da API
  characters: [],     // array de CharacterInfo
  selectedCharacter: null,
  isLoading: false,
  error: null,
};

/**
 * CharacterInfo shape:
 * {
 *   name:     string,   // nome do personagem
 *   level:    number,   // nível atual
 *   vocation: string,   // vocação (Knight, Mage, etc.)
 *   world:    string,   // mundo/servidor
 *   isOnline: boolean,  // se está online no momento
 *   lastLogin: string,  // data do último login
 * }
 */

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);

  const setLoading = (v) => setState(p => ({ ...p, isLoading: v, error: null }));
  const setError   = (e) => setState(p => ({ ...p, isLoading: false, error: e }));

  // ── Login: autentica e obtém lista de personagens ─────────────────────────
  const login = useCallback(async (account, password) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: account.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Credenciais inválidas.');
        return { success: false, error: data.message || 'Credenciais inválidas.' };
      }

      // Espera que a API retorne { token, characters: [...] }
      setState({
        isAuthenticated: true,
        account: account.trim(),
        token: data.token,
        characters: data.characters ?? [],
        selectedCharacter: null,
        isLoading: false,
        error: null,
      });

      return { success: true, characters: data.characters ?? [] };

    } catch (err) {
      const msg = 'Não foi possível conectar ao servidor. Verifique sua internet.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // ── Lança o jogo com o personagem selecionado ─────────────────────────────
  const launchWithCharacter = useCallback((character) => {
    const { GameLauncher } = NativeModules;

    if (!GameLauncher) {
      Alert.alert('Erro', 'Módulo nativo GameLauncher não encontrado.');
      return;
    }

    setState(p => ({ ...p, selectedCharacter: character }));

    // Passa conta + token + nome do personagem para o OTClient C++
    // O C++ já sabe o protocolo do Tibia e lida com a autenticação final
    GameLauncher.launchGame(
      GAME_HOST,
      GAME_PORT,
      state.account,
      state.token ?? state.account, // token ou fallback para a conta
      character.name
    );
  }, [state.account, state.token]);

  const value = {
    ...state,
    login,
    logout,
    launchWithCharacter,
    GAME_HOST,
    GAME_PORT,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook de acesso ────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
