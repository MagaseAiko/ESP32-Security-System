import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeCustom } from '@/contexts/ThemeContext';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useESP32 } from '@/contexts/ESP32Context';

interface CameraSettings {
  quality: number;
  brightness: number;
  contrast: number;
  saturation: number;
  framesize: number;
  led_intensity: number;
}

interface CameraControlsProps {
  onSettingsChange?: (settings: CameraSettings) => void;
}

export function CameraControls({ onSettingsChange }: CameraControlsProps) {
  const { controlUrl, statusUrl, isConnected, baseUrl, isNgrokUrl } = useESP32();
  const { theme } = useThemeCustom();
  const [settings, setSettings] = useState<CameraSettings>({
    quality: 10,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    framesize: 10,
    led_intensity: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Carregar configurações atuais da câmera
  const loadCurrentSettings = async () => {
    if (!isConnected) return;

    try {
      setIsLoading(true);
      const response = await fetch(statusUrl);
      const data = await response.json();
      
      setSettings({
        quality: data.quality || 10,
        brightness: data.brightness || 0,
        contrast: data.contrast || 0,
        saturation: data.saturation || 0,
        framesize: data.framesize || 10,
        led_intensity: data.led_intensity || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar configuração na câmera
  const applySetting = async (variable: string, value: number) => {
    if (!isConnected) return;

    try {
      const url = `${controlUrl}?var=${variable}&val=${value}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      // Atualizar estado local
      setSettings(prev => ({ ...prev, [variable]: value }));
      
      if (onSettingsChange) {
        onSettingsChange({ ...settings, [variable]: value });
      }
    } catch (error) {
      console.error(`Erro ao aplicar ${variable}:`, error);
      Alert.alert('Erro', `Não foi possível alterar ${variable}`);
    }
  };

  // Resetar WiFi do ESP32
  const handleResetWiFi = async () => {
    Alert.alert(
      'Resetar WiFi',
      'Tem certeza que deseja resetar as configurações de WiFi do ESP32? O dispositivo será reiniciado.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              const resetUrl = isNgrokUrl 
                ? `https://${baseUrl}/reset`
                : `http://${baseUrl}/reset`;
              
              const response = await fetch(resetUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert(
                  'Sucesso',
                  'WiFi resetado com sucesso! O ESP32 será reiniciado e entrará em modo de configuração.'
                );
              } else {
                throw new Error(`Erro HTTP: ${response.status}`);
              }
            } catch (error) {
              console.error('Erro ao resetar WiFi:', error);
              Alert.alert(
                'Erro',
                'Não foi possível resetar o WiFi. Verifique a conexão com o ESP32.'
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  // Carregar configurações quando conectado
  useEffect(() => {
    if (isConnected) {
      loadCurrentSettings();
    }
  }, [isConnected]);

  const screenWidth = Dimensions.get('window').width;

  const ControlSlider = ({
    title,
    variable,
    value,
    min,
    max,
    step = 1
  }: {
    title: string;
    variable: keyof CameraSettings;
    value: number;
    min: number;
    max: number;
    step?: number;
  }) => (
  <View style={[styles.controlItemModern, { width: screenWidth - 32, maxWidth: 700, alignSelf: 'center' }] }>
      <View style={styles.labelRowModern}>
        <ThemedText style={[styles.controlLabelModern, { color: theme === 'dark' ? '#ECEDEE' : '#222' }]}>{title}</ThemedText>
        <ThemedText style={styles.valueModern}>{value}</ThemedText>
      </View>
      <Slider
        style={[styles.sliderModern, { width: screenWidth - 48, maxWidth: 680, alignSelf: 'center' }]}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        minimumTrackTintColor={theme === 'dark' ? '#2d7cf7' : '#007AFF'}
        maximumTrackTintColor={theme === 'dark' ? '#444' : '#ccc'}
        thumbTintColor={theme === 'dark' ? '#2d7cf7' : '#007AFF'}
        onSlidingComplete={val => applySetting(variable, Math.round(val))}
      />
    </View>
  );

  if (!isConnected) {
    return null;
  }

  return (
    <ThemedView style={[styles.containerModern, { backgroundColor: theme === 'dark' ? '#23272b' : '#fff', borderColor: theme === 'dark' ? '#23272b' : '#fff', borderRadius: 18, padding: 16, marginHorizontal: 0, marginBottom: 0, elevation: 0 }] }>
      <ScrollView style={styles.scrollViewModern} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <ControlSlider title="Qualidade" variable="quality" value={settings.quality} min={4} max={63} />
        <ControlSlider title="Brilho" variable="brightness" value={settings.brightness} min={-2} max={2} />
        <ControlSlider title="Contraste" variable="contrast" value={settings.contrast} min={-2} max={2} />
        <ControlSlider title="Saturação" variable="saturation" value={settings.saturation} min={-2} max={2} />
        <ControlSlider title="Resolução" variable="framesize" value={settings.framesize} min={0} max={13} />
        <ControlSlider title="LED" variable="led_intensity" value={settings.led_intensity} min={0} max={255} step={25} />
        
        {/* Botão de Reset WiFi */}
        <View style={[styles.resetButtonContainer, { width: screenWidth - 32, maxWidth: 700, alignSelf: 'center' }]}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              { 
                backgroundColor: theme === 'dark' ? '#dc3545' : '#ff3b30',
                opacity: isResetting ? 0.5 : 1,
              }
            ]}
            onPress={handleResetWiFi}
            disabled={isResetting}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.resetButtonText}>
              {isResetting ? 'Resetando...' : '🔄 Resetar WiFi'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  containerModern: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    borderRadius: 18,
  },
  scrollViewModern: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  controlItemModern: {
    marginBottom: 28,
    paddingHorizontal: 16,
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  labelRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  controlLabelModern: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  valueModern: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  sliderModern: {
    width: '100%',
    minWidth: 180,
    maxWidth: '100%',
    height: 36,
    marginTop: 2,
    alignSelf: 'stretch',
  },
  resetButtonContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  resetButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
