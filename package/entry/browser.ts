/// <reference path="../typing/ace.d.ts" />
import { Ace } from '../typing/ace'
import { assemble } from '../assembler'
import { dataSegToCoe } from '../convert'

const lastModifiedInfo = ``

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
    const binary = result.textSeg.toBinary()
    resultDOM.value = binary
    setStatus('success')
  } catch (ex) {
    setStatus('fail', ex)
    console.log(ex)
    resultDOM.value = ''
  }
}

function downloadFile(content: string, filename: string) {
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  // 字符内容转变成blob地址
  var blob = new Blob([content]);
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
};

window.addEventListener('load', () => {
  $<HTMLButtonElement>('#asm-assemble').onclick = assembleBrowser
  $<HTMLButtonElement>('#asm-download-coe').onclick = () => {
    try {
      const result = assemble(editor.getValue())
      downloadFile(dataSegToCoe(result.dataSeg), 'dmem32.coe')
    } catch (ex) {
      setStatus('fail', ex)
      console.log(ex)
    }
  }
  $<HTMLButtonElement>('#asm-download-txt').onclick = () => {
    alert('该功能暂未支持。')
  }
  $<HTMLSpanElement>('#asm-lastModified').innerHTML = lastModifiedInfo
})
