#!/usr/bin/env node
/**
 * 预提交图片优化脚本
 * 自动将 PNG 图片转换为 WebP 并更新所有引用
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const srcDir = join(rootDir, 'src')
const publicDir = join(srcDir, 'public')

// 需要搜索的文件扩展名
const SEARCH_EXTENSIONS = ['.md', '.vue', '.ts', '.mts', '.js', '.jsx', '.tsx', '.css', '.html']

// 排除的目录
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.vitepress', 'cache']

// 不转换的文件（保留 PNG 格式，如 favicon）
const KEEP_PNG_FILES = ['app_icon.png', 'favicon.png', 'favicon.ico']

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dir, files = []) {
  if (!existsSync(dir)) return files
  
  const items = readdirSync(dir)
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(item)) {
        getAllFiles(fullPath, files)
      }
    } else {
      files.push(fullPath)
    }
  }
  return files
}

/**
 * 转换单个 PNG 为 WebP
 */
async function convertPngToWebp(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, '.webp')
  
  try {
    await sharp(pngPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath)
    
    console.log(`✅ 转换成功: ${relative(rootDir, pngPath)} -> ${relative(rootDir, webpPath)}`)
    return webpPath
  } catch (error) {
    console.error(`❌ 转换失败: ${relative(rootDir, pngPath)}`, error.message)
    return null
  }
}

/**
 * 更新文件中的图片引用
 */
function updateReferences(pngPath, webpPath) {
  const pngRelative = relative(rootDir, pngPath).replace(/\\/g, '/')
  const webpRelative = relative(rootDir, webpPath).replace(/\\/g, '/')
  
  // 构建不同的引用模式
  const pngName = basename(pngPath)
  const webpName = basename(webpPath)
  
  // 引用模式：可能在 src/public 目录下，引用时是 /xxx.png
  const publicPngRef = '/' + pngName
  const publicWebpRef = '/' + webpName
  
  let updatedCount = 0
  
  // 获取所有需要检查的文件
  const allFiles = getAllFiles(srcDir)
  
  for (const file of allFiles) {
    const ext = extname(file).toLowerCase()
    if (!SEARCH_EXTENSIONS.includes(ext)) continue
    
    try {
      let content = readFileSync(file, 'utf-8')
      let modified = false
      
      // 替换各种引用模式
      const patterns = [
        // 直接文件名引用 (如 /app_icon.png)
        { from: publicPngRef, to: publicWebpRef },
        // 相对路径引用
        { from: pngRelative, to: webpRelative },
        // Markdown 图片语法
        { from: `](${publicPngRef})`, to: `](${publicWebpRef})` },
        { from: `](./${pngName})`, to: `](./${webpName})` },
        // HTML/Vue img src
        { from: `src="${publicPngRef}"`, to: `src="${publicWebpRef}"` },
        { from: `src='${publicPngRef}'`, to: `src='${publicWebpRef}'` },
        // CSS url()
        { from: `url(${publicPngRef})`, to: `url(${publicWebpRef})` },
        { from: `url("${publicPngRef}")`, to: `url("${publicWebpRef}")` },
        { from: `url('${publicPngRef}')`, to: `url('${publicWebpRef}')` },
      ]
      
      for (const { from, to } of patterns) {
        if (content.includes(from)) {
          content = content.split(from).join(to)
          modified = true
        }
      }
      
      if (modified) {
        writeFileSync(file, content)
        console.log(`📝 更新引用: ${relative(rootDir, file)}`)
        updatedCount++
      }
    } catch (error) {
      // 忽略读取错误（可能是二进制文件）
    }
  }
  
  return updatedCount
}

/**
 * 删除原始 PNG 文件
 */
function deletePngFile(pngPath) {
  try {
    if (existsSync(pngPath)) {
      unlinkSync(pngPath)
      console.log(`🗑️ 删除原文件: ${relative(rootDir, pngPath)}`)
    }
  } catch (error) {
    console.error(`⚠️ 删除失败: ${relative(rootDir, pngPath)}`, error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const pngFiles = args.filter(arg => /\.png$/i.test(arg))

  if (pngFiles.length === 0) {
    console.log('没有 PNG 文件需要转换')
    return
  }

  console.log(`\n🖼️ 开始处理 ${pngFiles.length} 个 PNG 文件...\n`)

  let convertedCount = 0
  let skippedCount = 0
  let updatedFilesCount = 0

  for (const pngFile of pngFiles) {
    // 转换为绝对路径
    const absolutePath = pngFile.startsWith('/') || pngFile.includes(':')
      ? pngFile
      : join(rootDir, pngFile)

    if (!existsSync(absolutePath)) {
      console.log(`⚠️ 文件不存在: ${pngFile}`)
      continue
    }

    // 检查是否在保留列表中
    const fileName = basename(absolutePath)
    if (KEEP_PNG_FILES.includes(fileName)) {
      console.log(`⏭️ 跳过保留文件: ${fileName}`)
      skippedCount++
      continue
    }

    // 转换为 WebP
    const webpPath = await convertPngToWebp(absolutePath)
    if (!webpPath) continue

    convertedCount++

    // 更新引用
    const updated = updateReferences(absolutePath, webpPath)
    updatedFilesCount += updated

    // 删除原 PNG 文件
    deletePngFile(absolutePath)
  }

  console.log(`\n✨ 完成！转换了 ${convertedCount} 个文件，跳过了 ${skippedCount} 个保留文件，更新了 ${updatedFilesCount} 个引用文件\n`)
}

main().catch(console.error)