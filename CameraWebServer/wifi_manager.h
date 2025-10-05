#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include <Preferences.h>
#include <WebServer.h>
#include <DNSServer.h>

class WiFiManager {
private:
    Preferences preferences;
    WebServer* server;
    DNSServer* dnsServer;
    
    // Configurações
    String apSSID;
    String apPassword;
    String savedSSID;
    String savedPassword;
    
    // Estados
    bool hasStoredCredentials;
    bool hasConnectedOnce;
    bool configMode;
    int connectionAttempts;
    int maxConnectionAttempts;
    uint8_t desiredStaticHost;
    IPAddress defaultPrimaryDNS;
    IPAddress defaultSecondaryDNS;
    
    // HTML da página de configuração
    String getConfigPageHTML();
    String getSuccessPageHTML();
    String getErrorPageHTML();
    
public:
    WiFiManager();
    ~WiFiManager();
    
    // Inicialização
    bool begin();
    void startAP();
    void stopAP();
    
    // Gerenciamento de credenciais
    bool hasStoredWiFi();
    bool loadStoredCredentials();
    void saveCredentials(const String& ssid, const String& password);
    void clearCredentials();
    
    // Conexão WiFi
    bool connectToWiFi();
    bool connectToWiFi(const String& ssid, const String& password);
    void handleWiFiConnection();
    
    // Servidor web para configuração
    void startConfigServer();
    void stopConfigServer();
    void handleConfigServer();
    bool isConfigModeActive();
    
    // Getters
    String getCurrentSSID();
    bool isConnected();
    bool hasConnectedBefore();
    
    // Reset manual
    void resetWiFi();
    
    // Configuração de IP estático
    bool setStaticIP(IPAddress localIP, IPAddress gateway, IPAddress subnet, IPAddress primaryDNS, IPAddress secondaryDNS);
    // Define o último octeto desejado para IP fixo (ex: 200)
    void setDesiredStaticHost(uint8_t host);
    // Calcula um IP fixo baseado no gateway real e tenta aplicar (usa desiredStaticHost)
    bool computeAndApplyStaticIP();
};

#endif
