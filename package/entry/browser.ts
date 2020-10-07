/// <reference path="../typing/ace.d.ts" />
import { Ace } from '../typing/ace'
import { assemble } from '../assembler'

const lastModifiedInfo = `最后更新于2020-10-07，暂不支持数据段导出。`

// @ts-ignore
const editor = window.editor as Ace.Editor

function $<T>(selector: string): T {
  return (<unknown>document.querySelector(selector)) as T
}

function setStatus(to: 'success' | 'fail', trace?: string) {
  const statusBackDOM = $<HTMLDivElement>('.status')
  const statusDOM = $<HTMLSpanElement>('#asm-status')
  const traceDOM = $<HTMLParagraphElement>('#asm-failTrace')
  const successColor = '#cf9'
  const failColor = '#f99'
  if (to === 'success') {
    statusBackDOM.style.background = successColor
    statusDOM.innerText = '成功'
    traceDOM.innerText = ''
  } else if (to === 'fail') {
    statusBackDOM.style.background = failColor
    statusDOM.innerText = '失败'
    traceDOM.innerText = trace || ''
  }
}

function assembleBrowser() {
  const resultDOM = $<HTMLTextAreaElement>('#asm-result')
  const asmCode = editor.getValue()
  try {
    const result = assemble(asmCode)
    console.log(result)
    const binary = result.textSeg.toBinary()
    resultDOM.value = binary
    setStatus('success')
  } catch (ex) {
    setStatus('fail', ex)
    resultDOM.value = ''
  }
}

window.addEventListener('load', () => {
  $<HTMLButtonElement>('#asm-assemble').onclick = assembleBrowser
  $<HTMLButtonElement>('#asm-download').onclick = () => {
    alert('该功能暂未支持。')
  }
  $<HTMLSpanElement>('#asm-lastModified').innerHTML = lastModifiedInfo
})
