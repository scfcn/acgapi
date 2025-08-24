/**
 * 根据访问路径或设备类型从不同图片集合中随机选择图片并进行302重定向
 * - 访问/pc路径：重定向到电脑端图片
 * - 访问/pe路径：重定向到手机端图片
 * - 访问其他路径(包括/get)：根据设备类型自动选择
 */
export function onRequest({ request }) {
  // 从URL对象中获取路径
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 定义图片目录和最大图片数量
  let imageDir, maxImages;
  
  // 根据路径判断使用哪个图片目录
  if (path === '/pc') {
    imageDir = 'acg_pc';
    maxImages = 267;  // acg_pc目录的图片数量
  } else if (path === '/pe') {
    imageDir = 'acg_m';
    maxImages = 517;  // acg_m目录的图片数量
  } else {
    // 默认逻辑：根据设备类型选择图片集合
    const userAgent = request.headers.get('User-Agent') || '';
    const isMobile = /mobile|android|iphone|ipad|ipod|opera mini|iemobile|windows phone/i.test(userAgent);
    imageDir = isMobile ? 'acg_m' : 'acg_pc';
    maxImages = isMobile ? 517 : 267;
  }
  
  // 生成随机图片索引（1-based）
  const randomIndex = Math.floor(Math.random() * maxImages) + 1;
  
  // 格式化图片文件名（例如：pic_0001.png）
  const imageFileName = `pic_${randomIndex.toString().padStart(4, '0')}.png`;
  
  // 构建图片URL
  const imageUrl = `/${imageDir}/${imageFileName}`;
  
  // 创建302重定向响应
  return new Response(null, {
    status: 302,
    headers: {
      'Location': imageUrl
    }
  });
}