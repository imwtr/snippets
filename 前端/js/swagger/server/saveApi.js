let fs = require('fs');
let path = require('path');

function createFolder(to) {
    let sep = path.sep;
    let folders = path.dirname(to).split(sep);
    let p = '';

    while (folders.length) {
        p += folders.shift() + sep;

        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
}

module.exports = (app) => {
    app.post('/saveApi', function (req, res) {
        let filePath = req.body.path;
        let fileData = req.body.data;

        filePath = path.join('../apis/', filePath);
        // fileData = JSON.stringify(fileData);

        createFolder(filePath);

        fs.writeFile(filePath, fileData, 'utf8', function(err) {
            if (err) {
                console.log(err);
                res.json({
                    code: 201,
                    msg: '保存失败'
                });

                return;
            }

            console.log('保存成功');

            res.json({
                code: 200,
                msg: '保存成功'
            });
        });
    });
};
