# ESP32 Security System — ESP32-CAM + Viewer App 📸📱

Uma solução completa de vigilância para monitoramento local ou remoto baseada em ESP32-CAM (AI-Thinker) e um aplicativo React Native (Expo) para visualização e controle.

Este repositório contém dois projetos principais:

- `CameraWebServer/` — Código do firmware para ESP32-CAM (C++ / Arduino), servidor web com endpoints REST, stream MJPEG e UI embutida.
- `Aplicativo/ESP32-CAM/` — Aplicativo React Native (Expo) para conectar à câmera, exibir stream MJPEG, capturar fotos e ajustar configurações.

---

## 🚀 Funcionalidades Principais

- Stream MJPEG ao vivo: `/stream` (porta 81 para o stream no firmware) — exibido no app por `WebView` no mobile e `expo-image` no web.
- Captura de imagem via HTTP: `/capture` (JPEG), `/bmp` (BMP).
- API REST para status e controles: `/status`, `/control`, `/xclk`, `/reg`, `/pll`, `/resolution`, `/reset`.
- Página web embutida para preview e configuração (quando em AP mode) em `/`.
- Gerenciamento de WiFi: modo STA + AP de configuração (`ESP32-CAM-Config`).
- Aplicativo mobile: conectar por IP local ou URL do Ngrok para acesso remoto, salvamento de fotos no aparelho, sliders para ajuste das variáveis da câmera.

---

## 🧭 Estrutura do Repositório

```
ESP32-Security-System/
├── Aplicativo/
│   └── ESP32-CAM/          # App React Native (Expo)
├── CameraWebServer/        # Firmware ESP32-CAM (Arduino/C++)
└── README.md               # Este arquivo
```

---

## 📋 Pré-requisitos

- Node.js 16+ (para o app)
- Expo CLI / eas (para executar e buildar o app)
- Conta e cliente do Ngrok (opcional, para acesso remoto)
- Arduino IDE ou PlatformIO (para compilar/upload do firmware)
- ESP32-CAM (AI-Thinker) com PSRAM recomendado para resoluções maiores
- Conversor USB-Serial (FTDI/PL2303) para programar o ESP32-CAM

---

## 🔧 Instalando e Executando

### 1) Firmware (ESP32-CAM)

1. Abra a pasta `CameraWebServer/` no Arduino IDE ou PlatformIO.
2. Certifique-se de selecionar a placa correta (ex.: "AI Thinker ESP32-CAM" ou "ESP32 Wrover Module"). Habilite PSRAM quando disponível.
3. Ajuste `board_config.h` ou `camera_pins.h` caso utilize outro modelo de câmera.
4. Carregue o sketch `CameraWebServer.ino` no ESP32.

Exemplo de cURL (PowerShell):
```powershell
curl "http://<IP>/capture" -o capture.jpg
curl "http://<IP>:81/stream"  # abre o stream (ou no browser)
```

### 2) Aplicativo (React Native / Expo)

1. Vá para `Aplicativo/ESP32-CAM/`
2. Instale dependências:
```bash
npm install
```
3. Execute o app em dev:
```bash
npx expo start
# ou para rodar direto nas plataformas
npm run web
npm run android
npm run ios
```
4. Abra com Expo Go (Android/iOS) ou no navegador para web (`w`).

---

## 📱 Como Usar (App)

- Conexão: insira o IP local do ESP32-CAM (ex.: `192.168.15.200`) ou cole a URL do Ngrok (ex.: `https://xxxxx.ngrok-free.app`) e pressione **Conectar** (testa `/capture`).
- Visualizar stream: o app configura as URLs para usar `http` para IP local e `https` para Ngrok; no web usamos `expo-image`, no mobile um `WebView` aponta para `/stream`.
- Capturar foto: botão de captura chama `/capture`. No mobile a foto é salva na galeria via `expo-media-library`; no web é feito download do arquivo.
- Ajustar controles: aba “Controles” ajusta sliders que fazem chamadas `GET` em `/control?var=<name>&val=<value>`.
- Reset WiFi: botão que chama `/reset` para limpar credenciais e forçar modo AP.

### Parâmetros comuns (sliders)

- `quality` (JPEG quality): 4–63
- `brightness`: -2 a 2
- `contrast`: -2 a 2
- `saturation`: -2 a 2
- `framesize`: 0–13 (resolução)
- `led_intensity`: 0–255

---

## 📡 Endpoints (firmware)

- `GET /` — UI embutida
- `GET /status` — JSON com parâmetros atuais
- `GET /stream` — MJPEG stream (porta 81)
- `GET /capture` — captura JPEG
- `GET /bmp` — captura BMP
- `GET /control?var=<param>&val=<value>` — altera parâmetros
- `GET /xclk?xclk=<MHz>` — altera a frequência XCLK
- `GET /reg?...` — leitura/escrita de registradores do sensor
- `GET /reset` — reseta credenciais WiFi e volta ao AP mode

---

## 🧰 Hardware e Conexão

- Alimentação: 5V estável (ESP32-CAM costuma requerer corrente adequada)
- Programação: conversor USB-Serial TTL (5V/3.3V) — cuidado com níveis de tensão
- Pinos padrão para AI-Thinker (ver `camera_pins.h`) — LED flash default GPIO 4

---

## 🐛 Solução de Problemas (Rápido)

- Erro de conexão: verifique se ESP32-CAM e dispositivo com app estão na mesma rede.
- Ngrok 403: abra a URL no navegador e confirme o aviso (Visit site) antes de tentar conectar no app.
- Stream não carrega: verifique porta 81, firewall, e que `/stream` funciona via navegador.
- Captura não salva: verifique permissões de `expo-media-library` no mobile; no web verifique bloqueios de download.
- Reset WiFi não funciona: confirme que o endpoint `/reset` foi implementado no firmware.

---

## 📈 Metodologia e Resultados

O projeto foi implementado com ESP32-CAM programado em C++ (IDE Arduino / PlatformIO) e um aplicativo React Native/Expo. A comunicação utiliza HTTP e MJPEG stream via Wi-Fi. Em testes o sistema apresentou transmissão estável com latência aceitável para monitoramento residencial. Limitações observadas:

- Operação principalmente em redes locais (Ngrok usado para acesso remoto — gratuito tem limitações).
- Ausência de processamento avançado (detecção de movimento/objetos) — possibilidade de expansão futura.

---

## ✅ Conclusão e Trabalhos Futuros

- O projeto oferece uma solução viável, de baixo custo, para vigilância usando ESP32-CAM com um app móvel funcional.
- Possíveis melhorias:
	- Detecção de movimento inteligente (on-device ou backend)
	- Integração com notificações push
	- Armazenamento em nuvem seguro
	- Suporte a múltiplas câmeras
	- Autenticação e TLS para comunicação segura (especialmente para produção)

---