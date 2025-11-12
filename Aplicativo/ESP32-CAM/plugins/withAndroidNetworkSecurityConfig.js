const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin do Expo para adicionar configuração de segurança de rede no Android
 * Permite tráfego HTTP para domínios específicos
 */
const withAndroidNetworkSecurityConfig = (config) => {
  // Adiciona o atributo networkSecurityConfig no AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Adiciona a configuração de segurança de rede
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';

    return config;
  });

  // Copia o arquivo XML de configuração para a pasta res/xml do Android
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;

      // Caminho do arquivo XML de origem
      const sourceXmlPath = path.join(projectRoot, 'android-network-config.xml');
      
      // Caminho de destino no projeto Android
      const xmlResourcePath = path.join(
        platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );
      
      const targetXmlPath = path.join(xmlResourcePath, 'network_security_config.xml');

      // Cria o diretório xml se não existir
      if (!fs.existsSync(xmlResourcePath)) {
        fs.mkdirSync(xmlResourcePath, { recursive: true });
      }

      // Copia o arquivo de configuração
      if (fs.existsSync(sourceXmlPath)) {
        fs.copyFileSync(sourceXmlPath, targetXmlPath);
        console.log('✅ Network security config copiado com sucesso!');
      } else {
        console.warn('⚠️ Arquivo android-network-config.xml não encontrado na raiz do projeto');
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withAndroidNetworkSecurityConfig;
