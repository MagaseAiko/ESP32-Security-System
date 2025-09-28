import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
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
  const { controlUrl, statusUrl, isConnected } = useESP32();
  const [settings, setSettings] = useState<CameraSettings>({
    quality: 10,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    framesize: 10,
    led_intensity: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

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

  // Carregar configurações quando conectado
  useEffect(() => {
    if (isConnected) {
      loadCurrentSettings();
    }
  }, [isConnected]);

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
    <View style={styles.controlItem}>
      <ThemedText style={styles.controlLabel}>{title}: {value}</ThemedText>
      <View style={styles.sliderContainer}>
        {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
          const sliderValue = min + (i * step);
          const isActive = value === sliderValue;
          
          return (
            <View
              key={sliderValue}
              style={[
                styles.sliderButton,
                isActive && styles.sliderButtonActive
              ]}
              onTouchEnd={() => applySetting(variable, sliderValue)}
            />
          );
        })}
      </View>
    </View>
  );

  if (!isConnected) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          Conecte-se ao ESP32-CAM para ver os controles
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Controles da Câmera</ThemedText>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ControlSlider
          title="Qualidade"
          variable="quality"
          value={settings.quality}
          min={4}
          max={63}
        />
        
        <ControlSlider
          title="Brilho"
          variable="brightness"
          value={settings.brightness}
          min={-2}
          max={2}
        />
        
        <ControlSlider
          title="Contraste"
          variable="contrast"
          value={settings.contrast}
          min={-2}
          max={2}
        />
        
        <ControlSlider
          title="Saturação"
          variable="saturation"
          value={settings.saturation}
          min={-2}
          max={2}
        />
        
        <ControlSlider
          title="Resolução"
          variable="framesize"
          value={settings.framesize}
          min={0}
          max={13}
        />
        
        <ControlSlider
          title="LED"
          variable="led_intensity"
          value={settings.led_intensity}
          min={0}
          max={255}
          step={25}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  controlItem: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sliderButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#999',
  },
  sliderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
