# Sistema de Segurança com Câmera e ESP32

## Descrição

Este projeto visa desenvolver um sistema de segurança para ambientes residenciais ou comerciais, utilizando uma câmera conectada a um ESP32. O sistema será capaz de capturar imagens em tempo real e transmiti-las para um aplicativo, permitindo ao usuário monitorar remotamente o ambiente. O objetivo é melhorar a segurança de locais, proporcionando uma solução acessível e eficiente para vigilância à distância.

Inicialmente, o projeto será integrado com um aplicativo externo para exibir as imagens da câmera. Caso essa integração seja eficaz, será considerado o desenvolvimento de um aplicativo próprio para oferecer uma solução mais personalizada e otimizada.

## Objetivos

- Desenvolver um sistema de segurança que capture imagens em tempo real com uma câmera conectada ao ESP32.
- Transmitir as imagens para um aplicativo, permitindo ao usuário monitorar o ambiente remotamente.
- Explorar tecnologias de sistemas embarcados, comunicação sem fio e processamento de imagens.
- Oferecer uma solução eficiente e acessível para vigilância à distância.

## Recursos Utilizados

Para a implementação deste sistema de segurança, foram utilizados os seguintes recursos:

- **ESP32**: Microcontrolador com suporte a Wi-Fi e Bluetooth, utilizado para processar e enviar as imagens capturadas pela câmera.
- **Câmera (ex: ESP32-CAM)**: Responsável por capturar imagens em tempo real e enviá-las ao ESP32.
- **Aplicativo (externo ou customizado)**: Inicialmente, será utilizado um aplicativo existente para exibir as imagens. Caso necessário, um aplicativo próprio será desenvolvido usando **React Native** ou **Flutter**.
- **Protocolos de Comunicação (Wi-Fi e MQTT)**: O ESP32 se conectará à rede local via Wi-Fi, e o MQTT será usado para a transmissão eficiente das imagens em tempo real para o aplicativo.
- **Linguagens de Programação (C++/Arduino IDE)**: A programação do ESP32 será realizada em C++ utilizando a IDE Arduino. O aplicativo será desenvolvido utilizando **Flutter** ou **React Native**.
- **Técnicas de Programação Concorrente e Threads**: Usadas para garantir o processamento eficiente das imagens e a comunicação sem falhas entre o ESP32 e o aplicativo.

## Tópicos do Conteúdo Programático Utilizados

Para o desenvolvimento deste projeto, serão aplicados os seguintes tópicos:

- **Protocolos de Comunicação (Wi-Fi e MQTT)**: Wi-Fi para conexão com a rede local e MQTT para comunicação em tempo real com o aplicativo.
- **Programação Concorrente e Threads**: Técnicas essenciais para garantir a captura de imagens e a transmissão sem falhas ou atrasos.
- **Computação Móvel e Integração com Dispositivos**: O aplicativo será desenvolvido para dispositivos móveis (Android e iOS) usando React Native ou Flutter.

## Como Executar

1. **Configuração do ESP32**:
    - Conecte o ESP32 à sua rede Wi-Fi.
    - Utilize a IDE Arduino para programar o ESP32 com o código de captura e envio das imagens via MQTT.

2. **Desenvolvimento do Aplicativo**:
    - Clone este repositório.
    - Instale as dependências utilizando **React Native** ou **Flutter**.
    - Conecte o aplicativo ao ESP32 para exibir as imagens em tempo real.

## Contribuição

Sinta-se à vontade para contribuir para este projeto! Se encontrar algum bug ou quiser adicionar novos recursos, abra uma issue ou envie um pull request.

## Licença

Este projeto está licenciado sob a Licença MIT.
