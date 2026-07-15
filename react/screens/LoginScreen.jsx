import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, status, error, characters } = useAuth();
  const [account,  setAccount]  = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const loading     = status === 'loading';
  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef(null);

  useEffect(() => {
    if (status === 'authenticated' && characters.length >= 0) {
      navigation.navigate('CharacterSelect');
    }
  }, [status]);

  useEffect(() => {
    if (error) { shake(); Alert.alert('Erro', error); }
  }, [error]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    if (!account.trim() || !password.trim()) {
      shake();
      Alert.alert('Atenção', 'Preencha o usuário e a senha.');
      return;
    }
    login(account.trim(), password);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.container}>

          {/* Logo */}
          <View style={s.logoSection}>
            <Text style={s.logoEmoji}>🐉</Text>
            <Text style={s.title}>Dragon Ball OTS</Text>
            <Text style={s.subtitle}>Entre com sua conta do servidor</Text>
          </View>

          {/* Card */}
          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>

            {/* Conta */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>CONTA / E-MAIL</Text>
              <TextInput
                style={s.input}
                placeholder="sua@conta.com"
                placeholderTextColor="#555"
                value={account}
                onChangeText={setAccount}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />
            </View>

            {/* Senha */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>SENHA</Text>
              <View style={s.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={[s.input, s.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)} disabled={loading}>
                  <Text style={s.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info servidor */}
            <View style={s.infoBanner}>
              <Text style={s.infoBannerIcon}>⚡</Text>
              <Text style={s.infoBannerText}>Conexão direta via protocolo Tibia</Text>
            </View>

            {/* Botão */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={s.btnText}>⚔️  ENTRAR E JOGAR</Text>
              }
            </TouchableOpacity>
          </Animated.View>

          {/* Criar conta */}
          <TouchableOpacity style={s.registerRow} onPress={() => navigation.navigate('Register')} disabled={loading}>
            <Text style={s.registerText}>
              Não tem conta?{'  '}
              <Text style={s.registerLink}>Criar conta</Text>
            </Text>
          </TouchableOpacity>

          <Text style={s.footer}>Dragon Ball OTS • v1.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ORANGE = '#F59E0B';
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#090909' },
  scroll:        { flexGrow: 1 },
  container:     { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoSection:   { alignItems: 'center', marginBottom: 32 },
  logoEmoji:     { fontSize: 72, marginBottom: 10 },
  title:         { fontSize: 30, fontWeight: 'bold', color: ORANGE, letterSpacing: 2 },
  subtitle:      { fontSize: 13, color: '#666', marginTop: 4 },
  card:          { backgroundColor: '#1a1a1a', borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a', padding: 24, elevation: 8 },
  fieldGroup:    { marginBottom: 16 },
  label:         { fontSize: 11, fontWeight: '700', color: '#666', letterSpacing: 1.5, marginBottom: 8 },
  input:         { backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, color: '#FFF' },
  passwordRow:   { flexDirection: 'row' },
  passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 },
  eyeBtn:        { backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderLeftWidth: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  eyeIcon:       { fontSize: 18 },
  infoBanner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 20 },
  infoBannerIcon:{ fontSize: 16, marginRight: 8 },
  infoBannerText:{ color: '#F59E0B', fontSize: 12, flex: 1 },
  btn:           { backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 4 },
  btnDisabled:   { opacity: 0.6 },
  btnText:       { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  registerRow:   { alignItems: 'center', marginTop: 24 },
  registerText:  { color: '#666', fontSize: 13 },
  registerLink:  { color: ORANGE, fontWeight: '600' },
  footer:        { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 32 },
});
