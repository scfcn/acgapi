/**
 * 简单测试脚本：验证/get路径根据设备类型返回不同ACG资源
 */

// 直接修改get.js，添加简单的日志输出
const fs = require('fs');
const path = require('path');

// 读取get.js文件内容
const getJsPath = path.join(__dirname, 'get.js');
const getJsContent = fs.readFileSync(getJsPath, 'utf8');

// 临时修改get.js，添加日志输出
const modifiedContent = getJsContent.replace(
  '    // 根据路径确定要使用的图片集合\n    if (path === \'/get\' || path === \'/get/\') {\n      // 对于/get路径，根据设备类型选择默认集合\n      const userAgent = request.headers.get(\'User-Agent\') || \'\';\n      const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);\n      \n      // 移动设备优先选择acg_m，桌面设备优先选择acg_pc\n      selectedCollection = isMobile ? acg_m : acg_pc;\n    }',
  '    // 根据路径确定要使用的图片集合\n    if (path === \'/get\' || path === \'/get/\') {\n      // 对于/get路径，根据设备类型选择默认集合\n      const userAgent = request.headers.get(\'User-Agent\') || \'\';\n      const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);\n      \n      // 移动设备优先选择acg_m，桌面设备优先选择acg_pc\n      selectedCollection = isMobile ? acg_m : acg_pc;\n      console.log(`设备类型: ${isMobile ? \'移动设备\' : \'桌面设备\'}`);\n      console.log(`选择的集合: ${selectedCollection.dir}`);\n    }'
);

// 写入修改后的文件
fs.writeFileSync(getJsPath, modifiedContent, 'utf8');

console.log('已修改get.js文件，添加设备检测日志');

// 创建简单的模拟函数来测试
function testDeviceDetection() {
  console.log('\n===== 测试设备检测功能 =====');
  
  // 模拟移动设备请求
  console.log('\n测试移动设备:');
  const mobileRequest = {
    url: 'http://example.com/get',
    headers: {
      get: (name) => {
        if (name.toLowerCase() === 'user-agent') {
          return 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15';
        }
        return null;
      }
    }
  };
  
  // 模拟桌面设备请求
  console.log('\n测试桌面设备:');
  const desktopRequest = {
    url: 'http://example.com/get',
    headers: {
      get: (name) => {
        if (name.toLowerCase() === 'user-agent') {
          return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        }
        return null;
      }
    }
  };
  
  // 导入修改后的get.js模块
  console.log('\n正在加载get.js模块...');
  const { onRequest } = require('./get');
  
  // 执行测试
  console.log('\n开始测试...');
  
  // 模拟Response对象
  global.Response = class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this._headers = init?.headers || {};
      this.redirectLocation = init?.headers?.Location || '';
    }
  };
  
  // 模拟URL对象
  global.URL = class MockURL {
    constructor(url) {
      this.pathname = '/get';
    }
  };
  
  // 测试移动设备
  console.log('\n[开始测试移动设备]');
  const mobileResult = onRequest({
    request: mobileRequest
  }).catch(err => {
    console.log('移动设备测试出错:', err.message);
  });
  
  // 测试桌面设备
  console.log('\n[开始测试桌面设备]');
  const desktopResult = onRequest({
    request: desktopRequest
  }).catch(err => {
    console.log('桌面设备测试出错:', err.message);
  });
  
  console.log('\n测试完成! 请查看上面的设备检测日志以验证功能。');
  console.log('移动设备应该选择 acg_m 集合');
  console.log('桌面设备应该选择 acg_pc 集合');
}

// 运行测试
testDeviceDetection();

// 恢复原始内容
setTimeout(() => {
  fs.writeFileSync(getJsPath, getJsContent, 'utf8');
  console.log('\n已恢复get.js文件的原始内容');
}, 1000);