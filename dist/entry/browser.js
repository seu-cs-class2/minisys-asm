"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assembler_1 = require("../assembler");
var lastModifiedInfo = "\u6700\u540E\u66F4\u65B0\u4E8E2020-10-07\uFF0C\u6682\u4E0D\u652F\u6301\u6570\u636E\u6BB5\u5BFC\u51FA\u3002";
// @ts-ignore
var editor = window.editor;
function $(selector) {
    return document.querySelector(selector);
}
function setStatus(to, trace) {
    var statusBackDOM = $('.status');
    var statusDOM = $('#asm-status');
    var traceDOM = $('#asm-failTrace');
    var successColor = '#cf9';
    var failColor = '#f99';
    if (to === 'success') {
        statusBackDOM.style.background = successColor;
        statusDOM.innerText = '成功';
        traceDOM.innerText = '';
    }
    else if (to === 'fail') {
        statusBackDOM.style.background = failColor;
        statusDOM.innerText = '失败';
        traceDOM.innerText = trace || '';
    }
}
function assembleBrowser() {
    var resultDOM = $('#asm-result');
    var asmCode = editor.getValue();
    try {
        var result = assembler_1.assemble(asmCode);
        console.log(result);
        var binary = result.textSeg.toBinary();
        resultDOM.value = binary;
        setStatus('success');
    }
    catch (ex) {
        setStatus('fail', ex);
        resultDOM.value = '';
    }
}
window.addEventListener('load', function () {
    $('#asm-assemble').onclick = assembleBrowser;
    $('#asm-download').onclick = function () {
        alert('该功能暂未支持。');
    };
    $('#asm-lastModified').innerHTML = lastModifiedInfo;
});
