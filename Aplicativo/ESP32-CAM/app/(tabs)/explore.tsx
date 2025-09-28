import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CameraControls } from '@/components/CameraControls';
import { useESP32 } from '@/contexts/ESP32Context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExploreScreen() {
  const { isConnected } = useESP32();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Controles da Câmera
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Ajuste as configurações da sua ESP32-CAM
        </ThemedText>
      </ThemedView>

      {!isConnected ? (
        <ThemedView style={styles.disconnectedContainer}>
          <IconSymbol name="camera.fill" size={64} color="#ccc" />
          <ThemedText style={styles.disconnectedText}>
            Conecte-se ao ESP32-CAM na aba Home para acessar os controles
          </ThemedText>
        </ThemedView>
      ) : (
        <CameraControls />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  disconnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  disconnectedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    lineHeight: 24,
  },
});
