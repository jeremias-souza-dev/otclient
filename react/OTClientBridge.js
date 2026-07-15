/**
 * OTClientBridge — Ponte bidirecional React Native ↔ OTClient C++
 *
 * REACT → OTCLIENT  (chamadas de método):
 *   OTClientBridge.requestCharacterList(host, port, account, password)
 *   OTClientBridge.launchGame(host, port, account, password, character)
 *   OTClientBridge.requestServerStatus(host, port)
 *   OTClientBridge.returnToLauncher()
 *
 * OTCLIENT → REACT  (eventos via DeviceEventEmitter):
 *   "OTC_CharacterList"  → { characters: [...] }
 *   "OTC_LoginError"     → { message: string, code: number }
 *   "OTC_GameStarted"    → { character: string }
 *   "OTC_GameClosed"     → {}
 *   "OTC_ServerStatus"   → { online: bool, playersOnline: number, motd: string }
 */

import { NativeModules, DeviceEventEmitter } from 'react-native';

const { GameLauncher } = NativeModules;

if (!GameLauncher) {
  console.warn('[OTClientBridge] Módulo nativo GameLauncher não encontrado. Rodando em modo mock.');
}

// ── Eventos que o OTClient emite para o React ─────────────────────────────────
export const OTCEvents = {
  CHARACTER_LIST:  'OTC_CharacterList',
  LOGIN_ERROR:     'OTC_LoginError',
  GAME_STARTED:    'OTC_GameStarted',
  GAME_CLOSED:     'OTC_GameClosed',
  SERVER_STATUS:   'OTC_ServerStatus',
};

// ── React → OTClient ──────────────────────────────────────────────────────────

/**
 * Solicita a lista de personagens do servidor OTS.
 * O OTClient conecta via protocolo Tibia e emite OTC_CharacterList ou OTC_LoginError.
 */
export function requestCharacterList(host, port, account, password) {
  if (GameLauncher?.requestCharacterList) {
    GameLauncher.requestCharacterList(host, port, account, password);
  } else {
    // Modo mock para desenvolvimento sem o dispositivo
    console.log('[OTClientBridge] requestCharacterList (mock):', { host, port, account });
    setTimeout(() => {
      DeviceEventEmitter.emit(OTCEvents.CHARACTER_LIST, {
        characters: [
          { name: 'Goku',   level: 999, vocation: 'Knight',  isOnline: false },
          { name: 'Vegeta', level: 850, vocation: 'Paladin',  isOnline: false },
        ],
      });
    }, 1000);
  }
}

/**
 * Lança o jogo com o personagem selecionado.
 * Abre a GameActivity e o OTClient faz o login final no servidor.
 */
export function launchGame(host, port, account, password, characterName) {
  if (GameLauncher?.launchGame) {
    GameLauncher.launchGame(host, port, account, password, characterName);
  } else {
    console.log('[OTClientBridge] launchGame (mock):', { host, port, account, characterName });
    setTimeout(() => {
      DeviceEventEmitter.emit(OTCEvents.GAME_STARTED, { character: characterName });
    }, 500);
  }
}

/**
 * Solicita o status do servidor (online/offline, players online, MOTD).
 * O OTClient emite OTC_ServerStatus como resposta.
 */
export function requestServerStatus(host, port) {
  if (GameLauncher?.requestServerStatus) {
    GameLauncher.requestServerStatus(host, port);
  } else {
    console.log('[OTClientBridge] requestServerStatus (mock):', { host, port });
    setTimeout(() => {
      DeviceEventEmitter.emit(OTCEvents.SERVER_STATUS, {
        online: true,
        playersOnline: 42,
        motd: 'Bem-vindo ao Dragon Ball OTS!',
      });
    }, 800);
  }
}

/**
 * Fecha o jogo e volta para o Launcher React Native.
 */
export function returnToLauncher() {
  if (GameLauncher?.returnToLauncher) {
    GameLauncher.returnToLauncher();
  }
}

// ── OTClient → React (assinatura de eventos) ──────────────────────────────────

/**
 * Assina um evento do OTClient.
 * Retorna uma função de cleanup para usar no useEffect.
 *
 * @example
 * useEffect(() => {
 *   return onOTCEvent(OTCEvents.CHARACTER_LIST, ({ characters }) => {
 *     setCharacters(characters);
 *   });
 * }, []);
 */
export function onOTCEvent(eventName, handler) {
  const subscription = DeviceEventEmitter.addListener(eventName, handler);
  return () => subscription.remove(); // cleanup
}
