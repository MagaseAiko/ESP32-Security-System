import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { useESP32 } from '@/contexts/ESP32Context';
import { useThemeCustom } from '@/contexts/ThemeContext';
import * as MediaLibrary from 'expo-media-library';
import { File as FSFile, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

interface CameraCaptureProps {
  onPhotoCaptured?: (photoUri: string) => void;
}

export function CameraCapture({ onPhotoCaptured }: CameraCaptureProps) {
  const { captureUrl, isConnected } = useESP32();
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePhoto = async () => {
    if (!isConnected) {
      Alert.alert('Erro', 'Conecte-se ao ESP32-CAM primeiro');
      return;
    }

    try {
      setIsCapturing(true);
      // Fazer requisição para capturar foto
      const response = await fetch(captureUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      // Converter resposta para blob
      const blob = await response.blob();
      const fileName = `esp32_capture_${Date.now()}.jpg`;

      if (Platform.OS === 'web') {
        // Web: criar link de download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        Alert.alert('Sucesso', 'Foto capturada e baixada!');
        if (onPhotoCaptured) {
          onPhotoCaptured(url);
        }
      } else {
        // Mobile: salvar no sistema de arquivos e galeria (Expo FileSystem v3 API)
        const baseDir = Paths.document ?? Paths.cache; // Directory
        const file = new FSFile(baseDir, fileName);
        // Converter blob para base64 e salvar
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            file.write(base64Data, { encoding: 'base64' });
            const fileUri = file.uri;
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
              await MediaLibrary.saveToLibraryAsync(fileUri);
              Alert.alert('Sucesso', 'Foto capturada e salva na galeria!');
            } else {
              Alert.alert('Aviso', 'Foto capturada, mas não foi possível salvar na galeria');
            }
            if (onPhotoCaptured) {
              onPhotoCaptured(file.uri);
            }
          } catch (error) {
            console.error('Erro ao processar foto:', error);
            Alert.alert('Erro', 'Erro ao processar a foto capturada');
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto. Verifique a conexão.');
    } finally {
      setIsCapturing(false);
    }
  };

  const { theme } = useThemeCustom();
  return (
    <View style={[
      styles.boxMinimal,
      {
        backgroundColor: theme === 'dark' ? '#23272b' : '#fff',
        borderColor: theme === 'dark' ? '#23272b' : '#fff',
        shadowColor: theme === 'dark' ? '#23272b' : '#000',
      },
    ]}>
      <TouchableOpacity
        style={[styles.captureButton,
          { backgroundColor: theme === 'dark' ? '#2d7cf7' : '#007AFF',
            shadowColor: theme === 'dark' ? '#23272b' : '#000',
          },
          isCapturing && styles.captureButtonDisabled
        ]}
        onPress={capturePhoto}
        disabled={isCapturing || !isConnected}
      >
        {isCapturing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <IconSymbol name="camera.fill" size={24} color="#fff" />
        )}
      </TouchableOpacity>
      <ThemedText style={[styles.captureText, { color: theme === 'dark' ? '#aaa' : '#666' }] }>
        {isCapturing ? 'Capturando...' : 'Capturar Foto'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  boxMinimal: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    marginHorizontal: 0,
    marginBottom: 20,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButtonDisabled: {
    backgroundColor: '#ccc',
  },
  captureText: {
    fontSize: 14,
    color: '#666',
  },
});
