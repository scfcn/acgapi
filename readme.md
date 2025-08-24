


          
# ACG图片API服务

## 项目概述
这是一个提供随机ACG图片访问的API服务，支持根据设备类型自动选择适配的图片尺寸，也可以手动指定获取电脑端或移动端图片。

## API接口说明

### 1. 自动选择设备类型
- 路径：`/get`
- 功能：根据访问设备的User-Agent自动选择返回电脑端或移动端图片
- 响应：302重定向到随机图片URL

### 2. 电脑端图片
- 路径：`/pc`
- 功能：返回电脑端尺寸的随机图片
- 响应：302重定向到随机图片URL

### 3. 移动端图片
- 路径：`/pe`
- 功能：返回移动端尺寸的随机图片
- 响应：302重定向到随机图片URL

## 项目结构
```
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

## 部署指南

### 环境要求
- 支持Cloudflare Workers或类似的Serverless环境
- 或任何支持JavaScript的Web服务器

### 部署步骤
1. 将项目文件上传到你的服务器或Serverless环境
2. 确保`functions`目录中的函数被正确映射到对应的URL路径
3. 检查`acg_pc`和`acg_m`目录是否包含图片文件
4. 启动服务器或部署Serverless函数

### Cloudflare Workers部署额外说明
如果使用Cloudflare Workers，建议创建`wrangler.toml`文件并添加以下路由配置：
```toml
[[routes]]
pattern = "*/get"
function = "get"

[[routes]]
pattern = "*/pc"
function = "pc"

[[routes]]
pattern = "*/pe"
function = "pe"
```

## 使用示例

### 直接访问
你可以直接在浏览器中访问以下URL：
- 自动选择：`https://acg.qxzhan.cn/get`
- 电脑端：`https://acg.qxzhan.cn/pc`
- 移动端：`https://acg.qxzhan.cn/pe`

### 在HTML中使用
```html
<img src="https://acg.qxzhan.cn/get" alt="随机ACG图片">
```

### 在JavaScript中使用
```javascript
// 获取随机图片并显示
fetch('https://acg.qxzhan.cn/get', { redirect: 'follow' })
  .then(response => {
    const imageUrl = response.url;
    document.getElementById('randomImage').src = imageUrl;
  })
  .catch(error => console.error('获取图片失败:', error));
```

## 注意事项
1. 确保图片目录`acg_pc`和`acg_m`中包含足够的图片文件
2. 图片文件命名格式应为`pic_xxxx.png`（xxxx为4位数字，如`pic_0001.png`）
3. 根据实际图片数量调整`pc.js`和`pe.js`文件中的`maxImages`值

## 更新日志
- 初始版本：实现基本的随机图片返回功能
- 分离路由：将/pc和/pe路径分离到独立文件处理
- 优化逻辑：优化设备类型判断和图片选择逻辑

希望这个API服务能为你的项目提供丰富的ACG图片资源！