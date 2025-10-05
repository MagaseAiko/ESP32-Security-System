import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator, Text, Platform } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useESP32 } from '@/contexts/ESP32Context';

interface VideoStreamProps {
  width?: number;
  height?: number;
}

export function VideoStream({ width = 320, height = 240 }: VideoStreamProps) {
  const { streamUrl, captureUrl, isConnected } = useESP32();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(captureUrl);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Detecta se MJPEG pode ser usado (apenas web ou se for possível no Android)
  const canUseMjpeg = Platform.OS === 'web';

  // Polling de snapshot se não for MJPEG
  React.useEffect(() => {
    if (!canUseMjpeg && isConnected) {
      setHasError(false);
      setIsLoading(true);
      intervalRef.current = setInterval(() => {
        // Fade out
        Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
          setSnapshotUrl(`${captureUrl}?t=${Date.now()}`);
          // Fade in
          Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start();
        });
      }, 400);
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
  }, [isConnected, captureUrl]);

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
      {canUseMjpeg ? (
        <Image
          source={{ uri: streamUrl }}
          style={[styles.video, { width, height }]}
          contentFit="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
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
        </Animated.View>
      )}
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
