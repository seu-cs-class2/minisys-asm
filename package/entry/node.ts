/**
 * Minisys汇编器 - Node CLI 端编译入口
 * by Withod, z0gSh1u @ 2020-10
 */

import fs from 'fs'
import path from 'path'
import { assemble } from '../assembler'
import { coeToTxt, dataSegToCoe, textSegToCoe } from '../convert'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require('minimist')(process.argv.slice(2))
// args looks like { _: [ 'example/md.l' ], v: true }

function stdoutPrint(content: string) {
  process.stdout.write(content)
}

if (args._.length === 0 || args._.length !== 2) {
  stdoutPrint('Usage: node <some_path>/node.js <in_file> <out_dir>\n')
} else {
  const inFile = args._[0]
  const outDir = args._[1]
  const asmCode = fs.readFileSync(inFile).toString('utf-8').replace(/\r\n/g, '\n').trim()
  const asmResult = assemble(asmCode)
  const dataCoe = dataSegToCoe(asmResult.dataSeg)
  const textCoe = textSegToCoe(asmResult.textSeg)
  fs.writeFileSync(path.join(outDir, 'dmem32.coe'), dataCoe)
  fs.writeFileSync(path.join(outDir, 'prgmip32.coe'), textCoe)
  fs.writeFileSync(path.join(outDir, 'serial.txt'), coeToTxt(textCoe, dataCoe))
  stdoutPrint('[minisys-asm] Assembling done.')
}
