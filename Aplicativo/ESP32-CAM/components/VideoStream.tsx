import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useESP32 } from '@/contexts/ESP32Context';

interface VideoStreamProps {
  width?: number;
  height?: number;
}

export function VideoStream({ width = 320, height = 240 }: VideoStreamProps) {
  const { streamUrl, isConnected } = useESP32();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(streamUrl);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza o snapshot periodicamente quando conectado
  React.useEffect(() => {
    if (isConnected) {
      setHasError(false);
      setIsLoading(true);
      // Atualiza a cada 200ms
      intervalRef.current = setInterval(() => {
        setSnapshotUrl(`${streamUrl}?t=${Date.now()}`);
      }, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, streamUrl]);

  if (!isConnected) {
    return (
      <ThemedView style={[styles.container, { width, height }]}> 
        <ThemedText style={styles.message}>
          Conecte-se ao ESP32-CAM primeiro
        </ThemedText>
      </ThemedView>
    );
  }

  if (hasError) {
    return (
      <ThemedView style={[styles.container, { width, height }]}> 
        <ThemedText style={styles.errorMessage}>
          Erro ao conectar com a câmera
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { width, height }]}> 
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Conectando...</Text>
        </View>
      )}
      <Image
        source={{ uri: snapshotUrl }}
        style={[styles.video, { width, height }]}
        contentFit="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        cachePolicy="none"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
  message: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
});
