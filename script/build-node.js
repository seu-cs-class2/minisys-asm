const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const cpdir = require('copy-dir')

// 建目录
fs.mkdirSync(path.join(__dirname, '../dist/snippet'))
cpdir.sync(path.join(__dirname, '../package/snippet'), path.join(__dirname, '../dist/snippet'))

// 编译
process.stdout.write('[Node] Start building. \n')
childProcess.execSync('tsc', { stdio: 'inherit' })

// 完成
process.stdout.write('[Node] Build complete. \n')
