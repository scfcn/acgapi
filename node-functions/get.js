/**
 * get.js - 随机图片API实现
 * 功能：根据不同路径返回随机图片，支持分类和格式选择
 */

// 导入各个分类的独立配置文件
const acg_m = require('./acg_m');
const acg_pc = require('./acg_pc');
const jk = require('./jk');
const meinv = require('./meinv');
const heisi = require('./heisi');
const baisi = require('./baisi');

// 路径到配置的映射
const pathToConfig = {
  '/jk': jk,
  '/meinv': meinv,
  '/heisi': heisi,
  '/baisi': baisi,
  '/get': null, // 随机选择集合
  '/acg_m': acg_m,
  '/acg_pc': acg_pc
};

/**
 * 从环境变量获取配置，如果不存在则返回默认值
 * 兼容EdgeOne和Node.js环境
 */
function getEnvVar(name, defaultValue = '') {
  try {
    // 尝试从不同的环境变量来源获取
    // 对于EdgeOne环境
    if (typeof env !== 'undefined' && env[name] !== undefined) {
      return env[name];
    }
    // 对于Node.js环境
    if (typeof process !== 'undefined' && process.env && process.env[name] !== undefined) {
      return process.env[name];
    }
  } catch (error) {
    console.warn(`获取环境变量${name}时出错:`, error);
  }
  
  return defaultValue;
}

// 缓存机制：存储目录图片数量和缓存时间
let imageCountCache = {};
const CACHE_DURATION = 3600000; // 缓存1小时（毫秒）

async function onRequest({ request }) {
  try {
    // 修正：从URL对象中获取路径
    const url = new URL(request.url);
    const path = url.pathname || '/get'; // 提供默认路径防止undefined
    
    // 默认集合配置
    const defaultCollections = [acg_m, acg_pc, baisi, heisi, jk, meinv];
  
  let selectedCollection;
  let isACGPath = false;
  
    // 根据路径确定要使用的图片集合
    if (path === '/get' || path === '/get/') {
      // 对于/get路径，根据设备类型选择默认集合
      const userAgent = request.headers.get('User-Agent') || '';
      const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // 移动设备优先选择acg_m，桌面设备优先选择acg_pc
      selectedCollection = isMobile ? acg_m : acg_pc;
    } else if (pathToConfig[path] || pathToConfig[path + '/']) {
      // 对于已知路径，从映射中获取对应的配置
      selectedCollection = pathToConfig[path] || pathToConfig[path + '/'];
    } else {
      // 兼容旧版API路径格式 /get/{dir}
      const dirMatch = path.match(/\/get\/(\w+)/);
      if (dirMatch) {
        const requestedDir = dirMatch[1];
        const configForDir = Object.values(pathToConfig).find(c => c && c.dir === requestedDir);
        if (configForDir) {
          selectedCollection = configForDir;
        } else {
          // 请求的目录不存在，使用默认行为
          const userAgent = request.headers.get('User-Agent') || '';
          const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
          selectedCollection = isMobile ? acg_m : acg_pc;
        }
      } else {
        // 其他路径选择默认集合
        selectedCollection = defaultCollections[Math.floor(Math.random() * defaultCollections.length)];
      }
    }
  
  // 从选中的目录中生成随机图片索引（1-based）
  const imageIndex = Math.floor(Math.random() * selectedCollection.maxImages) + 1;
  
  // 获取可用的文件扩展名（从配置中读取）
  const fileExtension = getAvailableFileExtension(selectedCollection);
  
  // 格式化图片文件名（例如：pic_0001.png 或 pic_0001.avif）
  const imageFileName = `pic_${imageIndex.toString().padStart(4, '0')}.${fileExtension}`;
  
  // 构建图片URL
  const imageUrl = `/${selectedCollection.dir}/${imageFileName}`;
  
    // 创建302重定向响应
    return new Response(null, {
      status: 302,
      headers: {
        'Location': imageUrl,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('处理请求时出错:', error);
    // 返回500错误响应
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: '处理请求时发生错误'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

/**
 * 获取指定图片索引的可用文件格式（使用写死的配置）
 * @param {Object} config - 图片集合配置
 * @param {number} imageIndex - 图片索引
 * @returns {string} - 可用的文件扩展名
 */
function getAvailableFileExtension(config) {
  try {
    // 使用配置中写死的格式设置
    // 默认按照配置中的supportedFormats优先级选择，这里简化为直接返回优先格式
    // 实际应用中可以添加更复杂的格式检测逻辑
    
    // 根据配置返回优先格式
    if (config && config.supportedFormats && config.supportedFormats.length > 0) {
      // 优先返回配置中定义的第一种格式
      return config.supportedFormats[0] || config.defaultFormat || 'png';
    }
    
    // 如果配置中没有格式信息，使用默认值
    return config && config.defaultFormat || 'png';
  } catch (error) {
    console.error(`获取文件格式时出错:`, error);
    // 发生错误时返回配置中的默认格式或png
    return (config && config.defaultFormat) || 'png';
  }
}

// CommonJS风格导出，用于Node.js环境
module.exports = {
  onRequest
};
