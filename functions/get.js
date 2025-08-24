/**
 * 根据访问设备类型从不同图片集合中随机选择图片并进行302重定向
 */
export function onRequest({ request }) {
  // 获取User-Agent头以检测设备类型
  const userAgent = request.headers.get('User-Agent') || '';
  
  // 检测是否为移动设备
  const isMobile = /mobile|android|iphone|ipad|ipod|opera mini|iemobile|windows phone/i.test(userAgent);
  
  // 根据设备类型选择图片集合
  const imageDir = isMobile ? 'acg_m' : 'acg_pc';
  
  // 获取指定目录中的图片数量（根据实际情况调整范围）
  // 这里假设acg_m目录有517张图片，acg_pc目录有267张图片
  const maxImages = isMobile ? 517 : 267;
  
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