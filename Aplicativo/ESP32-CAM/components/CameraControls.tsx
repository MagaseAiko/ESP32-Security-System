import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
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
  const { controlUrl, statusUrl, isConnected } = useESP32();
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
    <View style={styles.controlItemMinimal}>
      <ThemedText style={[styles.controlLabelMinimal, { color: theme === 'dark' ? '#ECEDEE' : '#222' }]}>{title}: <ThemedText style={{fontWeight:'bold'}}>{value}</ThemedText></ThemedText>
      <View style={styles.sliderContainerMinimal}>
        {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
          const sliderValue = min + (i * step);
          const isActive = value === sliderValue;
          return (
            <TouchableOpacity
              key={sliderValue}
              style={[styles.sliderButtonMinimal, 
                isActive && (theme === 'dark' ? styles.sliderButtonActiveDark : styles.sliderButtonActiveLight)
              ]}
              onPress={() => applySetting(variable, sliderValue)}
              activeOpacity={0.8}
              accessibilityLabel={`Ajustar ${title} para ${sliderValue}`}
            />
          );
        })}
      </View>
    </View>
  );

  if (!isConnected) {
    return null;
  }

  return (
    <ThemedView style={[styles.containerMinimal, { backgroundColor: theme === 'dark' ? '#23272b' : '#fff', borderColor: theme === 'dark' ? '#23272b' : '#fff', borderRadius: 18, padding: 20, marginHorizontal: 0, marginBottom: 0, elevation: 0 }] }>
      <ScrollView style={styles.scrollViewMinimal} showsVerticalScrollIndicator={false}>
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
  containerMinimal: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  scrollViewMinimal: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controlItemMinimal: {
    marginBottom: 22,
    alignItems: 'stretch',
  },
  controlLabelMinimal: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  sliderContainerMinimal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  sliderButtonMinimal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginHorizontal: 1,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
    transitionProperty: 'background-color, border-color',
    transitionDuration: '120ms',
  },
  sliderButtonActiveLight: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sliderButtonActiveDark: {
    backgroundColor: '#2d7cf7',
    borderColor: '#2d7cf7',
  },
});
