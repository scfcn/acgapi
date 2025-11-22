/**
 * acg_pc分类图片配置
 */
module.exports = {
  dir: 'acg_pc',
  maxImages: 274,
  // 写死的图片格式配置，优先级：avif > png
  supportedFormats: ['avif', 'png'],
  // 默认使用png格式
  defaultFormat: 'png'
};