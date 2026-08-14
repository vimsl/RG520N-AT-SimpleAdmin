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

## 功能特性

### 已重构的页面
- **首页** - 实时时钟、状态栏、速率显示（带波浪动画）、信号强度（圆环图+进度条）、频段配置、天线分集、网络信息
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
- **前端**: React 18 + Vite + Lucide React 图标
- **后端**: Lighttpd + Shell CGI
- **样式**: 毛玻璃卡片、暗黑/白天模式、中英文切换
- **通信**: AT 命令 via socat 桥接

## 文件结构

```
www/
├── index.html              # 主首页（纯 JS 版本）
├── deviceinfo.html         # 设备信息
├── network.html            # 网络设置
├── settings.html           # 设置
├── sms.html                # 短信
├── firmware.html           # 固件管理
├── fan.html                # 风扇管理（仅快捷入口）
├── watchcat.html           # 看门狗
├── recovery.html           # 救砖页面
├── new/                    # React 版首页
│   ├── index.html
│   └── assets/
│       ├── index-*.js      # React 构建产物
│       └── index-*.css     # 样式
├── css/
│   ├── cpe-theme.css       # 主题样式
│   └── styles.css          # 基础样式
├── js/
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
    └── upload_file         # 文件上传

scripts/
├── watchdog.sh             # 网络看门狗
├── clear_fplmn.sh          # FPLMN 黑名单清除
└── brick_recovery.sh       # 救砖模式监控
```

## 上游引用

本项目基于以下开源项目：

| 项目 | 仓库 | 用途 |
|------|------|------|
| SimpleAdmin | [iamromulan/quectel-rgmii-toolkit](https://github.com/iamromulan/quectel-rgmii-toolkit) | 原始 SimpleAdmin 管理界面 |
| Lighttpd | [lighttpd/lighttpd](https://github.com/lighttpd/lighttpd) | Web 服务器 |
| Alpine.js | [alpinejs/alpinejs](https://github.com/alpinejs/alpinejs) | 旧版页面交互框架 |
| Bootstrap | [twbs/bootstrap](https://github.com/twbs/bootstrap) | 旧版页面 UI 框架 |
| React | [facebook/react](https://github.com/facebook/react) | 新版首页 UI 框架 |
| Lucide | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | 图标库 |
| Vite | [vitejs/vite](https://github.com/vitejs/vite) | 前端构建工具 |

## 安装

1. 通过 Telnet 或 SSH 连接设备
2. 将 `www/` 目录上传到 `/usrdata/simpleadmin/www/`
3. 将 `scripts/` 目录上传到 `/usrdata/simpleadmin/scripts/`
4. 设置执行权限：`chmod +x /usrdata/simpleadmin/scripts/*.sh`
5. 配置 systemd 服务（见下方）

### systemd 服务配置

```bash
# 网络看门狗
cat > /etc/systemd/system/modem_watchdog_v3.service << 'EOF'
[Unit]
Description=Modem Watchdog v3
After=network.target

[Service]
Type=simple
ExecStart=/usrdata/simpleadmin/scripts/watchdog.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# FPLMN 清除
cat > /etc/systemd/system/clear-fplmn.service << 'EOF'
[Unit]
Description=Clear FPLMN blacklist
After=network.target

[Service]
Type=oneshot
ExecStart=/usrdata/simpleadmin/scripts/clear_fplmn.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# 内存优化
cat > /etc/sysctl.d/99-memory-optimize.conf << 'EOF'
vm.swappiness = 10
vm.vfs_cache_pressure = 50
EOF

systemctl daemon-reload
systemctl enable modem_watchdog_v3.service
systemctl enable clear-fplmn.service
```

## 访问地址

- 主页: `https://192.168.225.1/`
- React 版: `https://192.168.225.1/new/index.html`
- 救砖: `https://192.168.225.1/recovery.html`

## 许可证

基于 [iamromulan](https://github.com/iamromulan) 的 SimpleAdmin 项目，遵循原始许可。