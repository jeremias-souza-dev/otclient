import React from 'react';
import { AppRegistry, StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';

const App = () => {
  const onPlayGame = () => {
    const { NativeModules } = require('react-native');
    const { GameLauncher } = NativeModules;
    if (GameLauncher) {
      // Exemplo de chamada passando os parâmetros necessários para o autologin no OTS
      GameLauncher.launchGame(
        "192.168.18.247",
        "7171",
        "testaccount",
        "G_temp_token_12345",
        "Dragon character"
      );
    } else {
      console.warn("Módulo nativo GameLauncher não encontrado");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Dragon Ball OTS</Text>
      <Text style={styles.subtitle}>React Native Launcher Shell</Text>

      <TouchableOpacity style={styles.button} onPress={onPlayGame}>
        <Text style={styles.buttonText}>JOGAR AGORA</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

AppRegistry.registerComponent('otclient', () => App);
