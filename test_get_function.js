// 简单的测试脚本，模拟EdgeOne环境并测试get.js功能

// 模拟fetch API
global.fetch = async (url, options) => {
  console.log(`模拟请求到: ${url}`);
  // 返回模拟的GitHub API响应
  return {
    ok: true,
    json: async () => []
  };
};

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
  console.log('开始测试get.js功能...');
  
  const testPaths = [
    '/get',
    '/jk',
    '/meinv',
    '/heisi',
    '/baisi'
  ];
  
  try {
    for (const path of testPaths) {
      console.log(`测试路径: ${path}`);
      const request = createMockRequest(path);
      const result = await getFunction.onRequest({ request });
      
      console.log(`  响应状态: ${result.status}`);
      console.log(`  重定向位置: ${result.headers.get('Location')}`);
      console.log('  测试通过');
    }
    
    console.log('\n所有测试通过!');
  } catch (error) {
    console.error('\n测试失败:', error);
    process.exit(1);
  }
}

// 执行测试
runTests();