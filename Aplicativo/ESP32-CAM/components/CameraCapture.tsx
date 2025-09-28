import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { useESP32 } from '@/contexts/ESP32Context';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

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
      
      // Criar URI local para a imagem
      const fileName = `esp32_capture_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Converter blob para base64 e salvar
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remover prefixo data:image/jpeg;base64,
          
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Solicitar permissão para salvar na galeria
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('Sucesso', 'Foto capturada e salva na galeria!');
          } else {
            Alert.alert('Aviso', 'Foto capturada, mas não foi possível salvar na galeria');
          }

          if (onPhotoCaptured) {
            onPhotoCaptured(fileUri);
          }
        } catch (error) {
          console.error('Erro ao processar foto:', error);
          Alert.alert('Erro', 'Erro ao processar a foto capturada');
        }
      };
      
      reader.readAsDataURL(blob);
      
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto. Verifique a conexão.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
        onPress={capturePhoto}
        disabled={isCapturing || !isConnected}
      >
        {isCapturing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <IconSymbol name="camera.fill" size={24} color="#fff" />
        )}
      </TouchableOpacity>
      
      <ThemedText style={styles.captureText}>
        {isCapturing ? 'Capturando...' : 'Capturar Foto'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
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
