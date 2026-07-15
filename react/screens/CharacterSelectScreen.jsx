import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const VOCATION_STYLE = {
  Knight:  { icon: '⚔️',  color: '#EF4444' },
  Paladin: { icon: '🏹',  color: '#3B82F6' },
  Mage:    { icon: '🔮',  color: '#A855F7' },
  Druid:   { icon: '🌿',  color: '#22C55E' },
};

function getVoc(vocation = '') {
  const key = Object.keys(VOCATION_STYLE).find(k =>
    vocation.toLowerCase().includes(k.toLowerCase())
  );
  return VOCATION_STYLE[key] ?? { icon: '🐉', color: '#F59E0B' };
}

function CharacterCard({ character, onSelect }) {
  const voc = getVoc(character.vocation);
  return (
    <TouchableOpacity style={s.card} onPress={() => onSelect(character)} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={[s.avatar, { borderColor: voc.color }]}>
        <Text style={s.avatarIcon}>{voc.icon}</Text>
      </View>
      {/* Info */}
      <View style={s.cardInfo}>
        <Text style={s.charName}>{character.name}</Text>
        <Text style={s.charSub}>{character.vocation} — Nível {character.level}</Text>
        {character.world ? <Text style={s.charWorld}>🌍 {character.world}</Text> : null}
      </View>
      {/* Status */}
      <View style={s.cardStatus}>
        <View style={s.statusRow}>
          <View style={[s.dot, { backgroundColor: character.isOnline ? '#22C55E' : '#555' }]} />
          <Text style={[s.statusText, { color: character.isOnline ? '#22C55E' : '#555' }]}>
            {character.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Text style={s.arrow}>›</Text>
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
            navigation.navigate('Loading');
            setTimeout(() => selectCharacter(character), 300);
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerLabel}>CONTA CONECTADA</Text>
        <Text style={s.headerAccount}>{account}</Text>
        <Text style={s.headerCount}>
          {characters.length} personagem{characters.length !== 1 ? 's' : ''} encontrado{characters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Conteúdo */}
      {status === 'loading' ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={s.emptyText}>Carregando personagens...</Text>
        </View>
      ) : characters.length === 0 ? (
        <View style={s.centered}>
          <Text style={s.emptyEmoji}>😶</Text>
          <Text style={s.emptyTitle}>Nenhum personagem</Text>
          <Text style={s.emptyText}>Crie um personagem no site do servidor para jogar.</Text>
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => <CharacterCard character={item} onSelect={handleSelect} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() => Alert.alert('Sair', 'Deseja sair da conta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: logout },
          ])}
        >
          <Text style={s.logoutText}>Trocar de conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ORANGE = '#F59E0B';
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#090909' },
  header:        { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  headerLabel:   { fontSize: 11, color: ORANGE, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  headerAccount: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerCount:   { fontSize: 13, color: '#555', marginTop: 4 },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji:    { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { fontSize: 18, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  emptyText:     { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 8 },
  list:          { padding: 16, paddingTop: 20 },
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 16, marginBottom: 12 },
  avatar:        { width: 52, height: 52, borderRadius: 26, backgroundColor: '#111', borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarIcon:    { fontSize: 22 },
  cardInfo:      { flex: 1 },
  charName:      { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  charSub:       { fontSize: 12, color: '#777', marginTop: 2 },
  charWorld:     { fontSize: 11, color: '#444', marginTop: 2 },
  cardStatus:    { alignItems: 'flex-end' },
  statusRow:     { flexDirection: 'row', alignItems: 'center' },
  dot:           { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  statusText:    { fontSize: 11 },
  arrow:         { color: ORANGE, fontSize: 22, marginTop: 4 },
  footer:        { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#1f1f1f' },
  logoutBtn:     { borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutText:    { color: '#666', fontWeight: '600', fontSize: 14 },
});
