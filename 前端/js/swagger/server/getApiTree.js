let fs = require('fs');
let path = require('path');

function readFileWithSync(dir) {
    if (!fs.statSync(path.join(__dirname, dir)).isDirectory()) {
        return [{
            name: dir
        }];
    }

    let trees = [],
        files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; ++i) {
        let tree = {},
            filename = files[i],
            fullname = path.join(dir, filename);

        // 隐藏的文件不获取
        if (/^\./.test(filename)) {
            continue;
        }

        tree['name'] = filename;

        if (fs.statSync(fullname).isDirectory()) {
            tree['children'] = readFileWithSync(fullname);
        }

        trees.push(tree);
    }

    return trees;
}

module.exports = (app) => {
    app.get('/getApiTree', function (req, res) {
        let trees = readFileWithSync('../apis');

        res.json([{
            name: '接口文档',
            children: trees
        }]);
    });
}
