#include "wifi_manager.h"

WiFiManager::WiFiManager() {
    server = nullptr;
    dnsServer = nullptr;
    apSSID = "ESP32-CAM-Config";
    apPassword = "";
    hasStoredCredentials = false;
    hasConnectedOnce = false;
    connectionAttempts = 0;
    maxConnectionAttempts = 5;
}

WiFiManager::~WiFiManager() {
    if (server) {
        delete server;
    }
    if (dnsServer) {
        delete dnsServer;
    }
}

bool WiFiManager::begin() {
    preferences.begin("wifi_config", false);
    
    // Carregar credenciais salvas
    loadStoredCredentials();
    
    // Se não há credenciais salvas, iniciar modo AP
    if (!hasStoredCredentials) {
        Serial.println("Nenhuma credencial WiFi salva. Iniciando modo AP...");
        startAP();
        return false;
    }
    
    // Tentar conectar com credenciais salvas
    if (connectToWiFi()) {
        Serial.println("Conectado ao WiFi salvo!");
        hasConnectedOnce = true;
        return true;
    } else {
        Serial.println("Falha ao conectar com WiFi salvo. Iniciando modo AP...");
        startAP();
        return false;
    }
}

void WiFiManager::startAP() {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(apSSID.c_str(), apPassword.c_str());
    
    IPAddress apIP(192, 168, 4, 1);
    WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
    
    Serial.println("Modo AP iniciado:");
    Serial.print("SSID: ");
    Serial.println(apSSID);
    Serial.print("IP: ");
    Serial.println(WiFi.softAPIP());
    
    startConfigServer();
}

void WiFiManager::stopAP() {
    if (server) {
        server->stop();
    }
    if (dnsServer) {
        dnsServer->stop();
    }
    WiFi.softAPdisconnect(true);
}

bool WiFiManager::hasStoredWiFi() {
    return preferences.getString("ssid", "").length() > 0;
}

bool WiFiManager::loadStoredCredentials() {
    savedSSID = preferences.getString("ssid", "");
    savedPassword = preferences.getString("password", "");
    hasStoredCredentials = (savedSSID.length() > 0);
    hasConnectedOnce = preferences.getBool("connected_once", false);
    return hasStoredCredentials;
}

void WiFiManager::saveCredentials(const String& ssid, const String& password) {
    preferences.putString("ssid", ssid);
    preferences.putString("password", password);
    preferences.putBool("connected_once", true);
    savedSSID = ssid;
    savedPassword = password;
    hasStoredCredentials = true;
    hasConnectedOnce = true;
    Serial.println("Credenciais salvas!");
}

void WiFiManager::clearCredentials() {
    preferences.clear();
    savedSSID = "";
    savedPassword = "";
    hasStoredCredentials = false;
    hasConnectedOnce = false;
    connectionAttempts = 0;
    Serial.println("Credenciais WiFi removidas!");
}

bool WiFiManager::connectToWiFi() {
    if (!hasStoredCredentials) {
        return false;
    }
    return connectToWiFi(savedSSID, savedPassword);
}

bool WiFiManager::connectToWiFi(const String& ssid, const String& password) {
    Serial.print("Tentando conectar ao WiFi: ");
    Serial.println(ssid);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), password.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("");
        Serial.println("WiFi conectado!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
        connectionAttempts = 0;
        return true;
    } else {
        Serial.println("");
        Serial.println("Falha na conexão WiFi!");
        connectionAttempts++;
        return false;
    }
}

void WiFiManager::handleWiFiConnection() {
    if (WiFi.status() != WL_CONNECTED) {
        if (hasStoredCredentials && !hasConnectedOnce) {
            // Primeira tentativa com novo WiFi
            if (connectionAttempts >= maxConnectionAttempts) {
                Serial.println("Muitas tentativas de conexão. Resetando WiFi...");
                clearCredentials();
                startAP();
            }
        } else if (hasStoredCredentials && hasConnectedOnce) {
            // Já conectou antes, não resetar automaticamente
            Serial.println("WiFi desconectado, mas credenciais mantidas.");
        }
    }
}

void WiFiManager::startConfigServer() {
    if (server) {
        delete server;
    }
    if (dnsServer) {
        delete dnsServer;
    }
    
    server = new WebServer(80);
    dnsServer = new DNSServer();
    
    // Configurar DNS para capturar todas as requisições
    dnsServer->start(53, "*", WiFi.softAPIP());
    
    // Rota principal - página de configuração
    server->on("/", [this]() {
        server->send(200, "text/html", getConfigPageHTML());
    });
    
    // Rota para salvar configuração
    server->on("/save", HTTP_POST, [this]() {
        String ssid = server->arg("ssid");
        String password = server->arg("password");
        
        if (ssid.length() > 0) {
            saveCredentials(ssid, password);
            server->send(200, "text/html", getSuccessPageHTML());
            
            // Aguardar um pouco e tentar conectar
            delay(2000);
            if (connectToWiFi(ssid, password)) {
                Serial.println("Conectado! Parando servidor de configuração...");
                stopAP();
            }
        } else {
            server->send(200, "text/html", getErrorPageHTML());
        }
    });
    
    // Rota para resetar WiFi
    server->on("/reset", [this]() {
        clearCredentials();
        server->send(200, "text/html", 
            "<html><body><h1>WiFi Resetado!</h1><p>Reiniciando em 3 segundos...</p>"
            "<script>setTimeout(function(){window.location.href='/';}, 3000);</script>"
            "</body></html>");
        delay(3000);
        ESP.restart();
    });
    
    server->begin();
    Serial.println("Servidor de configuração iniciado!");
}

void WiFiManager::stopConfigServer() {
    if (server) {
        server->stop();
    }
    if (dnsServer) {
        dnsServer->stop();
    }
}

void WiFiManager::handleConfigServer() {
    if (server) {
        server->handleClient();
    }
    if (dnsServer) {
        dnsServer->processNextRequest();
    }
}

String WiFiManager::getConfigPageHTML() {
    const char* html = 
        "<!DOCTYPE html>"
        "<html>"
        "<head>"
        "<meta charset=\"UTF-8\">"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
        "<title>Configuração WiFi - ESP32-CAM</title>"
        "<style>"
        "body{font-family:Arial,sans-serif;max-width:400px;margin:50px auto;padding:20px;background:#f5f5f5}"
        ".container{background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}"
        "h1{color:#333;text-align:center;margin-bottom:30px}"
        ".form-group{margin-bottom:20px}"
        "label{display:block;margin-bottom:5px;font-weight:bold;color:#555}"
        "input[type=\"text\"],input[type=\"password\"]{width:100%;padding:12px;border:2px solid #ddd;border-radius:5px;font-size:16px;box-sizing:border-box}"
        "input[type=\"text\"]:focus,input[type=\"password\"]:focus{border-color:#007bff;outline:none}"
        ".btn{width:100%;padding:12px;background:#007bff;color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;margin-bottom:10px}"
        ".btn:hover{background:#0056b3}"
        ".btn-reset{background:#dc3545}"
        ".btn-reset:hover{background:#c82333}"
        ".info{background:#e7f3ff;padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #007bff}"
        "</style>"
        "</head>"
        "<body>"
        "<div class=\"container\">"
        "<h1>🔧 Configuração WiFi</h1>"
        "<div class=\"info\">"
        "<strong>ESP32-CAM</strong><br>"
        "Configure sua rede WiFi para acessar a câmera remotamente."
        "</div>"
        "<form action=\"/save\" method=\"POST\">"
        "<div class=\"form-group\">"
        "<label for=\"ssid\">Nome da Rede (SSID):</label>"
        "<input type=\"text\" id=\"ssid\" name=\"ssid\" required>"
        "</div>"
        "<div class=\"form-group\">"
        "<label for=\"password\">Senha:</label>"
        "<input type=\"password\" id=\"password\" name=\"password\">"
        "</div>"
        "<button type=\"submit\" class=\"btn\">Conectar</button>"
        "</form>"
        "<button onclick=\"resetWiFi()\" class=\"btn btn-reset\">Resetar WiFi</button>"
        "</div>"
        "<script>"
        "function resetWiFi(){if(confirm('Tem certeza que deseja resetar as configurações WiFi?')){window.location.href='/reset'}}"
        "</script>"
        "</body>"
        "</html>";
    return String(html);
}

String WiFiManager::getSuccessPageHTML() {
    const char* html = 
        "<!DOCTYPE html>"
        "<html>"
        "<head>"
        "<meta charset=\"UTF-8\">"
        "<title>Sucesso - ESP32-CAM</title>"
        "<style>"
        "body{font-family:Arial,sans-serif;max-width:400px;margin:50px auto;padding:20px;background:#f5f5f5}"
        ".container{background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center}"
        ".success{color:#28a745;font-size:48px;margin-bottom:20px}"
        "h1{color:#333;margin-bottom:20px}"
        ".info{background:#d4edda;padding:15px;border-radius:5px;margin:20px 0;border-left:4px solid #28a745}"
        "</style>"
        "</head>"
        "<body>"
        "<div class=\"container\">"
        "<div class=\"success\">✅</div>"
        "<h1>Configuração Salva!</h1>"
        "<div class=\"info\">"
        "<strong>Conectando ao WiFi...</strong><br>"
        "Aguarde alguns segundos e acesse a câmera pelo IP da rede."
        "</div>"
        "<p>Se a conexão for bem-sucedida, você será redirecionado automaticamente.</p>"
        "</div>"
        "</body>"
        "</html>";
    return String(html);
}

String WiFiManager::getErrorPageHTML() {
    const char* html = 
        "<!DOCTYPE html>"
        "<html>"
        "<head>"
        "<meta charset=\"UTF-8\">"
        "<title>Erro - ESP32-CAM</title>"
        "<style>"
        "body{font-family:Arial,sans-serif;max-width:400px;margin:50px auto;padding:20px;background:#f5f5f5}"
        ".container{background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center}"
        ".error{color:#dc3545;font-size:48px;margin-bottom:20px}"
        "h1{color:#333;margin-bottom:20px}"
        ".info{background:#f8d7da;padding:15px;border-radius:5px;margin:20px 0;border-left:4px solid #dc3545}"
        ".btn{display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;margin-top:10px}"
        "</style>"
        "</head>"
        "<body>"
        "<div class=\"container\">"
        "<div class=\"error\">❌</div>"
        "<h1>Erro na Configuração</h1>"
        "<div class=\"info\">"
        "<strong>Dados inválidos!</strong><br>"
        "Por favor, verifique o nome da rede e tente novamente."
        "</div>"
        "<a href=\"/\" class=\"btn\">Tentar Novamente</a>"
        "</div>"
        "</body>"
        "</html>";
    return String(html);
}

String WiFiManager::getCurrentSSID() {
    return WiFi.SSID();
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

bool WiFiManager::hasConnectedBefore() {
    return hasConnectedOnce;
}

void WiFiManager::resetWiFi() {
    clearCredentials();
    ESP.restart();
}

void WiFiManager::setStaticIP(IPAddress localIP, IPAddress gateway, IPAddress subnet, IPAddress primaryDNS, IPAddress secondaryDNS) {
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Configurando IP estático...");
        WiFi.config(localIP, gateway, subnet, primaryDNS, secondaryDNS);
        delay(1000);
        Serial.print("IP estático configurado: ");
        Serial.println(WiFi.localIP());
    }
}
