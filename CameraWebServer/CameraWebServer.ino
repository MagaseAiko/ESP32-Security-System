#include "esp_camera.h"
#include <WiFi.h>

#include "board_config.h"

const char *ssid = "VIVOFIBRA-4861";
const char *password = "NozhVgaS7q";

boolean ClockBool = false;
boolean StreamSizeBool = false;

void startCameraServer();
void setupLedFlash();

IPAddress local_IP(192,168,15,200);
IPAddress gateway(192,168,15,1);    
IPAddress subnet(255,255,255,0);     
IPAddress primaryDNS(8,8,8,8);    
IPAddress secondaryDNS(8,8,4,4);

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }


  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

sensor_t *s = esp_camera_sensor_get();
if (config.pixel_format == PIXFORMAT_JPEG) {
    s->set_framesize(s, FRAMESIZE_QVGA);
}


#if defined(LED_GPIO_NUM)
  setupLedFlash();
#endif

  WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS);
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);

  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  startCameraServer();

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");
}

void loop() {
  delay(10000);

  if(!ClockBool)
 {
  set_camera_xclk_simple(40);
  ClockBool = true;
 }

 if(!StreamSizeBool)
 {
  set_camera_resolution_simple(FRAMESIZE_VGA);
  StreamSizeBool = true;
 }
 
}

bool set_camera_xclk_simple(uint32_t xclk_freq_mhz) {
    sensor_t *s = esp_camera_sensor_get();
    if (s == NULL) {
        log_e("Sensor não inicializado");
        return false;
    }
    
    log_i("Alterando XCLK para: %u MHz", xclk_freq_mhz);
    
    int res = s->set_xclk(s, LEDC_TIMER_0, xclk_freq_mhz);
    if (res != 0) {
        log_e("Falha ao alterar XCLK: %d", res);
        return false;
    }
    
    log_i("XCLK alterado com sucesso para %u MHz", xclk_freq_mhz);
    return true;
}

bool set_camera_resolution_simple(framesize_t resolution) {
    sensor_t *s = esp_camera_sensor_get();
    if (s == NULL) {
        log_e("Sensor não inicializado");
        return false;
    }
    
    if (s->pixformat != PIXFORMAT_JPEG) {
        log_e("Formato de pixel não é JPEG, não é possível alterar resolução");
        return false;
    }
    
    const char* resolution_names[] = {
        "QQVGA", "QCIF", "QVGA", "CIF", "VGA", "SVGA", 
        "XGA", "SXGA", "UXGA", "QXGA", "QSXGA"
    };
    
    const char* res_name = (resolution <= FRAMESIZE_QSXGA) ? resolution_names[resolution] : "UNKNOWN";
    
    log_i("Alterando resolução para: %s (%d)", res_name, resolution);
    
    int res = s->set_framesize(s, resolution);
    if (res != 0) {
        log_e("Falha ao alterar resolução: %d", res);
        return false;
    }
    
    log_i("Resolução alterada com sucesso para: %s", res_name);
    return true;
}
