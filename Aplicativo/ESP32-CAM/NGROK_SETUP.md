# Configuração do Ngrok para ESP32-CAM

Este aplicativo agora suporta acesso remoto à sua câmera ESP32-CAM através do Ngrok, permitindo visualizar o stream de vídeo de qualquer lugar da internet.

## Como usar o Ngrok

### 1. Instalação do Ngrok

1. Acesse [ngrok.com](https://ngrok.com/) e crie uma conta gratuita
2. Baixe o Ngrok para seu sistema operacional
3. Extraia o arquivo e adicione ao PATH do sistema

### 2. Configuração do ESP32-CAM

1. Certifique-se de que seu ESP32-CAM está rodando e acessível localmente
2. Anote o IP local da câmera (ex: 192.168.15.200)

### 3. Criando o túnel Ngrok

Execute o seguinte comando no terminal:

```bash
ngrok http 192.168.15.200:81
```

**Importante:** Use a porta 81, que é onde o ESP32-CAM serve o stream de vídeo.

### 4. Obtendo a URL do Ngrok

Após executar o comando, você verá algo como:

```
Session Status                online
Account                       seu-email@exemplo.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://78e83deb645c.ngrok-free.app -> http://192.168.15.200:81
```

Copie a URL `https://78e83deb645c.ngrok-free.app` (a parte antes da seta).

### 5. Configurando no aplicativo

1. Abra o aplicativo ESP32-CAM
2. Cole a URL completa do Ngrok no campo de entrada
3. Toque em "Conectar"
4. Se for a primeira vez, o Ngrok mostrará uma página de confirmação
5. Toque em "Abrir Link" para confirmar o acesso
6. Após a confirmação, tente conectar novamente

## Características do Ngrok Gratuito

- ✅ Acesso remoto à câmera
- ✅ Conexão HTTPS segura
- ❌ URLs mudam a cada reinicialização
- ❌ Limite de conexões simultâneas
- ❌ Página de confirmação na primeira visita

## Solução de Problemas

### Erro de Conexão
- Verifique se o túnel Ngrok está ativo
- Confirme se a URL está correta
- Teste a conexão local primeiro

### Página de Confirmação
- Acesse a URL no navegador primeiro
- Clique em "Visit Site" na página do Ngrok
- Depois tente conectar no aplicativo

### URL Expirada
- URLs do Ngrok gratuito mudam a cada reinicialização
- Gere uma nova URL e atualize no aplicativo

## Dicas de Uso

1. **Mantenha o Ngrok rodando**: O túnel deve permanecer ativo enquanto usar o aplicativo
2. **Teste local primeiro**: Sempre teste a conexão local antes de usar o Ngrok
3. **Backup da URL**: Salve a URL do Ngrok para reutilização rápida
4. **Monitoramento**: Use a interface web do Ngrok (http://127.0.0.1:4040) para monitorar o tráfego

## Segurança

- O Ngrok gratuito é adequado para uso pessoal e testes
- Para uso em produção, considere a versão paga do Ngrok
- Nunca compartilhe URLs do Ngrok publicamente
- URLs do Ngrok são temporárias e mudam frequentemente
