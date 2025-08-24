/**
 * 访问/pe路径：重定向到手机端图片
 */
export function onRequest({ request }) {
  // 选择手机端图片集合
  const imageDir = 'acg_m';
  const maxImages = 517;  // acg_m目录的图片数量
  
  // 生成随机图片索引
  const randomIndex = Math.floor(Math.random() * maxImages) + 1;
  const imageIndex = randomIndex.toString().padStart(4, '0');
  
  // 构建图片URL
  const imageUrl = `/${imageDir}/pic_${imageIndex}.png`;
  
  // 返回302重定向响应
  return Response.redirect(imageUrl, 302);
}