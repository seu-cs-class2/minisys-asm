import { DataSeg, TextSeg } from './assembler'

export function dataSegToCoe(dataSeg: DataSeg, padTo = 64) {
  // TODO:
  return
}

export function textSegToCoe(textSeg: TextSeg, padTo = 64) {
  // TODO:
  return
}

/**
 * 将两个coe文件并为可用UART串口写入的ASCII流文件
 */
export function coeToTxt(programCoe: string, dataCoe: string) {
  const toStream = (coe: string) =>
    coe
      .replace(/\r\n/, '\n')
      .split('\n')
      .filter(v => v.trim())
      .slice(2)
      .map(x => x.replace(',', ''))
      .join('')
  const content = `03020000${toStream(programCoe)}${toStream(dataCoe)}`
  return content
}
