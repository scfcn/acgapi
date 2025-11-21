/**
 * 根据访问路径从不同图片集合中随机选择图片并进行302重定向
 * - 访问/get路径：从所有可用目录中随机选择
 * - 使用GitHub API动态获取目录中的图片数量，避免手动更新
 */

// GitHub仓库信息配置
// 注意：请修改为您实际的GitHub信息
const GITHUB_CONFIG = {
  // 优先从环境变量读取配置，如果环境变量不存在则使用默认值
  owner: getEnvVar('GITHUB_OWNER', 'scfcn'),  // 请替换为实际的GitHub用户名
  repo: getEnvVar('GITHUB_REPO', 'acgapi'),    // 请替换为实际的仓库名
  defaultBranch: getEnvVar('GITHUB_BRANCH', 'main'),          // 或 'master'
  // 可选：如果需要提高API请求限制，可以添加token
  token: getEnvVar('GITHUB_TOKEN', '') // 建议通过环境变量设置token，不要直接硬编码
};

/**
 * 从环境变量获取配置，如果不存在则返回默认值
 * 在Cloudflare Workers环境中，使用process.env可能无法工作
 * 在实际部署时，请根据您的环境调整此函数
 */
function getEnvVar(name, defaultValue = '') {
  // 尝试从不同的环境变量来源获取
  // 对于Cloudflare Workers，应该使用wrangler.toml中的变量
  // 对于Node.js环境，使用process.env
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  // 可以添加其他环境变量获取方式
  return defaultValue;
}

// 验证GitHub配置
function validateGitHubConfig() {
  const errors = [];
  
  if (!GITHUB_CONFIG.owner || GITHUB_CONFIG.owner === 'your-github-username') {
    errors.push('请配置GitHub用户名 (GITHUB_OWNER)');
  }
  
  if (!GITHUB_CONFIG.repo || GITHUB_CONFIG.repo === 'your-repository-name') {
    errors.push('请配置GitHub仓库名 (GITHUB_REPO)');
  }
  
  if (errors.length > 0) {
    console.warn('GitHub配置警告:', errors.join(', '));
    console.warn('系统将使用默认图片数量，无法动态获取图片数量');
    return false;
  }
  
  return true;
}

// 缓存机制：存储目录图片数量和缓存时间
let imageCountCache = {};
const CACHE_DURATION = 3600000; // 缓存1小时（毫秒）

/**
 * 使用GitHub API获取指定目录中的图片文件数量
 * @param {string} dirName - 目录名称
 * @param {object} defaultCollections - 默认的目录配置（包含默认图片数量）
 * @returns {Promise<number>} - 目录中的图片数量
 */
async function getImageCountFromGitHub(dirName, defaultCollections) {
  // 检查缓存
  const now = Date.now();
  if (imageCountCache[dirName] && (now - imageCountCache[dirName].timestamp < CACHE_DURATION)) {
    return imageCountCache[dirName].count;
  }
  
  // 获取默认值作为后备
  const defaultCount = defaultCollections.find(c => c.dir === dirName)?.maxImages || 20;
  
  try {
    // 构建GitHub API URL
    const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${dirName}?ref=${GITHUB_CONFIG.defaultBranch}`;
    
    // 准备请求头
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Cloudflare-Workers-Image-API'
    };
    
    // 如果提供了token，添加到请求头
    if (GITHUB_CONFIG.token) {
      headers['Authorization'] = `token ${GITHUB_CONFIG.token}`;
    }
    
    // 发送请求到GitHub API
    const response = await fetch(apiUrl, { headers });
    
    // 检查响应状态
    if (!response.ok) {
      console.warn(`GitHub API请求失败: ${response.status}, 回退到默认值`);
      return defaultCount;
    }
    
    // 解析响应数据
    const files = await response.json();
    
    // 统计图片文件数量，包括.png和.avif格式
    const imageCount = files.filter(file => 
      file.type === 'file' && (file.name.endsWith('.png') || file.name.endsWith('.avif'))
    ).length;
    
    // 更新缓存
    imageCountCache[dirName] = {
      count: imageCount || defaultCount,
      timestamp: now
    };
    
    return imageCount || defaultCount;
  } catch (error) {
    console.error(`获取目录${dirName}的图片数量时出错:`, error);
    // 发生错误时返回默认值
    return defaultCount;
  }
}

export async function onRequest({ request }) {
  // 修正：从URL对象中获取路径
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 定义所有可用的图片目录及默认最大图片数量
  // 这些值将作为GitHub API调用失败时的备用
  const defaultCollections = [
    { dir: 'acg_m', maxImages: 510 },
    { dir: 'acg_pc', maxImages: 274 },
    { dir: 'baisi', maxImages: 20 },
    { dir: 'heisi', maxImages: 20 },
    { dir: 'jk', maxImages: 142 },
    { dir: 'meinv', maxImages: 138 }
  ];
  
  let selectedCollection;
  
  // 根据路径判断使用哪个图片目录
  if (path === '/get' || path === '/get/') {
    // 从所有可用目录中随机选择一个
    const randomIndex = Math.floor(Math.random() * defaultCollections.length);
    const dirName = defaultCollections[randomIndex].dir;
    
    // 动态获取该目录的图片数量
    const imageCount = await getImageCountFromGitHub(dirName, defaultCollections);
    selectedCollection = { dir: dirName, maxImages: imageCount };
  } else {
    // 处理特定目录的访问路径，例如：/get/baisi, /get/heisi等
    const dirMatch = path.match(/\/get\/(\w+)/);
    if (dirMatch) {
      const requestedDir = dirMatch[1];
      const defaultConfig = defaultCollections.find(c => c.dir === requestedDir);
      
      if (defaultConfig) {
        // 动态获取该目录的图片数量
        const imageCount = await getImageCountFromGitHub(requestedDir, defaultCollections);
        selectedCollection = { dir: requestedDir, maxImages: imageCount };
      } else {
        // 请求的目录不存在，默认从所有目录中随机选择
        const randomIndex = Math.floor(Math.random() * defaultCollections.length);
        const dirName = defaultCollections[randomIndex].dir;
        const imageCount = await getImageCountFromGitHub(dirName, defaultCollections);
        selectedCollection = { dir: dirName, maxImages: imageCount };
      }
    } else {
      // 默认行为：从所有目录中随机选择
      const randomIndex = Math.floor(Math.random() * defaultCollections.length);
      const dirName = defaultCollections[randomIndex].dir;
      const imageCount = await getImageCountFromGitHub(dirName, defaultCollections);
      selectedCollection = { dir: dirName, maxImages: imageCount };
    }
  }
  
  // 从选中的目录中生成随机图片索引（1-based）
  const imageIndex = Math.floor(Math.random() * selectedCollection.maxImages) + 1;
  
  // 随机选择图片格式（png或avif）
  const formats = ['png', 'avif'];
  const randomFormat = formats[Math.floor(Math.random() * formats.length)];
  
  // 格式化图片文件名（例如：pic_0001.png 或 pic_0001.avif）
  const imageFileName = `pic_${imageIndex.toString().padStart(4, '0')}.${randomFormat}`;
  
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
}
