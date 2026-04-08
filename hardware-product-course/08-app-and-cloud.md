# 第8章：配套软件与云端开发

> **学习目标**
> - 了解硬件产品的软件生态架构
> - 掌握手机端开发方案选择（小程序/App）
> - 理解蓝牙 BLE 和 MQTT 通信原理
> - 了解 IoT 云平台的选择与接入
> - 能用微信小程序通过蓝牙与 ESP32 通信

---

## 8.1 硬件产品的软件生态

一个完整的智能硬件产品通常包含三层软件：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  手机App /   │ ←→  │   云端服务   │ ←→  │  管理后台    │
│  小程序      │     │             │     │  (Web)      │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │ BLE/WiFi          │ MQTT/HTTP
       ↓                   ↓
┌─────────────────────────────────────┐
│          硬件设备（固件）              │
└─────────────────────────────────────┘
```

| 层级 | 功能 | 技术选择 |
|------|------|----------|
| **设备端** | 数据采集、执行控制 | ESP32 固件（第7章） |
| **手机端** | 用户操控、数据展示 | 微信小程序 / Flutter App |
| **云端** | 数据存储、设备管理、远程控制 | IoT平台 / 自建后端 |
| **管理后台** | 设备监控、数据分析、用户管理 | Web Dashboard |

---

## 8.2 手机端开发方案选择

### 方案对比

| 方案 | 开发成本 | 跨平台 | 性能 | 蓝牙支持 | 推荐指数 |
|------|----------|--------|------|----------|----------|
| **微信小程序** | 最低 | 微信内跨平台 | 够用 | 支持BLE | ★★★★★ |
| **Flutter** | 中等 | iOS + Android | 好 | 插件支持 | ★★★★ |
| **React Native** | 中等 | iOS + Android | 一般 | 插件支持 | ★★★ |
| **原生(Swift/Kotlin)** | 最高 | 不跨平台 | 最佳 | 完整支持 | ★★★ |

### 推荐路径

```
MVP阶段 → 微信小程序（快速验证，零安装）
    ↓
产品成熟 → Flutter App（iOS+Android独立App）
    ↓
品牌化 → 原生App（极致体验）
```

### 为什么首选微信小程序？

1. **零安装**：用户扫码即用，降低使用门槛
2. **蓝牙 API 完善**：微信提供完整的 BLE API
3. **开发成本低**：JavaScript/TypeScript，前端工程师都能上手
4. **审核快**：比 App Store 审核快得多
5. **国内用户覆盖**：几乎所有中国用户都有微信
6. **分享传播**：方便在微信中分享给其他用户

---

## 8.3 蓝牙 BLE 通信详解

### 8.3.1 BLE 基础概念

| 概念 | 说明 | 类比 |
|------|------|------|
| **GATT** | Generic Attribute Profile，数据交换协议 | 通信规则 |
| **Service** | 服务，一组相关功能的集合 | 功能模块 |
| **Characteristic** | 特征值，具体的数据项 | 一个数据字段 |
| **UUID** | 通用唯一标识符，标识Service和Characteristic | 地址/ID |
| **Notify** | 设备主动推送数据给手机 | 推送通知 |
| **Read/Write** | 手机读取/写入设备数据 | 请求/响应 |

### 数据结构示例

```
设备: "环境监测器"
├── 环境数据服务 (Service UUID: 0x181A)
│   ├── 温度 (Characteristic UUID: 0x2A6E) [Read, Notify]
│   ├── 湿度 (Characteristic UUID: 0x2A6F) [Read, Notify]
│   └── 气压 (Characteristic UUID: 0x2A6D) [Read, Notify]
├── 设备信息服务 (Service UUID: 0x180A)
│   ├── 固件版本 (Characteristic UUID: 0x2A26) [Read]
│   └── 电池电量 (Characteristic UUID: 0x2A19) [Read, Notify]
└── 控制服务 (Service UUID: 自定义UUID)
    ├── LED控制 (Characteristic UUID: 自定义) [Write]
    └── 采集间隔设置 (Characteristic UUID: 自定义) [Read, Write]
```

### 8.3.2 BLE 通信流程

```
手机                          设备(ESP32)
  │                              │
  │ ←── 广播(Advertising) ────── │  1. 设备持续广播
  │                              │
  │ ──── 扫描 & 发现 ──────────→ │  2. 手机扫描到设备
  │                              │
  │ ──── 发起连接 ────────────→  │  3. 建立连接
  │                              │
  │ ──── 发现服务 ────────────→  │  4. 获取服务和特征值列表
  │                              │
  │ ──── 开启Notify ──────────→  │  5. 订阅数据通知
  │                              │
  │ ←── Notify(温度数据) ──────  │  6. 设备主动推送数据
  │ ←── Notify(温度数据) ──────  │
  │                              │
  │ ──── Write(LED开) ────────→  │  7. 手机发送控制命令
  │                              │
  │ ──── 断开连接 ────────────→  │  8. 断开
```

---

## 8.4 微信小程序蓝牙开发

### 8.4.1 小程序蓝牙 API 调用流程

```javascript
// 1. 初始化蓝牙适配器
wx.openBluetoothAdapter({
  success() {
    console.log('蓝牙适配器初始化成功');
    startScan();
  },
  fail(err) {
    console.log('请打开蓝牙', err);
  }
});

// 2. 搜索设备
function startScan() {
  wx.startBluetoothDevicesDiscovery({
    services: ['0000181A-0000-1000-8000-00805F9B34FB'], // 过滤指定服务
    success() {
      console.log('开始搜索设备...');
    }
  });
  
  // 监听发现新设备
  wx.onBluetoothDeviceFound((res) => {
    const device = res.devices[0];
    console.log('发现设备:', device.name, device.deviceId);
    // 找到目标设备后停止搜索并连接
    if (device.name === '环境监测器') {
      wx.stopBluetoothDevicesDiscovery();
      connectDevice(device.deviceId);
    }
  });
}

// 3. 连接设备
function connectDevice(deviceId) {
  wx.createBLEConnection({
    deviceId: deviceId,
    success() {
      console.log('连接成功');
      discoverServices(deviceId);
    }
  });
}

// 4. 发现服务和特征值
function discoverServices(deviceId) {
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success(res) {
      console.log('服务列表:', res.services);
      // 获取特征值
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
        success(res) {
          console.log('特征值列表:', res.characteristics);
          // 开启通知
          enableNotify(deviceId);
        }
      });
    }
  });
}

// 5. 开启数据通知
function enableNotify(deviceId) {
  wx.notifyBLECharacteristicValueChange({
    deviceId: deviceId,
    serviceId: '0000181A-0000-1000-8000-00805F9B34FB',
    characteristicId: '00002A6E-0000-1000-8000-00805F9B34FB',
    state: true,
    success() {
      console.log('已开启通知');
    }
  });
  
  // 监听数据变化
  wx.onBLECharacteristicValueChange((res) => {
    const data = new DataView(res.value);
    const temperature = data.getInt16(0, true) / 100;
    console.log('温度:', temperature, '°C');
  });
}

// 6. 发送控制命令
function sendCommand(deviceId, command) {
  const buffer = new ArrayBuffer(1);
  const view = new DataView(buffer);
  view.setUint8(0, command); // 0x01=开灯, 0x00=关灯
  
  wx.writeBLECharacteristicValue({
    deviceId: deviceId,
    serviceId: '自定义服务UUID',
    characteristicId: '自定义特征值UUID',
    value: buffer,
    success() {
      console.log('命令发送成功');
    }
  });
}
```

---

## 8.5 IoT 云平台选择

### 平台对比

| 平台 | 免费额度 | 设备接入 | APP支持 | 适合 | 特点 |
|------|----------|----------|---------|------|------|
| **涂鸦智能** | 有限 | SDK/模组 | 提供通用App | 快速出货 | 一站式方案，有分成模式 |
| **机智云** | 较大 | SDK | 自动生成App | 中小企业 | 老牌平台，文档全 |
| **阿里云IoT** | 50台免费 | SDK/MQTT | 需自建 | 技术团队 | 生态完整，扩展性强 |
| **腾讯云IoT** | 有限 | SDK/MQTT | 小程序联动 | 微信生态 | 与微信打通好 |
| **AWS IoT** | 12个月免费 | SDK/MQTT | 需自建 | 海外市场 | 全球部署 |
| **自建** | 服务器成本 | 完全自定义 | 完全自建 | 技术能力强 | 完全自主可控 |

### 如何选择？

```
你的情况？
├── 没有技术团队，想快速出货 → 涂鸦智能 / 机智云
├── 有技术能力，重视自主可控 → 自建后端
├── 产品面向国内市场 → 阿里云IoT / 腾讯云IoT
└── 产品面向海外市场 → AWS IoT
```

---

## 8.6 MQTT 协议详解

MQTT 是 IoT 领域最常用的通信协议。

### 基本概念

| 概念 | 说明 | 类比 |
|------|------|------|
| **Broker** | 消息服务器，负责转发消息 | 邮局 |
| **Client** | 设备或应用，发送/接收消息 | 寄件人/收件人 |
| **Topic** | 消息主题，用于分类消息 | 收件地址 |
| **Publish** | 发布消息到某个Topic | 寄信 |
| **Subscribe** | 订阅某个Topic的消息 | 订阅邮箱 |
| **QoS** | 服务质量等级(0/1/2) | 普通信/挂号信/确认收到 |

### Topic 设计规范

```
设备上报数据:  device/{device_id}/telemetry
云端下发命令:  device/{device_id}/command
设备状态:     device/{device_id}/status
OTA升级:     device/{device_id}/ota

示例:
  device/ESP32_A1B2C3/telemetry  → {"temp":25.5,"humi":60}
  device/ESP32_A1B2C3/command    → {"action":"led","value":1}
```

### 常用 MQTT Broker

| Broker | 特点 | 适用 |
|--------|------|------|
| **EMQX** | 国产，性能强，有开源版 | 自建推荐 |
| **Mosquitto** | 轻量级，开源 | 学习和小规模 |
| **HiveMQ** | 企业级，有云服务 | 海外项目 |
| **broker.emqx.io** | 公共免费Broker | 测试和学习 |

---

## 8.7 自建简易后端

### 技术栈推荐

```
ESP32 设备
    │ MQTT
    ↓
EMQX Broker（消息中间件）
    │
    ↓
Node.js 后端服务
    │
    ├── PostgreSQL（设备信息、用户数据）
    ├── InfluxDB / TimescaleDB（时序数据）
    └── Redis（缓存、设备在线状态）
    │
    ↓
前端 Dashboard / 小程序
```

### 后端接收 MQTT 数据示例（Node.js）

```javascript
const mqtt = require('mqtt');
const { Pool } = require('pg');

// 连接 MQTT Broker
const client = mqtt.connect('mqtt://localhost:1883');

// 连接数据库
const pool = new Pool({
  connectionString: 'postgresql://localhost/iot_db'
});

client.on('connect', () => {
  console.log('已连接MQTT Broker');
  client.subscribe('device/+/telemetry'); // 订阅所有设备的数据
});

client.on('message', async (topic, message) => {
  const deviceId = topic.split('/')[1];
  const data = JSON.parse(message.toString());
  
  console.log(`设备 ${deviceId}: 温度=${data.temp}°C, 湿度=${data.humi}%`);
  
  // 存入数据库
  await pool.query(
    'INSERT INTO sensor_data (device_id, temperature, humidity, created_at) VALUES ($1, $2, $3, NOW())',
    [deviceId, data.temp, data.humi]
  );
});
```

### REST API 设计

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/devices` | GET | 获取设备列表 |
| `/api/devices/:id` | GET | 获取设备详情 |
| `/api/devices/:id/data` | GET | 获取历史数据 |
| `/api/devices/:id/command` | POST | 下发控制命令 |
| `/api/users/bindDevice` | POST | 绑定设备 |

---

## 8.8 设备管理与数据可视化

### 设备生命周期

```
设备出厂 → 用户扫码激活 → 配网绑定 → 正常使用 → 固件升级 → 解绑/报废
```

### 配网绑定流程

**蓝牙配网**（推荐）：
1. 用户打开小程序，扫描附近设备
2. 选择设备，输入 WiFi 密码
3. 通过 BLE 将 WiFi 信息发送给设备
4. 设备连接 WiFi 并注册到云端
5. 小程序绑定设备到用户账号

### 数据可视化

- **Grafana**：开源可视化工具，支持多种数据源，适合快速搭建 Dashboard
- **自建 Web Dashboard**：React/Vue + ECharts，完全自定义
- **小程序内展示**：使用 wx-charts 或 uCharts 组件

---

## 8.9 案例：「智能环境监测器」软件架构

### 整体架构

```
微信小程序 ←──BLE──→ ESP32设备 ──MQTT──→ EMQX ──→ Node.js后端 ──→ PostgreSQL
    │                                                    │
    └──────────── HTTP REST API ────────────────────────┘
```

### 功能分工

| 模块 | 功能 |
|------|------|
| ESP32固件 | 传感器采集、BLE广播、MQTT上报 |
| 微信小程序 | BLE连接、实时数据展示、WiFi配网、历史查询 |
| 云端后端 | 数据存储、设备管理、API接口 |
| 管理后台 | 设备监控、数据统计、固件管理 |

---

## 8.10 实践练习

### 练习：微信小程序 + ESP32 蓝牙通信

**步骤**：
1. 在 ESP32 上运行第7章的 BLE Server 代码
2. 注册微信小程序开发者账号
3. 使用微信开发者工具创建小程序项目
4. 实现：搜索设备 → 连接 → 读取温湿度数据 → 显示在页面上
5. 实现：发送控制命令（如开关LED）

**预期成果**：用微信小程序实时查看 ESP32 采集的传感器数据。

---

## 8.11 延伸阅读

- 微信小程序蓝牙 API 官方文档
- MQTT 协议规范 v3.1.1/v5.0
- EMQX 官方文档 — MQTT Broker 部署
- 涂鸦智能开发者文档 — 一站式 IoT 方案
- Flutter 蓝牙插件 flutter_blue_plus 文档

---

> **下一章预告**：第9章我们将学习如何把设计变成实物——原型制作与测试验证。
