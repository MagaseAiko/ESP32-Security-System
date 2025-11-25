
# ESP32-CAM — Camera Web Server

Versão simples de servidor de câmera para módulos ESP32-CAM (AI-Thinker), com streaming MJPEG, captura de imagens, e uma página web embutida para controle e configuração.

## ✅ Funcionalidades principais

- Stream MJPEG ao vivo: `/stream` (multipart/x-mixed-replace)
- Captura de imagem JPEG: `/capture`
- Captura de imagem BMP: `/bmp`
- Página web com interface (UI embutida) em `/` — inclui preview e controles básicos
- API REST simples para estatísticas e controle da câmera: `/status`, `/control`, `/xclk`, `/reg`, `/greg`, `/pll`, `/resolution`, `/reset`.
- Gerenciamento de WiFi (modo STA + modo AP de configuração): SSID do AP padrão `ESP32-CAM-Config` e página de configuração em `http://192.168.4.1`.
- Salva credenciais em Preferences no flash; suporta IP estático calculado com base no gateway real (último octeto configurável).
- Suporte a LED flash (LED_GPIO_NUM definido em `camera_pins.h`) — intensidade controlável via API.

---

## 🧩 Hardware suportado

- ESP32-CAM (AI-Thinker) — o projeto assume `CAMERA_MODEL_AI_THINKER` por padrão em `board_config.h`.
- Pinos estão definidos em `camera_pins.h` (para AI-Thinker):

	- PWDN: 32
	- RESET: -1 (não conectado)
	- XCLK: 0
	- SIOD: 26
	- SIOC: 27
	- Y9..Y2 / VSYNC / HREF / PCLK atribuídos conforme `camera_pins.h`
	- LED flash: GPIO 4 (por padrão; se presente)

> Dica: Se você estiver usando outro modelo, atualize `board_config.h` e `camera_pins.h` conforme necessário.

---

## 🔌 Ligação e alimentação

- Alimente a placa ESP32-CAM com 5V (ou conforme seu módulo) e GND.
- Para programação via USB-Serial (FTDI, PL2303, etc.) use um conversor TTL com 5V/3.3V compatível com a sua placa — e não conecte TX/RX inadequadamente.
- Se o seu módulo não tiver PSRAM, a resolução padrão será reduzida para reduzir o consumo de memória.

---

## 🛠️ Preparação, compilação e upload

Usando Arduino IDE:

1. Instale o suporte ao ESP32 (Espressif board package) e selecione a placa apropriada (ex.: "AI Thinker ESP32-CAM" ou "ESP32 Wrover Module").
2. Ative PSRAM (se disponível) nas configurações de placa para melhor desempenho.
3. Carregue o sketch `CameraWebServer.ino`.

Usando PlatformIO (VSCode):

1. Selecione a environment correspondente (ex.: `ai-thinker` ou `wrover`).
2. Compile e faça upload normalmente.

---

## 📶 WiFi / configuração

Ao iniciar, o sketch tenta usar credenciais WiFi salvas (armazenadas com `Preferences`). Se não houver credenciais, o dispositivo entra em modo AP `ESP32-CAM-Config` com a página de configuração:

- Conecte-se ao SSID: `ESP32-CAM-Config`
- Acesse: `http://192.168.4.1` e preencha SSID e Senha da sua rede WiFi.

Após salvar as credenciais, o dispositivo tenta conectar-se à sua rede. Se bem-sucedido, ele pode calcular e aplicar um IP estático com base no gateway real usando `desiredStaticHost` (último octeto — por padrão `200`).

No código:

- `wifiManager.setDesiredStaticHost(uint8_t host)` — altera o último octeto desejado para um IP fixo calculado (por padrão `200`).
- `wifiManager.setStaticIP(localIP, gateway, subnet, primaryDNS, secondaryDNS)` — aplica um IP estático explicitamente.

Se houver falhas ao conectar com suas credenciais salvas, o dispositivo volta ao modo AP para reconfiguração.

---

## 🌐 Endpoints HTTP e exemplos

Abra o browser apontando para o IP do ESP32 (será impresso no monitor Serial ao conectar) ou use cURL:

- Interface web: http://<IP>/ (UI embutida)
- Stream MJPEG: http://<IP>/stream
- Captura JPEG: http://<IP>/capture
- Captura BMP: http://<IP>/bmp
- Status (JSON): http://<IP>/status

Controle de parâmetros da câmera (GET):

- Endereço: `/control?var=<param>&val=<value>`
- Exemplos:
	- Alterar framesize: `http://<IP>/control?var=framesize&val=4` (val conforme framesize_t enum — ex. QVGA/VGA/SVGA)
	- Ajustar qualidade JPEG: `http://<IP>/control?var=quality&val=10`
	- LED flash intensidade: `http://<IP>/control?var=led_intensity&val=200` (0–255)

Outros endpoints úteis:

- `GET /xclk?xclk=<MHz>` — altera XCLK via LEDC timer. Ex.: `http://<IP>/xclk?xclk=40`
- `GET /reg?reg=<hex>&mask=<hex>&val=<hex>` — escreve um registrador do sensor
- `GET /greg?reg=<hex>&mask=<hex>` — lê um registrador do sensor
- `GET /pll?...` — configura parâmetros de PLL do sensor (parâmetros consultáveis no código)
- `GET /resolution?...` — ajusta a janela de captura/resolução (parâmetros `sx, sy, ex, ey, ...`)
- `GET /reset` — reseta credenciais WiFi e reinicia em modo configuração (AP)

Exemplo em cURL para captura:

```powershell
curl "http://<IP>/capture" -o capture.jpg
curl "http://<IP>:81/stream"  # abre o stream (ou no browser)
```

Exemplo para mudar framesize (sample):

```powershell
curl "http://<IP>/control?var=framesize&val=5"
```

---

## ⚙️ Configuração em tempo de execução e limites

- O sketch detecta PSRAM em `setup()` e ajusta `jpeg_quality`, `fb_count` e `grab_mode` para melhor desempenho quando PSRAM disponível.
- Sem PSRAM, a tela é ajustada para tamanhos menores (para evitar OOM). Use PSRAM para resoluções maiores (ex: UXGA, SVGA).
- Use a rota `/status` para obter valores atuais do sensor e confirmar parâmetros.

---

## 🗂 Arquivos importantes

- `CameraWebServer.ino` — principal sketch/entrypoint.
- `app_httpd.cpp` — registro de endpoints e rotas HTTP.
- `wifi_manager.cpp` / `wifi_manager.h` — gerenciamento de WiFi: AP, armazenamento de credenciais e servidor de configuração.
- `camera_pins.h` / `board_config.h` — mapeamento de pinos por modelo de câmera (por padrão: AI-Thinker).
- `camera_index.h` — assets da UI web embutida (Índice/HTML gzipado).

---

## ❗ Dicas e troubleshooting

- Se a câmera não inicializar, verifique a alimentação (ESP32-CAM pode precisar de fonte estável de 5V com corrente suficiente).
- Se o upload falhar (com erros de memória), tente selecionar a placa "ESP32 Wrover Module" e ative PSRAM (se o módulo suportar).
- Se o streaming estiver vazio: verifique `Serial Monitor` para erros de `esp_camera_init()` ou mensagens de erro no log.
- Para restaurar a configuração WiFi, acesse `http://<IP>/reset` (ou a página de configuração no AP mode).

