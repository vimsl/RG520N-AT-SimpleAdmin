# RG520N-AT SimpleAdmin Firmware

Quectel RG520N-AT 5G CPE 的重构版 SimpleAdmin 管理界面，基于原厂固件深度优化。

## 设备信息

| 项目 | 值 |
|------|-----|
| 型号 | Quectel RG520N-AT |
| 平台 | Qualcomm SDX65 (SDXLEMUR) |
| CPU | ARMv7 (Cortex-A7) |
| 内核 | Linux 5.4.226-perf |
| 网络 | 5G NR SA/NSA, LTE |
| 频段 | N78, N28 |

## 更新日志

### v1.1 - 首页 UI 重构（2026-08-16）
- **毛玻璃卡片设计**：首页全面采用 backdrop-filter 毛玻璃效果，暗黑/亮色双模式
- **信号+频段+天线一体化布局**：将时间/问候卡片嵌入信号强度区块，频段配置和天线分集无缝衔接，形成层次清晰的视觉结构
- **时间/问候卡片**：在信号区块内独立毛玻璃卡片，带轻微阴影，与下方内容区分层次
- **实时数据刷新**：首页每10秒自动刷新 AT 指令数据，信号、速率、频段、网络信息实时更新
- **天气集成**：支持自动定位或手动设置城市，基于 Open-Meteo API 获取实时天气
- **响应式布局**：桌面端 max-width 640px 居中，移动端自适应
- **导航优化**：所有页面统一顶部导航栏，中英文切换、暗黑模式切换
- **数据安全保障**：所有 AT 指令返回值通过 esc() 函数转义，防止 XSS 注入
- **首页冷启动保护**：首次打开网络页等子页面时自动跳转首页

### v1.0.0 - 初始版本（2026-08-14）
- 首页、设备信息、网络、设置、短信、固件管理、看门狗、救砖等页面
- FPLMN 黑名单清除
- 内存/swap 优化
- 救砖模式

## 功能特性

### 已重构的页面
- **首页** - 毛玻璃卡片、实时时钟、天气、信号强度、速率显示、频段配置、天线分集、网络信息
- **设备信息** - IMEI/IMSI/ICCID、系统信息、内存/存储使用率、快捷操作
- **网络** - 小区信息、频段锁定（NR5G-SA/NSA/LTE）、网络模式、APN、小区锁定
- **设置** - AT 终端、一键工具、IP 透传、DMZ、LAN IP、TTL
- **短信** - 收件箱、发送短信、回复、删除
- **固件管理** - 固件上传、备份管理、看门狗、Telnet、重启
- **看门狗** - 实时状态、配置、自动重启

### 新增功能
- **救砖模式** - DC 电源 + USB-C 同时连接时自动进入恢复模式
- **FPLMN 黑名单清除** - 开机自动清除被锁定的运营商
- **内存优化** - 卸载音频内核模块、禁用 GPS/音频服务
- **Swap 优化** - swappiness=10, vfs_cache_pressure=50

### 技术栈
- **前端**: 原生 HTML/CSS/JS + Lucide 图标
- **后端**: Lighttpd + Shell CGI
- **样式**: 毛玻璃卡片、暗黑/白天模式、中英文切换
- **通信**: AT 命令 via socat 桥接

## 文件结构

`
www/
├── index.html              # 主首页（v8 毛玻璃版）
├── deviceinfo.html         # 设备信息
├── network.html            # 网络设置
├── settings.html           # 设置
├── sms.html                # 短信
├── firmware.html           # 固件管理
├── watchcat.html           # 看门狗
├── recovery.html           # 救砖页面
├── js/
│   ├── i18n.js             # 国际化 + XSS 转义
│   ├── navbar.js           # 导航栏组件
│   └── theme.js            # 主题切换
└── cgi-bin/
    ├── get_atcommand       # AT 命令接口
    ├── system_info         # 系统信息
    ├── firmware_upgrade    # 固件升级
    ├── firmware_download   # 固件下载
    ├── fan_control         # 风扇控制
    ├── get_watchcat_status # 看门狗状态
    ├── watchcat_maker      # 看门狗配置
    ├── send_sms            # 发送短信
    ├── set_ttl             # TTL 设置
    ├── set_lan_ip          # LAN IP 设置
    └── upload_file         # 文件上传

scripts/
├── watchdog.sh             # 网络看门狗
├── clear_fplmn.sh          # FPLMN 黑名单清除
└── brick_recovery.sh       # 救砖模式监控
`

## 安装

1. 通过 Telnet 或 SSH 连接设备
2. 将 www/ 目录上传到 /usrdata/simpleadmin/www/
3. 将 scripts/ 目录上传到 /usrdata/simpleadmin/scripts/
4. 设置执行权限：chmod +x /usrdata/simpleadmin/scripts/*.sh
5. 重启设备使修改生效

## 上游引用

本项目基于以下开源项目：

| 项目 | 仓库 | 用途 |
|------|------|------|
| SimpleAdmin | [iamromulan/quectel-rgmii-toolkit](https://github.com/iamromulan/quectel-rgmii-toolkit) | 原始 SimpleAdmin 管理界面 |
| Lighttpd | [lighttpd/lighttpd](https://github.com/lighttpd/lighttpd) | Web 服务器 |
| Lucide | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | 图标库 |
