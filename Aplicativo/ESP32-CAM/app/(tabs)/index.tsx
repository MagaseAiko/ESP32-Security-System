import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useESP32 } from '@/contexts/ESP32Context';
import { VideoStream } from '@/components/VideoStream';
import { CameraCapture } from '@/components/CameraCapture';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { esp32Url, setEsp32Url, isConnected, setIsConnected } = useESP32();
  const [inputUrl, setInputUrl] = useState(esp32Url);
  const [isConnecting, setIsConnecting] = useState(false);

  const testConnection = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Erro', 'Digite o endereço IP do ESP32-CAM');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Testar conexão com o endpoint de status
      const testUrl = `http://${inputUrl}/status`;
      const response = await fetch(testUrl, { 
        method: 'GET',
        timeout: 5000 
      });
      
      if (response.ok) {
        await setEsp32Url(inputUrl);
        setIsConnected(true);
        Alert.alert('Sucesso', 'Conectado ao ESP32-CAM!');
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao ESP32-CAM. Verifique o endereço IP e a rede.');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    Alert.alert('Desconectado', 'Conexão com ESP32-CAM encerrada');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          ESP32-CAM Viewer
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Conecte-se à sua câmera ESP32-CAM
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.connectionSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Configuração de Conexão
        </ThemedText>
        
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Endereço IP do ESP32-CAM:</ThemedText>
          <TextInput
            style={styles.textInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="192.168.15.200"
            placeholderTextColor="#999"
            keyboardType="numeric"
            editable={!isConnected}
          />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          {!isConnected ? (
            <TouchableOpacity
              style={[styles.button, styles.connectButton]}
              onPress={testConnection}
              disabled={isConnecting}
            >
              <IconSymbol name="wifi" size={20} color="#fff" />
              <ThemedText style={styles.buttonText}>
                {isConnecting ? 'Conectando...' : 'Conectar'}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={disconnect}
            >
              <IconSymbol name="wifi.slash" size={20} color="#fff" />
              <ThemedText style={styles.buttonText}>Desconectar</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {isConnected && (
          <ThemedView style={styles.statusContainer}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
            <ThemedText style={styles.statusText}>
              Conectado: {esp32Url}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {isConnected && (
        <ThemedView style={styles.cameraSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Stream de Vídeo
          </ThemedText>
          
          <ThemedView style={styles.videoContainer}>
            <VideoStream 
              width={screenWidth - 32} 
              height={(screenWidth - 32) * 0.75} 
            />
          </ThemedView>

          <CameraCapture />
        </ThemedView>
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
  connectionSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    gap: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  cameraSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  videoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
});
