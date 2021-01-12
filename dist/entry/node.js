"use strict";
/**
 * Minisys汇编器 - Node CLI 端编译入口
 * by Withod, z0gSh1u @ 2020-10
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var assembler_1 = require("../assembler");
var convert_1 = require("../convert");
var linker_1 = require("../linker");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var args = require('minimist')(process.argv.slice(2));
// args looks like { _: [ 'example/md.l' ], v: true }
function stdoutPrint(content) {
    process.stdout.write(content);
}
if (args._.length === 0 || args._.length !== 2) {
    stdoutPrint('Usage: node <some_path>/node.js <in_file> <out_dir> [-l]\n');
}
else {
    var inFile = args._[0];
    var outDir = args._[1];
    var link = !!args.l;
    if (!link) {
        var asmCode = fs_1.default.readFileSync(inFile).toString('utf-8').replace(/\r\n/g, '\n').trim();
        var asmResult = assembler_1.assemble(asmCode);
        var dataCoe = convert_1.dataSegToCoe(asmResult.dataSeg);
        var textCoe = convert_1.textSegToCoe(asmResult.textSeg);
        fs_1.default.writeFileSync(path_1.default.join(outDir, 'dmem32.coe'), dataCoe);
        fs_1.default.writeFileSync(path_1.default.join(outDir, 'prgmip32.coe'), textCoe);
        fs_1.default.writeFileSync(path_1.default.join(outDir, 'serial.txt'), convert_1.coeToTxt(textCoe, dataCoe));
        stdoutPrint('[minisys-asm] Assembling done.');
    }
    else {
        // 进行链接
        var biosContent = fs_1.default.readFileSync(path_1.default.join(__dirname, '../snippet/minisys-bios.asm')).toString();
        var userAppASM = fs_1.default.readFileSync(inFile).toString('utf-8').replace(/\r\n/g, '\n').trim();
        var intEntryContent = fs_1.default.readFileSync(path_1.default.join(__dirname, '../snippet/minisys-interrupt-entry.asm')).toString();
        var intHandlerContent = fs_1.default
            .readFileSync(path_1.default.join(__dirname, '../snippet/minisys-interrupt-handler.asm'))
            .toString();
        // 把链接后的代码段进行汇编
        var all = assembler_1.assemble('.data\n.text\n' + linker_1.linkAll(biosContent, userAppASM, intEntryContent, intHandlerContent));
        var textCoe = convert_1.textSegToCoe(all.textSeg);
        fs_1.default.writeFileSync(path_1.default.join(outDir, 'prgmip32.coe'), textCoe);
        // 处理数据段
        var asmResult = assembler_1.assemble(userAppASM);
        var dataCoe = convert_1.dataSegToCoe(asmResult.dataSeg);
        fs_1.default.writeFileSync(path_1.default.join(outDir, 'dmem32.coe'), dataCoe);
        fs_1.default.writeFileSync(path_1.default.join(outDir, 'serial.txt'), convert_1.coeToTxt(textCoe, dataCoe));
        stdoutPrint('[minisys-asm] Assembling done with linking.');
    }
}
