# 第7章：固件与嵌入式开发

> **学习目标**
> - 理解嵌入式开发的基本概念和开发模式
> - 掌握 Arduino 框架下的 ESP32 编程
> - 了解 GPIO、UART、SPI、I2C 等通信协议
> - 能实现 WiFi/蓝牙连接和传感器数据采集
> - 了解 OTA 升级和低功耗设计

---

## 7.1 嵌入式开发概述

### 7.1.1 固件 vs 软件

| 对比 | 固件 (Firmware) | 软件 (Software) |
|------|-----------------|-----------------|
| 运行环境 | 微控制器(MCU)，资源有限 | PC/手机，资源丰富 |
| 内存 | KB级别（ESP32: 520KB RAM） | GB级别 |
| 存储 | MB级别（ESP32: 4MB Flash） | GB-TB级别 |
| 操作系统 | 无 或 RTOS | Windows/Linux/iOS/Android |
| 编程语言 | C/C++ 为主 | 多种语言 |
| 调试方式 | 串口打印、JTAG | IDE调试器 |
| 更新方式 | 烧录 或 OTA | 应用商店/自动更新 |

### 7.1.2 三种开发模式

| 模式 | 说明 | 适用场景 | 复杂度 |
|------|------|----------|--------|
| **裸机 (Bare-metal)** | 直接在硬件上编程，无操作系统 | 简单功能、低成本产品 | ★★ |
| **RTOS** | 实时操作系统（如FreeRTOS） | 多任务并发、需要实时性 | ★★★ |
| **嵌入式 Linux** | 完整的Linux系统 | 复杂应用、需要文件系统和网络 | ★★★★★ |

> ESP32 使用 Arduino 框架时，底层已经集成了 FreeRTOS，但编程方式更接近裸机，对初学者友好。

### 7.1.3 开发语言选择

| 语言 | 适用 | 优缺点 |
|------|------|--------|
| **C** | 所有MCU | 最底层、效率最高、学习曲线陡 |
| **C++** | 大多数MCU | 面向对象、Arduino框架基于C++ |
| **MicroPython** | ESP32, RP2040 | 上手快、运行效率低 |
| **Rust** | 新兴选择 | 安全性好、生态尚在发展 |

> **课程选择**：使用 **C/C++（Arduino 框架）**，兼顾易学和可量产。

---

## 7.2 C/C++ 嵌入式编程基础

### 7.2.1 数据类型

嵌入式开发中常用固定宽度的数据类型：

```c
#include <stdint.h>

uint8_t   value_8bit  = 255;       // 无符号8位，0-255
int8_t    signed_8bit = -128;      // 有符号8位，-128 to 127
uint16_t  value_16bit = 65535;     // 无符号16位
int16_t   signed_16bit = -32768;   // 有符号16位
uint32_t  value_32bit = 4294967295;// 无符号32位
float     temperature = 25.5;      // 浮点数
bool      led_state = true;        // 布尔值
```

### 7.2.2 位操作

位操作是嵌入式编程的核心技能：

```c
// 位操作基础
uint8_t reg = 0b10110100;  // 二进制表示

// 设置某一位为1（置位）
reg |= (1 << 3);    // 第3位置1:  10111100

// 清除某一位为0（清位）
reg &= ~(1 << 2);   // 第2位清0:  10111000

// 翻转某一位
reg ^= (1 << 4);    // 第4位翻转: 10101000

// 检查某一位
if (reg & (1 << 5)) {
    // 第5位为1
}
```

### 7.2.3 中断 (Interrupt)

中断允许MCU在特定事件发生时立即响应：

```c
// ESP32 按键中断示例
#define BUTTON_PIN 0  // Boot按键通常在GPIO0

volatile bool buttonPressed = false;

// 中断服务函数（ISR）—— 要尽量短小
void IRAM_ATTR buttonISR() {
    buttonPressed = true;
}

void setup() {
    Serial.begin(115200);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    attachInterrupt(BUTTON_PIN, buttonISR, FALLING);  // 下降沿触发
}

void loop() {
    if (buttonPressed) {
        buttonPressed = false;
        Serial.println("按键被按下！");
        // 在这里处理按键事件
    }
    delay(10);
}
```

---

## 7.3 Arduino 框架核心 API

### 7.3.1 程序结构

```c
void setup() {
    // 初始化代码，上电后执行一次
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    // 主循环，反复执行
    digitalWrite(LED_PIN, HIGH);
    delay(1000);
    digitalWrite(LED_PIN, LOW);
    delay(1000);
}
```

### 7.3.2 常用函数速查

| 函数 | 功能 | 示例 |
|------|------|------|
| `pinMode(pin, mode)` | 设置引脚模式 | `pinMode(2, OUTPUT)` |
| `digitalWrite(pin, val)` | 数字输出 | `digitalWrite(2, HIGH)` |
| `digitalRead(pin)` | 数字输入 | `int val = digitalRead(0)` |
| `analogRead(pin)` | 模拟输入(ADC) | `int val = analogRead(34)` |
| `ledcWrite(pin, duty)` | PWM输出 | `ledcWrite(2, 128)` |
| `Serial.print()` | 串口输出 | `Serial.println("Hello")` |
| `delay(ms)` | 延时(毫秒) | `delay(1000)` |
| `millis()` | 运行时间(毫秒) | `unsigned long t = millis()` |

---

## 7.4 硬件通信协议

### 7.4.1 GPIO — 基本输入输出

最简单的通信方式：高电平(1)和低电平(0)。

```c
// 输出：控制LED
pinMode(2, OUTPUT);
digitalWrite(2, HIGH);   // 输出高电平 3.3V
digitalWrite(2, LOW);    // 输出低电平 0V

// 输入：读取按键
pinMode(0, INPUT_PULLUP); // 内部上拉
int state = digitalRead(0); // 按下=LOW, 松开=HIGH
```

### 7.4.2 UART — 串口通信

两条线：TX（发送）和 RX（接收），全双工。

```c
// ESP32 有3个UART
// UART0: GPIO1(TX), GPIO3(RX) — 默认Serial，USB调试用
// UART1: 可自定义引脚
// UART2: 可自定义引脚

// 使用Serial2与外部设备通信
#define RX2_PIN 16
#define TX2_PIN 17

void setup() {
    Serial.begin(115200);           // USB调试串口
    Serial2.begin(9600, SERIAL_8N1, RX2_PIN, TX2_PIN);  // 外设串口
}

void loop() {
    // 接收外设数据并打印到调试串口
    if (Serial2.available()) {
        String data = Serial2.readStringUntil('\n');
        Serial.println("收到: " + data);
    }
}
```

### 7.4.3 I2C — 两线制通信

两条线：SDA（数据）和 SCL（时钟）。一条总线可以挂多个设备。

```c
#include <Wire.h>

// I2C 读取 SHT30 温湿度传感器
#define SHT30_ADDR 0x44

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);  // SDA=GPIO21, SCL=GPIO22
}

void loop() {
    // 发送测量命令
    Wire.beginTransmission(SHT30_ADDR);
    Wire.write(0x2C);  // 高精度测量
    Wire.write(0x06);
    Wire.endTransmission();
    
    delay(50);  // 等待测量完成
    
    // 读取6字节数据
    Wire.requestFrom(SHT30_ADDR, 6);
    if (Wire.available() == 6) {
        uint8_t data[6];
        for (int i = 0; i < 6; i++) {
            data[i] = Wire.read();
        }
        
        // 转换温度 (data[0-1])
        float temp = -45.0 + 175.0 * ((data[0] << 8 | data[1]) / 65535.0);
        // 转换湿度 (data[3-4])
        float humi = 100.0 * ((data[3] << 8 | data[4]) / 65535.0);
        
        Serial.printf("温度: %.1f°C, 湿度: %.1f%%\n", temp, humi);
    }
    
    delay(2000);
}
```

### 7.4.4 SPI — 高速同步通信

四条线：MOSI、MISO、SCK、CS。速度比I2C快很多。

```c
#include <SPI.h>

// SPI 通信示例
#define CS_PIN 5

void setup() {
    SPI.begin(18, 19, 23, CS_PIN); // SCK, MISO, MOSI, CS
    pinMode(CS_PIN, OUTPUT);
    digitalWrite(CS_PIN, HIGH);     // 默认不选中
}

uint8_t spiTransfer(uint8_t reg, uint8_t value) {
    digitalWrite(CS_PIN, LOW);       // 选中设备
    SPI.transfer(reg);               // 发送寄存器地址
    uint8_t result = SPI.transfer(value); // 读写数据
    digitalWrite(CS_PIN, HIGH);      // 取消选中
    return result;
}
```

### 通信协议对比

| 特性 | UART | I2C | SPI |
|------|------|-----|-----|
| 线数 | 2 (TX/RX) | 2 (SDA/SCL) | 4 (MOSI/MISO/SCK/CS) |
| 速度 | 115200bps常用 | 100-400kbps | 1-80Mbps |
| 设备数 | 点对点 | 多设备(地址区分) | 多设备(CS区分) |
| 全双工 | 是 | 否 | 是 |
| 复杂度 | 简单 | 中等 | 中等 |
| 典型用途 | GPS、调试 | 传感器、EEPROM | 屏幕、Flash、SD卡 |

---

## 7.5 WiFi 连接

### 7.5.1 连接WiFi

```c
#include <WiFi.h>

const char* ssid = "你的WiFi名称";
const char* password = "你的WiFi密码";

void setup() {
    Serial.begin(115200);
    
    WiFi.begin(ssid, password);
    Serial.print("正在连接WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nWiFi已连接!");
    Serial.print("IP地址: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    // WiFi已连接，可以进行网络操作
}
```

### 7.5.2 HTTP 请求发送数据

```c
#include <WiFi.h>
#include <HTTPClient.h>

void sendData(float temperature, float humidity) {
    if (WiFi.status() != WL_CONNECTED) return;
    
    HTTPClient http;
    http.begin("http://你的服务器地址/api/data");
    http.addHeader("Content-Type", "application/json");
    
    // 构建JSON数据
    String jsonData = "{\"temperature\":" + String(temperature, 1) 
                    + ",\"humidity\":" + String(humidity, 1) + "}";
    
    int httpCode = http.POST(jsonData);
    
    if (httpCode > 0) {
        Serial.printf("HTTP响应码: %d\n", httpCode);
        String response = http.getString();
        Serial.println("响应: " + response);
    } else {
        Serial.printf("HTTP请求失败: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
}
```

### 7.5.3 MQTT 连接

```c
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient mqtt(espClient);

const char* mqtt_server = "broker.emqx.io";  // 公共MQTT服务器
const int mqtt_port = 1883;
const char* mqtt_topic = "mydevice/sensor";

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("收到消息 [");
    Serial.print(topic);
    Serial.print("]: ");
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}

void mqttConnect() {
    while (!mqtt.connected()) {
        String clientId = "ESP32-" + String(random(0xffff), HEX);
        if (mqtt.connect(clientId.c_str())) {
            Serial.println("MQTT已连接");
            mqtt.subscribe("mydevice/command");  // 订阅命令主题
        } else {
            Serial.printf("MQTT连接失败, rc=%d\n", mqtt.state());
            delay(5000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    // ... WiFi连接代码 ...
    mqtt.setServer(mqtt_server, mqtt_port);
    mqtt.setCallback(mqttCallback);
}

void loop() {
    if (!mqtt.connected()) mqttConnect();
    mqtt.loop();
    
    // 每30秒发布一次数据
    static unsigned long lastPublish = 0;
    if (millis() - lastPublish > 30000) {
        lastPublish = millis();
        String payload = "{\"temp\":25.5,\"humi\":60.2}";
        mqtt.publish(mqtt_topic, payload.c_str());
        Serial.println("数据已发布");
    }
}
```

---

## 7.6 蓝牙 BLE

```c
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) { deviceConnected = true; }
    void onDisconnect(BLEServer* pServer) { deviceConnected = false; }
};

void setup() {
    Serial.begin(115200);
    
    BLEDevice::init("环境监测器");
    BLEServer *pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService *pService = pServer->createService(SERVICE_UUID);
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pCharacteristic->addDescriptor(new BLE2902());
    
    pService->start();
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->start();
    Serial.println("BLE服务已启动，等待连接...");
}

void loop() {
    if (deviceConnected) {
        // 发送传感器数据给手机
        String data = "T:25.5,H:60.2";
        pCharacteristic->setValue(data.c_str());
        pCharacteristic->notify();
        delay(2000);
    }
}
```

---

## 7.7 OTA 空中升级

```c
#include <WiFi.h>
#include <ArduinoOTA.h>

void setup() {
    Serial.begin(115200);
    WiFi.begin("SSID", "PASSWORD");
    while (WiFi.status() != WL_CONNECTED) delay(500);
    
    // 配置OTA
    ArduinoOTA.setHostname("env-monitor-001");
    ArduinoOTA.setPassword("ota_password");
    
    ArduinoOTA.onStart([]() { Serial.println("开始OTA升级..."); });
    ArduinoOTA.onEnd([]() { Serial.println("OTA升级完成!"); });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("进度: %u%%\n", (progress / (total / 100)));
    });
    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("OTA错误[%u]\n", error);
    });
    
    ArduinoOTA.begin();
    Serial.println("OTA就绪");
}

void loop() {
    ArduinoOTA.handle();  // 必须在loop中调用
    // ... 你的业务代码 ...
}
```

---

## 7.8 低功耗设计

### 7.8.1 ESP32 功耗模式

| 模式 | 功耗 | WiFi | CPU | 唤醒方式 |
|------|------|------|-----|----------|
| Active (WiFi TX) | 160-260mA | 开 | 运行 | — |
| Active (无WiFi) | 20-68mA | 关 | 运行 | — |
| Light Sleep | 0.8mA | 关 | 暂停 | 定时器/GPIO |
| **Deep Sleep** | **10μA** | 关 | 关 | 定时器/GPIO/触摸 |
| Hibernation | 5μA | 关 | 关 | 仅RTC定时器 |

### 7.8.2 Deep Sleep 示例

```c
#define uS_TO_S_FACTOR 1000000  // 微秒转秒
#define SLEEP_TIME_SEC 300       // 每5分钟唤醒一次

RTC_DATA_ATTR int bootCount = 0; // RTC内存中的变量，睡眠后保留

void setup() {
    Serial.begin(115200);
    bootCount++;
    Serial.printf("第 %d 次启动\n", bootCount);
    
    // 执行传感器读取和数据上传
    // ... 读传感器 ...
    // ... 连接WiFi上传数据 ...
    // ... 断开WiFi ...
    
    // 进入深度睡眠
    esp_sleep_enable_timer_wakeup(SLEEP_TIME_SEC * uS_TO_S_FACTOR);
    Serial.println("进入深度睡眠...");
    Serial.flush();
    esp_deep_sleep_start();
    // 以下代码不会执行，唤醒后从setup()重新开始
}

void loop() {
    // Deep Sleep模式下不会执行到loop
}
```

### 7.8.3 续航估算

```
电池容量(mAh) / 平均电流(mA) = 续航时间(小时)

示例：250mAh电池 + 每5分钟唤醒一次（每次工作10秒）
- 工作电流: 80mA × (10/300) = 2.67mA (占空比)
- 睡眠电流: 0.01mA × (290/300) = 0.0097mA
- 平均电流: 2.67 + 0.0097 ≈ 2.68mA
- 续航: 250 / 2.68 ≈ 93小时 ≈ 约4天

优化后（减少WiFi连接时间、使用BLE代替WiFi）可以延长到数周。
```

---

## 7.9 固件调试技巧

| 方法 | 工具 | 适用场景 | 成本 |
|------|------|----------|------|
| **串口打印** | Serial.println() | 日常调试首选 | ¥0 |
| **逻辑分析仪** | Saleae Logic / 国产 | 通信协议分析 | ¥50-200 |
| **JTAG/SWD** | ESP-Prog / J-Link | 断点调试、查看内存 | ¥50-500 |
| **万用表** | 数字万用表 | 电压/电流测量 | ¥50-200 |
| **示波器** | 手持示波器 | 波形分析 | ¥200-2000 |

> **建议**：90% 的问题用串口打印就能解决。买一个逻辑分析仪（¥50-100）能帮助分析 I2C/SPI 通信问题。

---

## 7.10 案例：「智能环境监测器」固件架构

```
┌─────────────────────────────────────────┐
│              主程序 (main)               │
├──────┬──────┬──────┬──────┬────────────┤
│传感器 │ 显示 │ BLE  │ WiFi │ 电源管理   │
│模块   │ 模块 │ 模块 │ 模块 │ 模块       │
├──────┴──────┴──────┴──────┴────────────┤
│          硬件抽象层 (HAL)                │
├─────────────────────────────────────────┤
│         Arduino / ESP-IDF               │
├─────────────────────────────────────────┤
│              硬件 (ESP32-C3)             │
└─────────────────────────────────────────┘
```

工作流程：
1. 上电 → 初始化传感器、显示、BLE
2. 每2秒读取一次传感器数据
3. 更新OLED屏幕显示
4. 通过BLE广播数据（手机可随时连接查看）
5. 每5分钟连接WiFi上传数据到云端
6. 闲时进入Light Sleep省电

---

## 7.11 实践练习

### 练习：完整的温湿度采集 + WiFi 上传固件

结合本章所学，编写一个完整的固件：
1. 读取 SHT30/DHT22 温湿度数据
2. 通过串口输出数据
3. 连接 WiFi
4. 通过 HTTP 或 MQTT 上传数据
5. 加入 Deep Sleep 低功耗模式

---

## 7.12 延伸阅读

- ESP32 Arduino 官方文档
- 《ESP32 物联网开发实战》
- B站搜索"ESP32开发教程" — 免费视频教程
- FreeRTOS 官方文档 — 深入理解实时操作系统
- 《嵌入式C编程实战》

---

> **下一章预告**：第8章我们将学习配套的 App 和云端开发，让你的硬件设备能通过手机控制。
