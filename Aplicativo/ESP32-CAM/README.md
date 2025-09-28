# ESP32-CAM Viewer 📱

Um aplicativo React Native com Expo para visualizar e controlar câmeras ESP32-CAM remotamente.

## 🚀 Funcionalidades

- **Conexão com ESP32-CAM**: Conecte-se facilmente ao seu dispositivo ESP32-CAM via IP
- **Stream de Vídeo**: Visualize o stream de vídeo em tempo real da câmera
- **Captura de Fotos**: Capture fotos diretamente da câmera e salve na galeria
- **Controles da Câmera**: Ajuste qualidade, brilho, contraste, saturação e outros parâmetros
- **Interface Intuitiva**: Design moderno e fácil de usar

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Expo CLI
- Dispositivo ESP32-CAM configurado e conectado à rede
- Dispositivo móvel com Expo Go ou desenvolvimento build

## 🛠️ Instalação

1. Clone o repositório e navegue até o diretório:
   ```bash
   cd ESP32-CAM
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start
   ```

4. Escaneie o QR code com o Expo Go (Android/iOS) ou pressione `w` para abrir no navegador.

## 📱 Como Usar

### 1. Conectar ao ESP32-CAM
- Na aba "Câmera", digite o endereço IP do seu ESP32-CAM (ex: 192.168.15.200)
- Toque em "Conectar" para estabelecer a conexão
- O aplicativo testará a conectividade automaticamente

### 2. Visualizar Stream de Vídeo
- Após conectar, o stream de vídeo aparecerá automaticamente
- O vídeo é atualizado em tempo real
- Use gestos para interagir com a visualização

### 3. Capturar Fotos
- Toque no botão de captura (ícone da câmera)
- A foto será capturada e salva na galeria do dispositivo
- Confirmação será exibida após o salvamento

### 4. Ajustar Configurações
- Vá para a aba "Controles"
- Ajuste os parâmetros da câmera:
  - **Qualidade**: 4-63 (menor = melhor qualidade)
  - **Brilho**: -2 a 2
  - **Contraste**: -2 a 2
  - **Saturação**: -2 a 2
  - **Resolução**: 0-13 (diferentes tamanhos)
  - **LED**: 0-255 (intensidade do LED)

## 🔧 Configuração do ESP32-CAM

Certifique-se de que seu ESP32-CAM está configurado com:

- **Servidor HTTP** na porta 80
- **Stream MJPEG** na porta 81
- **Endpoints disponíveis**:
  - `/status` - Status da câmera
  - `/capture` - Captura de foto
  - `/stream` - Stream de vídeo
  - `/control` - Controles da câmera

## 📁 Estrutura do Projeto

```
ESP32-CAM/
├── app/                    # Telas do aplicativo
│   ├── (tabs)/            # Navegação por abas
│   │   ├── index.tsx      # Tela principal (Câmera)
│   │   └── explore.tsx    # Tela de controles
│   └── _layout.tsx        # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── VideoStream.tsx    # Componente de stream de vídeo
│   ├── CameraCapture.tsx  # Componente de captura
│   └── CameraControls.tsx # Componente de controles
├── contexts/              # Contextos React
│   └── ESP32Context.tsx   # Contexto do ESP32-CAM
└── package.json           # Dependências do projeto
```

## 🛠️ Desenvolvimento

### Adicionando Novas Funcionalidades

1. **Novos Controles**: Adicione novos parâmetros em `CameraControls.tsx`
2. **Novos Endpoints**: Estenda o contexto em `ESP32Context.tsx`
3. **Novas Telas**: Crie arquivos na pasta `app/`

### Dependências Principais

- `expo-image`: Para exibição de imagens
- `expo-media-library`: Para salvar fotos na galeria
- `expo-file-system`: Para manipulação de arquivos
- `@react-native-async-storage/async-storage`: Para persistência de dados

## 🐛 Solução de Problemas

### Erro de Conexão
- Verifique se o ESP32-CAM está na mesma rede
- Confirme o endereço IP correto
- Teste a conectividade no navegador: `http://[IP]/status`

### Stream Não Carrega
- Verifique se a porta 81 está acessível
- Teste o stream no navegador: `http://[IP]:81/stream`
- Verifique se o ESP32-CAM está transmitindo

### Fotos Não Salvam
- Verifique as permissões de mídia
- Confirme se há espaço disponível no dispositivo

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.