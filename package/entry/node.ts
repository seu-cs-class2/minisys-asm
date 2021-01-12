/**
 * Minisys汇编器 - Node CLI 端编译入口
 * by Withod, z0gSh1u @ 2020-10
 */

import fs from 'fs'
import path from 'path'
import { assemble } from '../assembler'
import { coeToTxt, dataSegToCoe, textSegToCoe } from '../convert'
import { linkAll } from '../linker'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require('minimist')(process.argv.slice(2))
// args looks like { _: [ 'example/md.l' ], v: true }

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
    _userAppOffset: link ? 1280 : 0,
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
    const all = assemble('.data\n.text\n' + linkAll(biosContent, userAppASM, intEntryContent, intHandlerContent))
    const textCoe = textSegToCoe(all.textSeg)
    fs.writeFileSync(path.join(outDir, 'prgmip32.coe'), textCoe)
    // 处理数据段
    const asmResult = assemble(userAppASM)
    const dataCoe = dataSegToCoe(asmResult.dataSeg)
    fs.writeFileSync(path.join(outDir, 'dmem32.coe'), dataCoe)
    fs.writeFileSync(path.join(outDir, 'serial.txt'), coeToTxt(textCoe, dataCoe))
    stdoutPrint('[minisys-asm] Assembling done with linking.')
  }
}
