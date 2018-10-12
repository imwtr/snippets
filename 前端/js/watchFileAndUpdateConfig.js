const fs = require('fs');
const  color = require('colors');


console.log('Watching files of ./public/static/');

let watchDir = './public/static';
// 监听文件改变  自动更改配置文件引用时间戳
fs.watch(watchDir, {
    recursive: true
}, function(eventType, fileName) {
    // 监听到配置文件更改不处理
    if (fileName === 'js/config.js' || fileName === 'js\\config.js') {
        return;
    }

    let configFilePath = './public/static/js/config.js';
    let doc = '';
    let d = '';

    try {
        // 读取
        doc = fs.readFileSync(configFilePath, 'utf-8');
        d = +new Date();
        // 替换
        doc = doc.replace(/(dh=).*?('|")/, '$1' + d + '$2');
        // 写入
        fs.writeFileSync(configFilePath, doc);
        console.log('UrlArgs of ' + configFilePath.gray + ' changed to ' + ('' + d).cyan);
    } catch (err) {
        console.log(err);
    }
})
