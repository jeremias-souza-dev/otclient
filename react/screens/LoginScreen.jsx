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

  // Navega para seleção de personagem quando o OTClient responder
  useEffect(() => {
    if (status === 'authenticated' && characters.length >= 0) {
      navigation.navigate('CharacterSelect');
    }
  }, [status, characters]);

  // Shake quando houver erro
  useEffect(() => {
    if (error) {
      shake();
      Alert.alert('Erro', error);
    }
  }, [error]);

  // ── Animação de erro (shake) ─────────────────────────────────────────────
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Login: pede a lista de personagens ao OTClient via protocolo Tibia ────
  const handleLogin = () => {
    if (!account.trim() || !password.trim()) {
      shake();
      Alert.alert('Atenção', 'Preencha o usuário e a senha.');
      return;
    }
    // AuthContext chama OTClientBridge.requestCharacterList()
    // O OTClient emite OTC_CharacterList ou OTC_LoginError
    login(account.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-10">

          {/* Logo */}
          <View className="items-center mb-10">
            <Text className="text-7xl mb-3">🐉</Text>
            <Text className="text-3xl font-bold text-amber-500 tracking-wider">
              Dragon Ball OTS
            </Text>
            <Text className="text-sm text-neutral-500 mt-1">
              Entre com sua conta do servidor
            </Text>
          </View>

          {/* Card de login */}
          <Animated.View
            className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6"
            style={{ transform: [{ translateX: shakeAnim }] }}
          >

            {/* Campo: conta */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">
                Conta / E-mail
              </Text>
              <TextInput
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-white text-base"
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

            {/* Campo: senha */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">
                Senha
              </Text>
              <View className="flex-row">
                <TextInput
                  ref={passwordRef}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-l-xl px-4 py-4 text-white text-base border-r-0"
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="bg-neutral-950 border border-neutral-800 border-l-0 rounded-r-xl px-4 items-center justify-center"
                  onPress={() => setShowPass(v => !v)}
                  disabled={loading}
                >
                  <Text className="text-lg">{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info: conexão direta */}
            <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-6 flex-row items-center">
              <Text className="text-lg mr-2">⚡</Text>
              <Text className="text-amber-400 text-xs flex-1">
                Conexão direta com o servidor {GAME_HOST}:{GAME_PORT} via protocolo Tibia
              </Text>
            </View>

            {/* Botão entrar */}
            <TouchableOpacity
              className={`bg-amber-500 rounded-xl py-4 items-center ${loading ? 'opacity-60' : ''}`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text className="text-white font-bold text-base tracking-widest">⚔️  ENTRAR E JOGAR</Text>
              }
            </TouchableOpacity>

          </Animated.View>

          {/* Criar conta */}
          <TouchableOpacity
            className="items-center mt-6"
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text className="text-neutral-500 text-sm">
              Não tem conta?{' '}
              <Text className="text-amber-500 font-semibold">Criar conta no site</Text>
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-neutral-800 text-xs mt-8">
            Dragon Ball OTS • v1.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
