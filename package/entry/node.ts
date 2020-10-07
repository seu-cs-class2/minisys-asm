import fs from 'fs'
import { assemble } from '../assembler'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require('minimist')(process.argv.slice(2))
// args looks like { _: [ 'example/md.l' ], v: true }

function stdoutPrint(content: string): void {
  process.stdout.write(content)
}

if (args._.length === 0 || args._.length !== 2) {
  stdoutPrint(`Usage: node <some_path>/node.js [in_file] [out_dir]\n`)
} else {
  const asmCode = fs.readFileSync(args._[0]).toString('utf-8')
  fs.writeFileSync(args._[1], assemble(asmCode).textSeg.toBinary())
}
