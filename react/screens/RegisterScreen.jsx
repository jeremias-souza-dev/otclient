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
  StyleSheet,
} from 'react-native';

const API_BASE_URL = 'https://seu-servidor.com/api';
const ORANGE = '#F59E0B';

export default function RegisterScreen({ navigation }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Atenção', 'Preencha todos os campos.'); return;
    }
    if (password !== confirm) {
      Alert.alert('Erro', 'As senhas não coincidem.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter ao menos 6 caracteres.'); return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, password_confirmation: confirm }),
      });
      const data = await response.json();
      if (!response.ok) { Alert.alert('Erro', data.message || 'Não foi possível criar a conta.'); return; }
      Alert.alert('Conta criada!', 'Faça login para jogar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Sem conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChange, placeholder, keyboard = 'default', secure = false, next }) => (
    <View style={s.fieldGroup}>
      <Text style={s.label}>{label}</Text>
      <View style={secure ? s.passwordRow : null}>
        <TextInput
          style={[s.input, secure && s.passwordInput]}
          placeholder={placeholder}
          placeholderTextColor="#555"
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !showPass}
          keyboardType={keyboard}
          autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
          returnKeyType={next ? 'next' : 'go'}
          onSubmitEditing={next}
          editable={!loading}
        />
        {secure && (
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
            <Text style={s.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={s.container}>
          <View style={s.logoSection}>
            <Text style={s.logoEmoji}>✨</Text>
            <Text style={s.title}>Criar Conta</Text>
            <Text style={s.subtitle}>Junte-se ao Dragon Ball OTS</Text>
          </View>

          <View style={s.card}>
            <Field label="NOME" value={name}    onChange={setName}     placeholder="Seu nome" />
            <Field label="E-MAIL" value={email} onChange={setEmail}    placeholder="seu@email.com" keyboard="email-address" />
            <Field label="SENHA" value={password} onChange={setPassword} placeholder="••••••••" secure />
            <Field label="CONFIRMAR SENHA" value={confirm} onChange={setConfirm} placeholder="••••••••" secure />

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={s.btnText}>✨  CRIAR CONTA</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.loginRow} onPress={() => navigation.goBack()}>
            <Text style={s.loginText}>
              Já tem conta?{'  '}
              <Text style={s.loginLink}>Fazer login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#090909' },
  container:     { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoSection:   { alignItems: 'center', marginBottom: 28 },
  logoEmoji:     { fontSize: 56, marginBottom: 8 },
  title:         { fontSize: 26, fontWeight: 'bold', color: ORANGE, letterSpacing: 1 },
  subtitle:      { fontSize: 13, color: '#666', marginTop: 4 },
  card:          { backgroundColor: '#1a1a1a', borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a', padding: 24 },
  fieldGroup:    { marginBottom: 14 },
  label:         { fontSize: 11, fontWeight: '700', color: '#666', letterSpacing: 1.5, marginBottom: 7 },
  input:         { backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, fontSize: 16, color: '#FFF' },
  passwordRow:   { flexDirection: 'row' },
  passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 },
  eyeBtn:        { backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderLeftWidth: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  eyeIcon:       { fontSize: 18 },
  btn:           { backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:   { opacity: 0.6 },
  btnText:       { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  loginRow:      { alignItems: 'center', marginTop: 24 },
  loginText:     { color: '#666', fontSize: 13 },
  loginLink:     { color: ORANGE, fontWeight: '600' },
});
