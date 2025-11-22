// 测试脚本，验证get.js功能与独立配置文件的集成

// 加载get.js模块
const getFunction = require('./node-functions/get');

// 模拟请求对象
function createMockRequest(path, userAgent = '') {
  return {
    url: `https://example.com${path}`,
    headers: {
      get: (name) => {
        if (name.toLowerCase() === 'user-agent') return userAgent;
        return '';
      }
    }
  };
}

// 运行测试
async function runTests() {
  console.log('开始测试get.js功能与独立配置文件集成...');
  
  // 测试所有可用的路径
  const testPaths = [
    '/get',      // 默认路径
    '/jk',       // JK分类
    '/meinv',    // 美女分类
    '/heisi',    // 黑丝分类
    '/baisi',    // 白丝分类
    '/acg_m',    // ACG移动端分类
    '/acg_pc'    // ACG桌面端分类
  ];
  
  let allTestsPassed = true;
  
  try {
    for (const path of testPaths) {
      console.log(`\n测试路径: ${path}`);
      const request = createMockRequest(path);
      const result = await getFunction.onRequest({ request });
      
      console.log(`  响应状态: ${result.status}`);
      console.log(`  重定向位置: ${result.headers.get('Location')}`);
      
      // 验证响应是否为302重定向
      if (result.status === 302) {
        const location = result.headers.get('Location');
        // 验证重定向URL是否包含有效的图片路径和扩展名
        if (location && (location.endsWith('.png') || location.endsWith('.avif'))) {
          console.log('  ✓ 测试通过');
        } else {
          console.error('  ✗ 测试失败: 重定向URL无效');
          allTestsPassed = false;
        }
      } else {
        console.error(`  ✗ 测试失败: 期望302状态码，但得到${result.status}`);
        allTestsPassed = false;
      }
    }
    
    console.log('\n' + (allTestsPassed ? '所有测试通过!' : '部分测试失败!'));
    if (!allTestsPassed) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n测试失败:', error);
    process.exit(1);
  }
}

// 执行测试
runTests();