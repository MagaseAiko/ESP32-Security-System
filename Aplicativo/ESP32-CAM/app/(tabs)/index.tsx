import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, Linking, Animated, View } from 'react-native';
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
  const [buttonScale] = useState(new Animated.Value(1));

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
      <View style={styles.spacer} />
      <View style={styles.headerMinimal}>
        <ThemedText type="title" style={styles.titleMinimal}>
          ESP32-CAM
        </ThemedText>
        <ThemedText style={styles.subtitleMinimal}>
          Visualize e controle sua câmera de forma simples
        </ThemedText>
      </View>
      <View style={styles.cardMinimal}>
        <TextInput
          style={styles.textInputMinimal}
          value={inputUrl}
          onChangeText={setInputUrl}
          placeholder={isNgrokUrl ? "URL do Ngrok" : "IP do ESP32-CAM"}
          placeholderTextColor="#b0b0b0"
          keyboardType="default"
          editable={!isConnected}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        <View style={styles.buttonRowMinimal}>
          {!isConnected ? (
            <Animated.View style={{ transform: [{ scale: buttonScale }], flex: 1 }}>
              <TouchableOpacity
                style={styles.actionButtonMinimal}
                onPress={() => { animateButton(); testConnection(); }}
                activeOpacity={0.85}
                disabled={isConnecting}
              >
                <IconSymbol name="wifi" size={22} color="#fff" />
                <ThemedText style={styles.actionButtonTextMinimal}>
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale }], flex: 1 }}>
              <TouchableOpacity
                style={[styles.actionButtonMinimal, styles.disconnectButtonMinimal]}
                onPress={() => { animateButton(); disconnect(); }}
                activeOpacity={0.85}
              >
                <IconSymbol name="wifi.slash" size={22} color="#fff" />
                <ThemedText style={styles.actionButtonTextMinimal}>Desconectar</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
        {isConnected && (
          <View style={styles.statusMinimal}>
            <IconSymbol name="checkmark.circle.fill" size={18} color="#43a047" />
            <ThemedText style={styles.statusTextMinimal}>
              {isNgrokUrl ? 'Ngrok:' : 'IP:'} {esp32Url}
            </ThemedText>
          </View>
        )}
      </View>
      {isConnected && isNgrokUrl && (
        <NgrokInfo isVisible={true} ngrokUrl={esp32Url} />
      )}
      {isConnected && (
        <View style={styles.cardMinimal}>
          <ThemedText style={styles.sectionTitleMinimal}>Stream de Vídeo</ThemedText>
          <View style={styles.videoContainerMinimal}>
            <VideoStream 
              width={screenWidth - 48} 
              height={(screenWidth - 48) * 0.6} 
            />
          </View>
          <CameraCapture />
        </View>
      )}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  spacer: {
    height: 32,
  },
  headerMinimal: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleMinimal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitleMinimal: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
    fontWeight: '400',
  },
  cardMinimal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'stretch',
  },
  textInputMinimal: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
    borderWidth: 0,
    marginBottom: 16,
  },
  buttonRowMinimal: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionButtonMinimal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disconnectButtonMinimal: {
    backgroundColor: '#e73827',
  },
  actionButtonTextMinimal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statusMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 2,
  },
  statusTextMinimal: {
    color: '#43a047',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitleMinimal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    marginTop: 2,
  },
  videoContainerMinimal: {
    alignItems: 'center',
    marginBottom: 12,
  },
});
