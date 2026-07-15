import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const API_BASE_URL = 'https://seu-servidor.com/api';

export default function RegisterScreen({ navigation }) {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, password_confirmation: confirm }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível criar a conta.');
        return;
      }
      Alert.alert('Conta criada!', 'Sua conta foi criada com sucesso. Faça login para jogar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Sem conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-10">

          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-5xl mb-3">✨</Text>
            <Text className="text-2xl font-bold text-amber-500 tracking-wider">Criar Conta</Text>
            <Text className="text-sm text-neutral-500 mt-1">Junte-se ao Dragon Ball OTS</Text>
          </View>

          {/* Card */}
          <View className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">

            {/* Nome */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">Nome</Text>
              <TextInput
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-white text-base"
                placeholder="Seu nome"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* E-mail */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">E-mail</Text>
              <TextInput
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-white text-base"
                placeholder="seu@email.com"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Senha */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">Senha</Text>
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-l-xl px-4 py-4 text-white text-base border-r-0"
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="bg-neutral-950 border border-neutral-800 border-l-0 rounded-r-xl px-4 items-center justify-center"
                  onPress={() => setShowPass(v => !v)}
                >
                  <Text className="text-lg">{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar senha */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">Confirmar Senha</Text>
              <TextInput
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-white text-base"
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                returnKeyType="go"
                onSubmitEditing={handleRegister}
                editable={!loading}
              />
            </View>

            {/* Botão */}
            <TouchableOpacity
              className={`bg-amber-500 rounded-xl py-4 items-center ${loading ? 'opacity-60' : ''}`}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text className="text-white font-bold text-base tracking-widest">✨  CRIAR CONTA</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Já tem conta */}
          <TouchableOpacity className="items-center mt-6" onPress={() => navigation.goBack()}>
            <Text className="text-neutral-500 text-sm">
              Já tem conta?{' '}
              <Text className="text-amber-500 font-semibold">Fazer login</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
