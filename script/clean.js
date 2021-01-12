/**
 * 清理以准备构建
 */

'use strict'

const fs = require('fs')
const path = require('path')

const DIST_PATH = path.join(__dirname, '../dist')

function rmrf(_path) {
  if (!fs.existsSync(DIST_PATH)) return
  let files
  try {
    files = fs.readdirSync(_path)
  } catch (ex) {
    console.error(ex)
    process.exit(0) // 避免CI挂掉
  }
  files.forEach(file => {
    let filePath = path.join(_path, file)
    if (fs.statSync(filePath).isDirectory()) {
      rmrf(filePath)
    } else {
      fs.unlinkSync(filePath)
    }
  })
  fs.rmdirSync(_path)
}

rmrf(DIST_PATH)
fs.mkdirSync(DIST_PATH)

console.log(`Clean Task finished.`)
