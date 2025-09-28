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
}

const ESP32Context = createContext<ESP32ContextType | undefined>(undefined);

interface ESP32ProviderProps {
  children: ReactNode;
}

export function ESP32Provider({ children }: ESP32ProviderProps) {
  const [esp32Url, setEsp32UrlState] = useState<string>('192.168.15.200');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // URLs derivadas da URL base
  const streamUrl = `http://${esp32Url}:81/stream`;
  const captureUrl = `http://${esp32Url}/capture`;
  const statusUrl = `http://${esp32Url}/status`;
  const controlUrl = `http://${esp32Url}/control`;

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
