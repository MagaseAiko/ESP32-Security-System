# ESP32-CAM Viewer 📱

  

Um aplicativo React Native (Expo) para visualizar e controlar câmeras ESP32-CAM localmente ou via túnel Ngrok.

  

## 🚀 Funcionalidades

  

- **Conectar via IP ou Ngrok**: Insira o IP local do ESP32-CAM (ex: 192.168.15.200) ou uma URL do Ngrok para acesso remoto.

- **Stream de Vídeo MJPEG**: Stream na porta 81 (para IP local) ou via Ngrok. Na web usamos `expo-image`, em mobile usamos `WebView`.

- **Captura de Fotos**: A captura faz uma requisição ao endpoint `/capture`. No mobile a foto é salva na galeria com `expo-media-library`; no web é feita o download do arquivo.

- **Controles da Câmera**: Ajuste parâmetros (qualidade, brilho, contraste, saturação, resolução, intensidade do LED) via sliders que chamam o endpoint `/control`.

- **Reset WiFi**: Botão para resetar o WiFi do ESP32 (endpoint `/reset`).

- **Detecção e Suporte a Ngrok**: O app detecta automaticamente URLs do Ngrok e ajusta as URLs de requisição para HTTPS.

  

## 📋 Pré-requisitos

  

- Node.js 16+ (ou compatíveis)

- Expo CLI (ou eas / expo dev client se necessário)

- Dispositivo ESP32-CAM configurado e na mesma rede (para acesso local)

- Opcional: conta e cliente do Ngrok para acesso remoto (veja `NGROK_SETUP.md`)

- Dispositivo (Android/iOS) com Expo Go ou build de desenvolvimento

  

## 🛠️ Instalação e execução

  

1. Clone o repositório e navegue para a pasta do aplicativo:

  

```bash

git clone <repo-url>

cd ESP32-CAM

```

  

2. Instale as dependências:

  

```bash

npm install

```

  

3. Execute o app em modo de desenvolvimento:

  

```bash

npx expo start

# ou para web/mobile

npm run web

npm run android

npm run ios

```

  

4. Abra com Expo Go (Android/iOS) ou no navegador para web (`w`).

  

## 📱 Como Usar

  

### 1. Conectar ao ESP32-CAM

  

- Na aba "Câmera", digite o endereço IP do ESP32-CAM (ex: 192.168.15.200) ou cole a URL de um túnel Ngrok (ex: `https://xxxxx.ngrok-free.app`).

- Toque em **Conectar** para testar a conectividade (o app testa o endpoint `/capture` por padrão).

- Se estiver usando Ngrok e vir uma página de confirmação no navegador, abra o link (opção “Abrir Link”) e confirme para desbloquear o túnel, então tente conectar novamente.

  

### 2. Visualizar Stream de Vídeo

  

- Após conectar, o stream de vídeo aparece automaticamente.

- Observações por plataforma:

   - Web: o stream é exibido usando `expo-image` consumindo diretamente a URL do MJPEG (`/stream`).

   - Mobile: o stream é mostrado em um `WebView` apontando para o endpoint `/stream` (porta 81 para IP local).

  

### 3. Capturar Fotos

  

- Toque no botão de captura (ícone da câmera) para fazer uma requisição ao endpoint `/capture`.

- Comportamento por plataforma:

   - Mobile: a foto é salva na galeria usando `expo-media-library` (o app pede permissão quando necessário).

   - Web: o arquivo é baixado automaticamente para o cliente.

- Em caso de falha, verifique a conectividade e permissões de gravação.

  

### 4. Ajustar Configurações

  

- Vá para a aba "Controles" e ajuste os sliders para aplicar as variáveis via endpoint `/control`.

- Parâmetros e faixas:

   - **Qualidade** (`quality`): 4-63

   - **Brilho** (`brightness`): -2 a 2

   - **Contraste** (`contrast`): -2 a 2

   - **Saturação** (`saturation`): -2 a 2

   - **Resolução / Frame Size** (`framesize`): 0-13

   - **LED** (`led_intensity`): 0-255 (passo configurável: 25)

  

- Observação: os sliders atualizam via `GET` no endpoint `/control?var=<name>&val=<value>` conforme implementado.

  

## 🔧 Configuração do ESP32-CAM

  

O app assume as seguintes configurações padrão no dispositivo ESP32-CAM:

  

- **Servidor HTTP** (endpoints) normalmente sem número de porta (80).

- **Stream MJPEG**: porta 81 para o stream (`/stream`).

- **Endpoints implementados**:

   - `/status` - endpoint retornando JSON com parâmetros atuais da câmera (used to fill sliders)

   - `/capture` - captura instantânea (used for test and photo capture)

   - `/stream` - MJPEG stream

   - `/control` - ajuste de variáveis via query string

   - `/reset` - rota opcional usada pelo botão “Reset WiFi” (o app chama `/reset` via `GET`).

  

Importante: os endpoints são chamados com `http://<ip>/...` para IP local e `https://<ngrok-url>/...` para Ngrok.

  
  

## 📁 Estrutura do Projeto

  

```

ESP32-CAM/

├── app/                    # Telas e rotas (expo-router)

│   ├── (tabs)/             # Navegação por abas

│   │   ├── index.tsx       # Tela principal: conectar e stream

   │   └── explore.tsx     # Tela de controles (sliders e reset)

│   └── _layout.tsx        # Layout raiz

├── components/             # Componentes reutilizáveis

│   ├── VideoStream.tsx     # Componente do stream de vídeo (WebView / Image)

│   ├── CameraCapture.tsx   # Componente para capturar foto

│   ├── CameraControls.tsx  # Componente para ajustes da câmera


# ESP32-CAM Viewer 📱

Um aplicativo React Native (Expo) para visualizar e controlar câmeras ESP32-CAM localmente ou via túnel Ngrok.

## 🚀 Funcionalidades

- **Conectar via IP ou Ngrok**: Insira o IP local do ESP32-CAM (ex: 192.168.15.200) ou uma URL do Ngrok para acesso remoto.

- **Stream de Vídeo MJPEG**: Stream na porta 81 (para IP local) ou via Ngrok. Na web usamos `expo-image`, em mobile usamos `WebView`.

- **Captura de Fotos**: A captura faz uma requisição ao endpoint `/capture`. No mobile a foto é salva na galeria com `expo-media-library`; no web é feita o download do arquivo.

- **Controles da Câmera**: Ajuste parâmetros (qualidade, brilho, contraste, saturação, resolução, intensidade do LED) via sliders que chamam o endpoint `/control`.

- **Reset WiFi**: Botão para resetar o WiFi do ESP32 (endpoint `/reset`).

- **Detecção e Suporte a Ngrok**: O app detecta automaticamente URLs do Ngrok e ajusta as URLs de requisição para HTTPS.

## 📋 Pré-requisitos

- Node.js 16+ (ou compatíveis)
- Expo CLI (ou eas / expo dev client se necessário)
- Dispositivo ESP32-CAM configurado e na mesma rede (para acesso local)
- Opcional: conta e cliente do Ngrok para acesso remoto (veja `NGROK_SETUP.md`)
- Dispositivo (Android/iOS) com Expo Go ou build de desenvolvimento

## 🛠️ Instalação e execução

1. Clone o repositório e navegue para a pasta do aplicativo:

```bash
git clone <repo-url>
cd ESP32-CAM
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o app em modo de desenvolvimento:

```bash
npx expo start
# ou para web/mobile
npm run web
npm run android
npm run ios
```

4. Abra com Expo Go (Android/iOS) ou no navegador para web (`w`).

## 📱 Como Usar

### 1. Conectar ao ESP32-CAM

- Na aba "Câmera", digite o endereço IP do ESP32-CAM (ex: 192.168.15.200) ou cole a URL de um túnel Ngrok (ex: `https://xxxxx.ngrok-free.app`).
- Toque em **Conectar** para testar a conectividade (o app testa o endpoint `/capture` por padrão).
- Se estiver usando Ngrok e vir uma página de confirmação no navegador, abra o link (opção “Abrir Link”) e confirme para desbloquear o túnel, então tente conectar novamente.

### 2. Visualizar Stream de Vídeo

- Após conectar, o stream de vídeo aparece automaticamente.
- Observações por plataforma:
	- Web: o stream é exibido usando `expo-image` consumindo diretamente a URL do MJPEG (`/stream`).
	- Mobile: o stream é mostrado em um `WebView` apontando para o endpoint `/stream` (porta 81 para IP local).

### 3. Capturar Fotos

- Toque no botão de captura (ícone da câmera) para fazer uma requisição ao endpoint `/capture`.
- Comportamento por plataforma:
	- Mobile: a foto é salva na galeria usando `expo-media-library` (o app pede permissão quando necessário).
	- Web: o arquivo é baixado automaticamente para o cliente.
- Em caso de falha, verifique a conectividade e permissões de gravação.

### 4. Ajustar Configurações

- Vá para a aba "Controles" e ajuste os sliders para aplicar as variáveis via endpoint `/control`.
- Parâmetros e faixas:
	- **Qualidade** (`quality`): 4-63
	- **Brilho** (`brightness`): -2 a 2
	- **Contraste** (`contrast`): -2 a 2
	- **Saturação** (`saturation`): -2 a 2
	- **Resolução / Frame Size** (`framesize`): 0-13
	- **LED** (`led_intensity`): 0-255 (passo configurável: 25)
- Observação: os sliders atualizam via `GET` no endpoint `/control?var=<name>&val=<value>` conforme implementado.

## 🔧 Configuração do ESP32-CAM

O app assume as seguintes configurações padrão no dispositivo ESP32-CAM:

- **Servidor HTTP** (endpoints) normalmente sem número de porta (80).
- **Stream MJPEG**: porta 81 para o stream (`/stream`).
- **Endpoints implementados**:
	- `/status` - endpoint retornando JSON com parâmetros atuais da câmera (used to fill sliders)
	- `/capture` - captura instantânea (used for test and photo capture)
	- `/stream` - MJPEG stream
	- `/control` - ajuste de variáveis via query string
	- `/reset` - rota opcional usada pelo botão “Reset WiFi” (o app chama `/reset` via `GET`).

Importante: os endpoints são chamados com `http://<ip>/...` para IP local e `https://<ngrok-url>/...` para Ngrok.

## 📁 Estrutura do Projeto

```
ESP32-CAM/
├── app/                     # Telas e rotas (expo-router)
│   ├── (tabs)/              # Navegação por abas
│   │   ├── index.tsx        # Tela principal: conectar e stream
│   │   └── explore.tsx      # Tela de controles (sliders e reset)
│   └── _layout.tsx          # Layout raiz
├── components/              # Componentes reutilizáveis
│   ├── VideoStream.tsx      # Componente do stream de vídeo (WebView / Image)
│   ├── CameraCapture.tsx    # Componente para capturar foto
│   ├── CameraControls.tsx   # Componente para ajustes da câmera
│   └── NgrokInfo.tsx        # Dicas e botão para abrir ngrok.com
├── contexts/                # Contextos React
│   ├── ESP32Context.tsx     # Estado e geração de URLs para endpoints
│   └── ThemeContext.tsx     # Tema claro/escuro
├── components/ui/           # Ícones e utilitários de UI
├── scripts/                 # Utilitários (ex: reset-project.js)
├── package.json
└── NGROK_SETUP.md
```

## 🛠️ Desenvolvimento

### Como estender o app

1. **Novos Controles**: Adicione sliders ou inputs em `CameraControls.tsx` e ajuste o `applySetting` para chamar `/control` com a nova variável.
2. **Novos Endpoints / Estado**: Extenda `ESP32Context.tsx` para analisar mais endpoints ou parâmetros caso seu firmware ofereça novos dados.
3. **Novas Telas**: Crie novas rotas em `app/` e atualize `_layout.tsx` para adicionar navegação.

### Dependências principais (extra-oficial)

- `expo`, `expo-router`, `expo-image`, `expo-media-library`, `expo-file-system`
- `@react-native-async-storage/async-storage`, `@react-navigation/*`
- `react-native-webview`, `react-native-video` (se precisar de reprodução customizada)
- TypeScript para tipagem (veja `tsconfig.json`).

## 🐛 Solução de Problemas

### Erro de Conexão

- Verifique se o ESP32-CAM está na mesma rede local que seu celular/PC.
- Confirme o endereço IP ou a URL do Ngrok.
- Teste no navegador: `http://<IP>/status` (para local) ou `https://<ngrok-url>/status` (para Ngrok).

### Ngrok retorna 403 (página de confirmação)

- Se o Ngrok exibir uma página de confirmação, abra a URL no navegador e confirme (clique em “Visit site”), depois tente conectar novamente no app.

### Stream não carrega

- Verifique se a porta 81 está aberta no ESP32-CAM (ou se o Ngrok está encaminhando corretamente para a porta 81).
- Teste o `/stream` no navegador ou por `curl`.

### Captura não salva / Permissão negada

- No mobile, permissão de mídia é pedida pelo `expo-media-library`. Verifique se as permissões foram concedidas.
- No web, o arquivo é baixado via link — verifique se o navegador o bloqueou.

### Reset WiFi não funciona

- O endpoint `/reset` precisa estar implementado no firmware ESP32 para que o botão funcione. Caso não exista, o botão retornará erro.

### Logs e depuração

- Use os logs do console (`npx expo start`) para ver mensagens de erro no cliente e no WebView/Web console.

---

## Dicas e observações finais

- URLs do Ngrok gratuito mudam a cada reinicialização — salve a URL atual se precisar usá-la com frequência.
- Para produção, considere usar um domínio ou servidor reverso persistente em vez do Ngrok gratuito.
- Se quiser suportar autenticação ou endpoints adicionais, atualize `ESP32Context.tsx` e `CameraControls.tsx` para incluir novos parâmetros e lógica.

Se quiser que eu atualize ou complemente qualquer parte do README com screenshots, exemplos de payloads JSON ou um guia detalhado para configurar o firmware do ESP32, me diga e eu adiciono.