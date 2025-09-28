import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface NgrokInfoProps {
  isVisible: boolean;
  ngrokUrl?: string;
}

export function NgrokInfo({ isVisible, ngrokUrl }: NgrokInfoProps) {
  if (!isVisible) return null;

  const openNgrokWebsite = async () => {
    try {
      await Linking.openURL('https://ngrok.com/');
    } catch (error) {
      console.error('Erro ao abrir site do Ngrok:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="globe" size={20} color="#007AFF" />
        <ThemedText style={styles.title}>Conexão via Ngrok</ThemedText>
      </View>
      
      <ThemedText style={styles.description}>
        Você está conectado via Ngrok, permitindo acesso remoto à sua câmera ESP32.
      </ThemedText>
      
      {ngrokUrl && (
        <ThemedText style={styles.urlText}>
          URL: {ngrokUrl}
        </ThemedText>
      )}
      
      <ThemedText style={styles.note}>
        💡 Dica: URLs do Ngrok mudam a cada reinicialização. Atualize quando necessário.
      </ThemedText>
      
      <TouchableOpacity style={styles.linkButton} onPress={openNgrokWebsite}>
        <IconSymbol name="safari" size={16} color="#007AFF" />
        <ThemedText style={styles.linkText}>Visitar ngrok.com</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  urlText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
