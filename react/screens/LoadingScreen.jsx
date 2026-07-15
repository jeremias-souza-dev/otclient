import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoadingScreen({ navigation }) {
  const { selectedCharacter, status } = useAuth();

  // Animações
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const dotAnim1    = useRef(new Animated.Value(0.3)).current;
  const dotAnim2    = useRef(new Animated.Value(0.3)).current;
  const dotAnim3    = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade-in da tela ao entrar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
      }),
    ]).start();

    // Pulsação do emoji do dragão
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Animação dos 3 pontinhos de loading
    const animateDots = () => {
      const dot = (anim, delay) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1,   duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]);

      Animated.loop(
        Animated.parallel([
          dot(dotAnim1, 0),
          dot(dotAnim2, 200),
          dot(dotAnim3, 400),
        ])
      ).start();
    };
    animateDots();

    return () => pulse.stop();
  }, []);

  // Quando o OTClient emitir OTC_GameStarted o status muda para 'in_game'
  // → a navegação já é gerenciada pelo AppNavigator via status do AuthContext
  // Aqui só garantimos que a tela some se o status mudar para authenticated (erro)
  useEffect(() => {
    if (status === 'authenticated') {
      navigation.goBack();
    }
  }, [status]);

  const characterName = selectedCharacter?.name ?? '...';

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Overlay escuro gradiente para legibilidade */}
      <View style={styles.overlay} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

        {/* Dragão pulsando */}
        <Animated.Text style={[styles.dragonEmoji, { transform: [{ scale: pulseAnim }] }]}>
          🐉
        </Animated.Text>

        {/* Título */}
        <Text style={styles.title}>Dragon Ball OTS</Text>

        {/* Personagem entrando */}
        <View style={styles.characterBox}>
          <Text style={styles.characterLabel}>Entrando como</Text>
          <Text style={styles.characterName}>{characterName}</Text>
        </View>

        {/* Barra de loading */}
        <LoadingBar />

        {/* Pontinhos animados */}
        <View style={styles.dotsRow}>
          {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
          ))}
        </View>

        <Text style={styles.loadingText}>Carregando o mundo...</Text>

      </Animated.View>

      {/* Versão no canto */}
      <Text style={styles.version}>v1.0</Text>
    </ImageBackground>
  );
}

// ── Barra de loading animada ──────────────────────────────────────────────────
function LoadingBar() {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Barra enche até ~85% rapidamente, depois espera o OTClient
    Animated.sequence([
      Animated.timing(widthAnim, { toValue: 0.55, duration: 1200, useNativeDriver: false }),
      Animated.timing(widthAnim, { toValue: 0.75, duration: 2000, useNativeDriver: false }),
      Animated.timing(widthAnim, { toValue: 0.85, duration: 3000, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          {
            width: widthAnim.interpolate({
              inputRange:  [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      {/* Brilho deslizante */}
      <View style={styles.barShine} />
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dragonEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F59E0B',
    letterSpacing: 2,
    marginBottom: 24,
    textShadowColor: 'rgba(245,158,11,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  characterBox: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 36,
  },
  characterLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  characterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Barra
  barTrack: {
    width: 240,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
  },
  // Pontinhos
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    letterSpacing: 1,
  },
  version: {
    position: 'absolute',
    bottom: 24,
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
  },
});
