import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useESP32 } from '@/contexts/ESP32Context';
import { VideoStream } from '@/components/VideoStream';
import { CameraCapture } from '@/components/CameraCapture';
import { NgrokInfo } from '@/components/NgrokInfo';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { esp32Url, setEsp32Url, isConnected, setIsConnected, isNgrokUrl } = useESP32();
  const [inputUrl, setInputUrl] = useState(esp32Url);
  const [isConnecting, setIsConnecting] = useState(false);

  const testConnection = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Erro', 'Digite o endereço IP ou URL do Ngrok do ESP32-CAM');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Detectar se é URL do Ngrok
      const isNgrok = inputUrl.includes('ngrok') || 
                     (inputUrl.startsWith('https://') && !inputUrl.includes('192.168.') && !inputUrl.includes('10.') && !inputUrl.includes('172.'));
      
      // Construir URL de teste baseada no tipo
      let testUrl: string;
      if (isNgrok) {
        // Para Ngrok, usar a URL completa com /status
        testUrl = inputUrl.startsWith('https://') 
          ? `${inputUrl}/status` 
          : `https://${inputUrl}/status`;
      } else {
        // Para IP local, usar HTTP com porta padrão
        testUrl = `http://${inputUrl}/status`;
      }
      
      console.log('Testando conexão:', testUrl);
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        timeout: 10000
      });
      
      console.log('Resposta recebida:', response.status, response.statusText);
      
      if (response.ok) {
        await setEsp32Url(inputUrl);
        setIsConnected(true);
        Alert.alert('Sucesso', 'Conectado ao ESP32-CAM!');
      } else {
        // Verificar se é a página de confirmação do Ngrok gratuito
        if (response.status === 403 && isNgrok) {
          Alert.alert(
            'Confirmação do Ngrok', 
            'Acesse o link no navegador para confirmar o acesso e depois tente novamente.',
            [
              { text: 'OK' },
              { 
                text: 'Abrir Link', 
                onPress: async () => {
                  try {
                    const urlToOpen = inputUrl.startsWith('https://') ? inputUrl : `https://${inputUrl}`;
                    console.log('Abrindo URL:', urlToOpen);
                    await Linking.openURL(urlToOpen);
                  } catch (error) {
                    console.error('Erro ao abrir link:', error);
                    Alert.alert('Erro', 'Não foi possível abrir o link no navegador');
                  }
                }
              }
            ]
          );
        } else {
          const errorText = await response.text().catch(() => 'Erro desconhecido');
          console.error('Erro HTTP:', response.status, errorText);
          throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      const errorMessage = inputUrl.includes('ngrok') 
        ? 'Não foi possível conectar via Ngrok. Verifique se o túnel está ativo e tente novamente.'
        : 'Não foi possível conectar ao ESP32-CAM. Verifique o endereço IP e a rede.';
      Alert.alert('Erro', errorMessage);
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
          <ThemedText style={styles.inputLabel}>
            {isNgrokUrl ? 'URL do Ngrok:' : 'Endereço IP do ESP32-CAM:'}
          </ThemedText>
          <TextInput
            style={styles.textInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder={isNgrokUrl ? "https://78e83deb645c.ngrok-free.app" : "192.168.15.200"}
            placeholderTextColor="#999"
            keyboardType="default"
            editable={!isConnected}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
          />
          {isNgrokUrl && (
            <ThemedText style={styles.helpText}>
              Cole aqui a URL completa do Ngrok (ex: https://78e83deb645c.ngrok-free.app)
            </ThemedText>
          )}
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
              {isNgrokUrl ? 'Conectado via Ngrok:' : 'Conectado:'} {esp32Url}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {isConnected && isNgrokUrl && (
        <NgrokInfo isVisible={true} ngrokUrl={esp32Url} />
      )}

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
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
