/**
 * GameContext — Configuração do servidor de jogo
 *
 * Armazena e disponibiliza as configurações do servidor OTS para toda a árvore
 * de componentes. No futuro pode evoluir para suportar múltiplos servidores
 * (seleção de mundo), manutenção programada, etc.
 */

import React, { createContext, useContext, useState } from 'react';

// ── Configuração padrão do servidor ─────────────────────────────────────────
const DEFAULT_SERVER = {
  host:    '192.168.18.247',
  port:    '7171',
  name:    'Dragon Ball OTS',
  version: '1.0',
  online:  true,
};

// ── Contexto ─────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [server, setServer] = useState(DEFAULT_SERVER);

  /**
   * Atualiza parcialmente a configuração do servidor.
   * Útil quando a API retornar informações dinâmicas (status online, motd, etc.)
   */
  const updateServer = (partial) =>
    setServer(prev => ({ ...prev, ...partial }));

  return (
    <GameContext.Provider value={{ server, updateServer }}>
      {children}
    </GameContext.Provider>
  );
}

// ── Hook de acesso ────────────────────────────────────────────────────────────
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>');
  return ctx;
}
