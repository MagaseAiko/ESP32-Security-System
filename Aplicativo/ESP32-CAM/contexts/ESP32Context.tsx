import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ESP32ContextType {
  esp32Url: string;
  setEsp32Url: (url: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  streamUrl: string;
  captureUrl: string;
  statusUrl: string;
  controlUrl: string;
  isNgrokUrl: boolean;
  baseUrl: string;
}

const ESP32Context = createContext<ESP32ContextType | undefined>(undefined);

interface ESP32ProviderProps {
  children: ReactNode;
}

export function ESP32Provider({ children }: ESP32ProviderProps) {
  const [esp32Url, setEsp32UrlState] = useState<string>('192.168.15.200');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Função para detectar se é uma URL do Ngrok
  const isNgrokUrl = (url: string): boolean => {
    return url.includes('ngrok') || (url.startsWith('https://') && !url.includes('192.168.') && !url.includes('10.') && !url.includes('172.'));
  };

  // Função para normalizar a URL base
  const normalizeUrl = (url: string): string => {
    // Se for uma URL completa do Ngrok, usar como está
    if (isNgrokUrl(url)) {
      // Remover protocolo se presente para normalizar
      return url.replace(/^https?:\/\//, '');
    }
    // Se for apenas IP, adicionar protocolo HTTP
    return url;
  };

  // Detectar se a URL atual é do Ngrok
  const isNgrok = isNgrokUrl(esp32Url);
  
  // URL base normalizada
  const baseUrl = normalizeUrl(esp32Url);

  // URLs derivadas da URL base
  const streamUrl = isNgrok 
    ? `https://${baseUrl}/stream`
    : `http://${baseUrl}:81/stream`;
  const captureUrl = isNgrok 
    ? `https://${baseUrl}/capture`
    : `http://${baseUrl}/capture`;
  const statusUrl = isNgrok 
    ? `https://${baseUrl}/status`
    : `http://${baseUrl}/status`;
  const controlUrl = isNgrok 
    ? `https://${baseUrl}/control`
    : `http://${baseUrl}/control`;

  const setEsp32Url = async (url: string) => {
    setEsp32UrlState(url);
    await AsyncStorage.setItem('esp32_url', url);
  };

  // Carregar URL salva ao inicializar
  useEffect(() => {
    const loadSavedUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('esp32_url');
        if (savedUrl) {
          setEsp32UrlState(savedUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar URL salva:', error);
      }
    };
    loadSavedUrl();
  }, []);

  return (
    <ESP32Context.Provider
      value={{
        esp32Url,
        setEsp32Url,
        isConnected,
        setIsConnected,
        streamUrl,
        captureUrl,
        statusUrl,
        controlUrl,
        isNgrokUrl: isNgrok,
        baseUrl,
      }}
    >
      {children}
    </ESP32Context.Provider>
  );
}

export function useESP32() {
  const context = useContext(ESP32Context);
  if (context === undefined) {
    throw new Error('useESP32 deve ser usado dentro de um ESP32Provider');
  }
  return context;
}
