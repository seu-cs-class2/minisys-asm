"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var assembler_1 = require("../assembler");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var args = require('minimist')(process.argv.slice(2));
// args looks like { _: [ 'example/md.l' ], v: true }
function stdoutPrint(content) {
    process.stdout.write(content);
}
if (args._.length === 0 || args._.length !== 2) {
    stdoutPrint("Usage: node <some_path>/node.js [in_file] [out_dir]\n");
}
else {
    var asmCode = fs_1.default.readFileSync(args._[0]).toString('utf-8');
    fs_1.default.writeFileSync(args._[1], assembler_1.assemble(asmCode).textSeg.toBinary());
}
