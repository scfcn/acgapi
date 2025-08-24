<p align="center">
  <img src="/favicon.ico" width="100" height="100" alt="acgapi Logo">
</p>

<h1 align="center">青序图片API</h1>

<p align="center">免费部署的随机图片API</p>

<p align="center">
  <img src="https://img.shields.io/github/license/scfcn/acgapi?style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/stars/scfcn/acgapi?style=flat-square" alt="Stars" />
  <img src="https://img.shields.io/github/last-commit/scfcn/acgapi?style=flat-square" alt="Last Commit" />
</p>
<p align="center">
  <a href="https://edgeone.ai/pages/new?repository-url=https://github.com/scfcn/acgapi/" target="_blank" rel="noopener noreferrer">
    <img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="Deploy with EdgeOne Pages">
  </a>
</p>
<p align="center">🎮 在线演示：
  <a href="https://acg.qxzhan.cn" target="_blank">
  https://acg.qxzhan.cn
  </a>
</p>

## 📖 简介

这是一个提供随机ACG图片访问的API服务，支持根据设备类型自动选择适配的图片尺寸，也可以手动指定获取电脑端或移动端图片。

## ✨ 特性
### 1. 自动选择设备类型
- 路径： /get
- 功能：根据访问设备的User-Agent自动选择返回电脑端或移动端图片
- 响应：302重定向到随机图片URL
### 2. 电脑端图片
- 路径： /pc
- 功能：返回电脑端尺寸的随机图片
- 响应：302重定向到随机图片URL
### 3. 移动端图片
- 路径： /pe
- 功能：返回移动端尺寸的随机图片
- 响应：302重定向到随机图片URL

## 项目结构
```PlainText
acgapi/
├── 404.avif                 # 404错误页面图片
├── acg_m/                   # 移动端图片目录
├── acg_pc/                  # 电脑端图片目录
├── edgeone.json             # EdgeOne配置文件
├── favicon.ico              # 网站图标
├── functions/               # 云函数目录
│   ├── get.js               # 处理/get路径的函数
│   ├── pc.js                # 处理/pc路径的函数
│   └── pe.js                # 处理/pe路径的函数
├── index.html               # 项目主页
└── js/                      # JavaScript目录
    └── tailwindcss.js       # Tailwind CSS配置
```

## 使用示例
### 直接访问
你可以直接在浏览器中访问以下URL：

- 自动选择： https://acg.qxzhan.cn/get
- 电脑端： https://acg.qxzhan.cn/pc
- 移动端： https://acg.qxzhan.cn/pe
### 在HTML中使用
### 在JavaScript中使用
## 注意事项
1. 1.
   确保图片目录 acg_pc 和 acg_m 中包含足够的图片文件
2. 2.
   图片文件命名格式应为 pic_xxxx.png （xxxx为4位数字，如 pic_0001.png ）
3. 3.
   根据实际图片数量调整 pc.js 和 pe.js 文件中的 maxImages 值

## CDN赞助

本项目的 CDN 加速和安全保护由腾讯 EdgeOne 赞助
<a href="https://edgeone.ai/?from=github" target="_blank">
    最佳亚洲 CDN、Edge 和安全解决方案 - 腾讯 EdgeOne
<img src="https://edgeone.ai/media/34fe3a45-492d-4ea4-ae5d-ea1087ca7b4b.png" width="500" height="100">
</a>

## 📝 开源协议

[MIT License](LICENSE)
