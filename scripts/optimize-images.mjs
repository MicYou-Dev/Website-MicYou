import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'src', 'public')

const images = ['app_icon.png', 'input-device.png', 'output-device.png']

async function getFileSize(path) {
  const buffer = await sharp(path).toBuffer()
  return buffer.length / 1024
}

async function optimizeImages() {
  console.log('开始优化图片...\n')
  
  for (const image of images) {
    const inputPath = join(publicDir, image)
    const webpName = image.replace('.png', '.webp')
    const outputPath = join(publicDir, webpName)
    
    try {
      const imageSharp = sharp(inputPath)
      const metadata = await imageSharp.metadata()
      
      const originalSize = await getFileSize(inputPath)
      
      console.log(`${image}:`)
      console.log(`  原始尺寸: ${metadata.width}x${metadata.height}`)
      console.log(`  原始格式: ${metadata.format}`)
      console.log(`  原始大小: ${originalSize.toFixed(1)} KB`)
      
      // 转换为 WebP
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath)
      
      const webpSize = await getFileSize(outputPath)
      const saved = ((1 - webpSize / originalSize) * 100).toFixed(1)
      
      console.log(`  WebP 大小: ${webpSize.toFixed(1)} KB`)
      console.log(`  节省: ${saved}%\n`)
      
    } catch (error) {
      console.error(`处理 ${image} 失败:`, error.message)
    }
  }
  
  // 生成图片尺寸信息文件
  const sizes = {}
  for (const image of images) {
    const inputPath = join(publicDir, image)
    try {
      const metadata = await sharp(inputPath).metadata()
      sizes[image] = { width: metadata.width, height: metadata.height }
    } catch (error) {
      console.error(`获取 ${image} 尺寸失败:`, error.message)
    }
  }
  
  const sizesPath = join(publicDir, 'image-sizes.json')
  writeFileSync(sizesPath, JSON.stringify(sizes, null, 2))
  console.log('图片尺寸信息已保存到 image-sizes.json')
}

optimizeImages().catch(console.error)