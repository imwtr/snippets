const md5File = require('md5-file');
const path = require('path');
const fs = require('fs');
const color = require('colors');

// CSS文件目录
let cssBasePath = 'public/static/css/';
// CSS文件后缀
let cssExt = '.css';

// 需要遍历的CSS文件组
let cssFiles = ['common', 'config', 'import'];

// 对CSS文件目录进行遍历，如果存在未再此文件cssFiles中配置的文件，则提示
var files = fs.readdirSync(cssBasePath);

for (var i = 0; i < files.length; ++i) {
    if (cssFiles.indexOf(files[i].slice(0, files[i].indexOf('.') )) === -1) {
        console.log(('Warn: ' + files[i] + ' is not config in addFileHash.js').yellow);
        // return;
    }
}



cssFiles = cssFiles.map((item) => {
    return {
        file: item,
        path: item + cssExt
    };
});

// 页面TPL文件目录
let tplBasePath = '../views/';
// 页面TPL文件后缀
let tplExt = '.tpl';

// CSS文件所对应的TPL文件引用  以file字段做对应关联
let tplFiles = [{
    file: 'config',
    path: ['project/index.tpl'],
}, {
    file: 'import',
    path: ['import/index.tpl'],
}, {
    file: 'common',
    path: ['parent/parent.tpl'],
}];

// console.log(cssFiles)


cssFiles.forEach((cssItem) => {
    // 不存在的css文件直接跳过
    try {
        fs.readFileSync(path.join(cssBasePath, cssItem.path), 'utf-8');
    } catch (e) {
        // console.log(e);
        return;
    }

    // 跟进文件内容，为css文件添加md5值
    md5File(path.join(cssBasePath, cssItem.path), (err, hash) => {
        if (err) {
            throw err;
        }

        let tpl = tplFiles.filter((tplItem) => {
            return tplItem.file === cssItem.file
        });

        if (!tpl.length) {
            return;
        }

        // 对tpl文件中引用的css路径加上hash参数
        tpl[0].path.forEach((pathItem) => {
            let doc = '';

            try {
                // 读取
                doc = fs.readFileSync(path.join(tplBasePath, pathItem), 'utf-8');
                // 替换
                doc = doc.replace(new RegExp((cssItem.file + cssExt).replace('.', '\.') + '.*?(")'), cssItem.file + cssExt +'?h=' + hash.slice(0, 8) + '$1');
                // 写入
                fs.writeFileSync(path.join(tplBasePath, pathItem), doc);
                console.log((pathItem + ':').gray,' hash of', (cssItem.file + cssExt).cyan, 'is', hash.slice(0, 8).cyan);
            } catch (err) {
                console.log(err);
            }
        });

    });

});

