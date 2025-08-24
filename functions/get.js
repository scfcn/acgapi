/**
 * 根据设备类型从不同图片集合中随机选择图片并进行302重定向
 */
export function onRequest({ request }) {
  // 根据设备类型选择图片集合
  const userAgent = request.headers.get('User-Agent') || '';
  const isMobile = /mobile|android|iphone|ipad|ipod|opera mini|iemobile|windows phone/i.test(userAgent);
  const imageDir = isMobile ? 'acg_m' : 'acg_pc';
  
  // 假设所有图片集合最大数量相同，设为一个固定值（实际使用时需根据真实情况调整）
  const maxImages = 517;
  
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