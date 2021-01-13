/**
 * Minisys汇编器 - Node CLI 端编译入口
 * by Withod, z0gSh1u @ 2020-10
 */

import fs from 'fs'
import path from 'path'
import { assemble } from '../assembler'
import { coeToTxt, dataSegToCoe, textSegToCoe } from '../convert'
import { linkAll } from '../linker'
import { assert } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require('minimist')(process.argv.slice(2))
// args looks like { _: [ 'example/md.l' ], v: true }
const jOffset = 1280

function stdoutPrint(content: string) {
  process.stdout.write(content)
}

if (args._.length === 0 || args._.length !== 2) {
  stdoutPrint('Usage: node <some_path>/node.js <in_file> <out_dir> [-l]\n')
} else {
  const inFile = args._[0]
  const outDir = args._[1]
  const link = !!args.l
  // @ts-ignore
  globalThis._minisys = {
    _userAppOffset: link ? jOffset : 0,
  }
  if (!link) {
    const asmCode = fs.readFileSync(inFile).toString('utf-8').replace(/\r\n/g, '\n').trim()
    const asmResult = assemble(asmCode)
    const dataCoe = dataSegToCoe(asmResult.dataSeg)
    const textCoe = textSegToCoe(asmResult.textSeg)
    fs.writeFileSync(path.join(outDir, 'dmem32.coe'), dataCoe)
    fs.writeFileSync(path.join(outDir, 'prgmip32.coe'), textCoe)
    fs.writeFileSync(path.join(outDir, 'serial.txt'), coeToTxt(textCoe, dataCoe))
    stdoutPrint('[minisys-asm] Assembling done.')
  } else {
    // 进行链接
    const biosContent = fs.readFileSync(path.join(__dirname, '../snippet/minisys-bios.asm')).toString()
    const userAppASM = fs.readFileSync(inFile).toString('utf-8').replace(/\r\n/g, '\n').trim()
    const intEntryContent = fs.readFileSync(path.join(__dirname, '../snippet/minisys-interrupt-entry.asm')).toString()
    const intHandlerContent = fs
      .readFileSync(path.join(__dirname, '../snippet/minisys-interrupt-handler.asm'))
      .toString()
    // 把链接后的代码段进行汇编
    let asm = (userAppASM + '\n')
      .replace(/\r\n/g, '\n')
      .replace(/#(.*)\n/g, '\n')
      .split('\n')
    // 挑出代码段和数据段
    const dataSegStartLine = asm.findIndex(v => v.match(/\.data/))
    const textSegStartLine = asm.findIndex(v => v.match(/\.text/))
    assert(dataSegStartLine !== -1, '未找到数据段开始')
    assert(textSegStartLine !== -1, '未找到代码段开始')
    assert(dataSegStartLine < textSegStartLine, '数据段不能位于代码段之后')
    // 链接完成后汇编
    const allProgram =
      asm.slice(dataSegStartLine, textSegStartLine).join('\n') +
      '\n' +
      '.text\n' +
      linkAll(biosContent, asm.slice(textSegStartLine + 1).join('\n'), intEntryContent, intHandlerContent)
    const all = assemble(allProgram)
    const textCoe = textSegToCoe(all.textSeg)
    const dataCoe = dataSegToCoe(all.dataSeg)
    // 输出
    fs.writeFileSync(path.join(outDir, 'prgmip32.coe'), textCoe)
    fs.writeFileSync(path.join(outDir, 'dmem32.coe'), dataCoe)
    fs.writeFileSync(path.join(outDir, 'serial.txt'), coeToTxt(textCoe, dataCoe))
    fs.writeFileSync(path.join(outDir, 'linked.asm'), allProgram)
    stdoutPrint(`[minisys-asm] Assembling done with linking. jOffset = ${jOffset} B.`)
  }
}
