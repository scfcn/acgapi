/**
 * 测试脚本：验证/get路径根据设备类型返回不同ACG资源
 */

// 直接修改get.js，添加日志来验证设备检测逻辑
const fs = require('fs');
const path = require('path');

// 读取get.js文件内容
const getJsPath = path.join(__dirname, 'get.js');
const getJsContent = fs.readFileSync(getJsPath, 'utf8');

// 临时修改get.js，添加日志输出
const modifiedContent = getJsContent.replace(
  '    // 根据路径确定要使用的图片集合\n    if (path === \'/get\' || path === \'/get/\') {\n      // 对于/get路径，根据设备类型选择默认集合\n      const userAgent = request.headers.get(\'User-Agent\') || \'\';\n      const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);\n      \n      // 移动设备优先选择acg_m，桌面设备优先选择acg_pc\n      selectedCollection = isMobile ? acg_m : acg_pc;\n    }',
  '    // 根据路径确定要使用的图片集合\n    if (path === \'/get\' || path === \'/get/\') {\n      // 对于/get路径，根据设备类型选择默认集合\n      const userAgent = request.headers.get(\'User-Agent\') || \'\';\n      const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);\n      \n      // 移动设备优先选择acg_m，桌面设备优先选择acg_pc\n      selectedCollection = isMobile ? acg_m : acg_pc;\n      console.log(`[设备检测] User-Agent: ${userAgent.substring(0, 50)}...`);\n      console.log(`[设备检测] 是移动设备: ${isMobile}`);\n      console.log(`[设备检测] 选择集合: ${selectedCollection.dir}`);\n    }'
);

// 写入修改后的文件
fs.writeFileSync(getJsPath, modifiedContent, 'utf8');

console.log('已修改get.js文件，添加设备检测日志');
console.log('\n现在可以手动测试或使用以下命令启动服务进行测试:');
console.log('node -e "\nconst { onRequest } = require(\'./get\');\n\n// 模拟移动设备请求\nclass MockRequest {\n  constructor(url, headers) {\n    this.url = url;\n    this._headers = headers;\n  }\n  get headers() {\n    return {\n      get: (name) => this._headers[name.toLowerCase()]\n    };\n  }\n}\n\nconsole.log(\'测试移动设备:\');\nonRequest({ request: new MockRequest(\'http://example.com/get\', { \'user-agent\': \'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1\' }) })\n.then(res => {\n  console.log(`移动设备重定向到: ${res._headers.Location}`);\n  console.log(\'\n测试桌面设备:\');\n  return onRequest({ request: new MockRequest(\'http://example.com/get\', { \'user-agent\': \'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\' }) });\n})\n.then(res => {\n  console.log(`桌面设备重定向到: ${res._headers.Location}`);\n});"');

console.log('\n请复制上面的命令在node-functions目录下运行进行测试。');
console.log('测试完成后，将恢复get.js文件的原始内容。');

// 恢复原始内容的函数
function restoreOriginal() {
  fs.writeFileSync(getJsPath, getJsContent, 'utf8');
  console.log('已恢复get.js文件的原始内容');
}

// 注册进程退出时恢复文件
process.on('exit', () => {
  restoreOriginal();
});
process.on('SIGINT', () => {
  restoreOriginal();
  process.exit();
});

console.log('\n注意：此脚本会在进程退出时自动恢复get.js的原始内容。')