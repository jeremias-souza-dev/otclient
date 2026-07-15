import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Mapa de vocação para emoji / cor do anel
const VOCATION_STYLE = {
  Knight:  { icon: '⚔️',  ring: 'border-red-500' },
  Paladin: { icon: '🏹',  ring: 'border-blue-500' },
  Mage:    { icon: '🔮',  ring: 'border-purple-500' },
  Druid:   { icon: '🌿',  ring: 'border-green-500' },
};

function getVocationStyle(vocation = '') {
  const key = Object.keys(VOCATION_STYLE).find(k =>
    vocation.toLowerCase().includes(k.toLowerCase())
  );
  return VOCATION_STYLE[key] ?? { icon: '🐉', ring: 'border-amber-500' };
}

function CharacterCard({ character, onSelect }) {
  const { icon, ring } = getVocationStyle(character.vocation);

  return (
    <TouchableOpacity
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-3 flex-row items-center active:opacity-70"
      onPress={() => onSelect(character)}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View className={`w-14 h-14 rounded-full bg-neutral-800 border-2 ${ring} items-center justify-center mr-4`}>
        <Text className="text-2xl">{icon}</Text>
      </View>

      {/* Informações */}
      <View className="flex-1">
        <Text className="text-white text-base font-bold">{character.name}</Text>
        <Text className="text-neutral-400 text-xs mt-0.5">
          {character.vocation} — Nível {character.level}
        </Text>
        {character.world ? (
          <Text className="text-neutral-600 text-xs mt-0.5">🌍 {character.world}</Text>
        ) : null}
      </View>

      {/* Status online */}
      <View className="items-end">
        {character.isOnline ? (
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            <Text className="text-green-500 text-xs">Online</Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-neutral-600 mr-1" />
            <Text className="text-neutral-600 text-xs">Offline</Text>
          </View>
        )}
        <Text className="text-amber-500 text-lg mt-1">›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CharacterSelectScreen({ navigation }) {
  const { account, characters, status, selectCharacter, logout } = useAuth();

  const handleSelect = (character) => {
    Alert.alert(
      'Entrar com personagem',
      `Deseja entrar com ${character.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Jogar ⚔️',
          onPress: () => {
            // Navega para a tela de loading ANTES de abrir o OTClient
            navigation.navigate('Loading');
            // Dá 300ms para a tela aparecer, depois lança o jogo
            setTimeout(() => selectCharacter(character), 300);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-neutral-950">

      {/* Header */}
      <View className="px-6 pt-12 pb-4 border-b border-neutral-800">
        <Text className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-1">
          Conta conectada
        </Text>
        <Text className="text-white text-xl font-bold">{account}</Text>
        <Text className="text-neutral-500 text-sm mt-1">
          {characters.length} personagem{characters.length !== 1 ? 's' : ''} encontrado{characters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de personagens */}
      {status === 'loading' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text className="text-neutral-500 mt-4">Carregando personagens...</Text>
        </View>
      ) : characters.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">😶</Text>
          <Text className="text-white text-lg font-bold text-center">Nenhum personagem</Text>
          <Text className="text-neutral-500 text-sm text-center mt-2">
            Crie um personagem no site do servidor para jogar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <CharacterCard character={item} onSelect={handleSelect} />
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer */}
      <View className="px-6 pb-8 pt-3 border-t border-neutral-800">
        <TouchableOpacity
          className="border border-neutral-700 rounded-xl py-3 items-center"
          onPress={() => Alert.alert('Sair', 'Deseja sair da conta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: logout },
          ])}
        >
          <Text className="text-neutral-400 text-sm font-semibold">Trocar de conta</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
