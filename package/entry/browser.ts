/**
 * Minisys汇编器 - 浏览器端编译入口
 * by Withod, z0gSh1u @ 2020-10
 */

/// <reference path="../typing/ace.d.ts" />
/// <reference path="../typing/shims.d.ts" />

import { Ace } from '../typing/ace'
import { AsmProgram, assemble as _assemble } from '../assembler'
import { coeToTxt, dataSegToCoe, textSegToCoe } from '../convert'
import { binToHex, hexToBin } from '../utils'

import _MinisysBIOS from '../snippet/minisys-bios.asm'
import _MinisysIntEntry from '../snippet/minisys-interrupt-entry.asm'
import _MinisysIntHandler from '../snippet/minisys-interrupt-handler.asm'
import { linkAll } from '../linker'

const lastModifiedInfo = '' // 页面提示语

function $<T>(selector: string): T {
  return (<unknown>document.querySelector(selector)) as T
}
// @ts-ignore
const editor = window.editor as Ace.Editor
const statusBgDOM = $<HTMLDivElement>('.status')
const statusDOM = $<HTMLSpanElement>('#asm-status')
const traceDOM = $<HTMLParagraphElement>('#asm-failTrace')
const resultDOM = $<HTMLTextAreaElement>('#asm-result')

/**
 * 修改提示状态
 */
function setStatus(to: 'success' | 'fail', trace?: string) {
  const successColor = '#cf9'
  const failColor = '#f99'
  if (to === 'success') {
    statusBgDOM.style.background = successColor
    statusDOM.innerText = '成功'
    traceDOM.innerText = ''
  }
  if (to === 'fail') {
    statusBgDOM.style.background = failColor
    statusDOM.innerText = '失败'
    traceDOM.innerText = trace || ''
  }
}

/**
 * 转换汇编结果的进制
 * @param res 原汇编结果
 */
function assembleResultSwitch(res: string) {
  if ($<HTMLInputElement>('#hexSwitch').checked) {
    return res
      .split('\n')
      .map(binaryLine => binToHex(binaryLine, false))
      .join('\n')
  } else {
    return res
      .split('\n')
      .map(binaryLine => hexToBin(binaryLine))
      .join('\n')
  }
}

function assemble(asmCode: string, link: boolean): AsmProgram {
  if (!link) {
    return _assemble(asmCode)
  } else {
    const all = _assemble('.data\n.text\n' + linkAll(_MinisysBIOS, asmCode, _MinisysIntEntry, _MinisysIntHandler))
    const textSeg = all.textSeg
    const dataSeg = _assemble(asmCode).dataSeg
    return { textSeg, dataSeg }
  }
}

/**
 * 网页端触发汇编
 */
function assembleBrowser() {
  const asmCode = editor.getValue()
  const link = $<HTMLInputElement>('#linkSwitch').checked
  // @ts-ignore
  globalThis._minisys = {
    _userAppOffset: link ? 1280 : 0,
  }
  try {
    const result = assemble(asmCode, link)
    const binary = result.textSeg.toBinary()
    if ($<HTMLInputElement>('#hexSwitch').checked) {
      resultDOM.value = assembleResultSwitch(binary)
    } else {
      resultDOM.value = binary
    }
    setStatus('success')
  } catch (ex) {
    setStatus('fail', ex)
    console.error(ex)
    resultDOM.value = ''
  }
}

/**
 * 形成文件供下载
 */
function downloadFile(content: string, filename: string) {
  const linkDOM = document.createElement('a')
  linkDOM.download = filename
  linkDOM.style.display = 'none'
  // 字符内容转二进制大对象
  const blob = new Blob([content])
  linkDOM.href = URL.createObjectURL(blob)
  // 触发点击
  document.body.appendChild(linkDOM)
  linkDOM.click()
  // 移除
  document.body.removeChild(linkDOM)
}

window.addEventListener('load', () => {
  // 汇编结果进制切换处理逻辑
  $<HTMLInputElement>('#hexSwitch').onchange = () => {
    resultDOM.value = assembleResultSwitch(resultDOM.value)
  }
  // 按钮处理逻辑
  $<HTMLButtonElement>('#asm-assemble').onclick = assembleBrowser
  $<HTMLButtonElement>('#asm-download-coe').onclick = () => {
    const link = $<HTMLInputElement>('#linkSwitch').checked
    // @ts-ignore
    globalThis._minisys = {
      _userAppOffset: link ? 1280 : 0,
    }
    try {
      const result = assemble(editor.getValue(), link)
      downloadFile(dataSegToCoe(result.dataSeg), 'dmem32.coe')
      downloadFile(textSegToCoe(result.textSeg), 'prgmip32.coe')
      setStatus('success')
    } catch (ex) {
      setStatus('fail', ex)
      console.error(ex)
    }
  }
  $<HTMLButtonElement>('#asm-download-txt').onclick = () => {
    const link = $<HTMLInputElement>('#linkSwitch').checked
    // @ts-ignore
    globalThis._minisys = {
      _userAppOffset: link ? 1280 : 0,
    }
    try {
      const result = assemble(editor.getValue(), link)
      const dataCoe = dataSegToCoe(result.dataSeg)
      const textCoe = textSegToCoe(result.textSeg)
      downloadFile(coeToTxt(textCoe, dataCoe), 'serial.txt')
      setStatus('success')
    } catch (ex) {
      setStatus('fail', ex)
      console.error(ex)
    }
  }
  $<HTMLSpanElement>('#asm-lastModified').innerHTML = lastModifiedInfo
})
