import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useThemeCustom } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { ThemedView } from '@/components/themed-view';
import { CameraControls } from '@/components/CameraControls';
import { useESP32 } from '@/contexts/ESP32Context';

export default function ExploreScreen() {

  const { isConnected } = useESP32();
  const { theme } = useThemeCustom();
  const themeColors = Colors[theme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
      <ThemedView style={[styles.headerMinimal, { backgroundColor: theme === 'dark' ? '#23272b' : '#fff', borderColor: theme === 'dark' ? '#23272b' : '#fff' }] }>
        <ThemedText type="title" style={[styles.titleMinimal, { color: themeColors.text }] }>
          Controles da Câmera
        </ThemedText>
        <ThemedText style={[styles.subtitleMinimal, { color: theme === 'dark' ? '#aaa' : '#888' }] }>
          Ajuste as configurações da sua ESP32-CAM
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.cardMinimal, { backgroundColor: theme === 'dark' ? '#23272b' : '#fff', borderColor: theme === 'dark' ? '#23272b' : '#fff' }] }>
        {!isConnected ? (
          <>
            <IconSymbol name="camera.fill" size={64} color={theme === 'dark' ? '#444' : '#ccc'} />
            <ThemedText style={[styles.disconnectedText, { color: themeColors.text }] }>
              Conecte-se ao ESP32-CAM na aba Home para acessar os controles
            </ThemedText>
          </>
        ) : (
          <CameraControls />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerMinimal: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
    marginTop: 8,
  },
  titleMinimal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
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
    alignItems: 'center',
  },
  disconnectedText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
