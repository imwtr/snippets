let fs = require('fs');
let path = require('path');

module.exports = (app) => {
    app.post('/changeFile', function (req, res) {
        let type = req.body.type,
            isDir = req.body.isDir,
            oldName = path.join('../apis/', req.body.oldName),
            newName = path.join('../apis/', req.body.newName);

        if (type === 'rename') {
            fs.rename(oldName, newName, (err) => {
                if (err) {
                    res.json({
                        code: 201,
                        msg: '修改失败'
                    });
                } else {
                    res.json({
                        code: 200,
                        msg: '修改成功'
                    });
                }
            });
        }
        else if (type === 'remove') {
            if (isDir) {
                let deleteFolderRecursive = function(path) {
                    if( fs.existsSync(path) ) {
                        fs.readdirSync(path).forEach(function(file) {
                            let curPath = path + "/" + file;
                            if(fs.statSync(curPath).isDirectory()) { // recurse
                                deleteFolderRecursive(curPath);
                            } else { // delete file
                                fs.unlinkSync(curPath);
                            }
                        });

                        fs.rmdirSync(path);
                    }
                };

                deleteFolderRecursive(oldName);
                res.json({
                    code: 200,
                    msg: '删除成功'
                });

                return;
            }
            fs.unlink(oldName, (err) => {
                if (err) {
                    res.json({
                        code: 201,
                        msg: '删除失败'
                    });

                    console.log(err);
                } else {
                    res.json({
                        code: 200,
                        msg: '删除成功'
                    });
                }
            });
        }
        else {
            if (type === 'addFolder') {
                fs.mkdir(newName, (err) => {
                    if (err) {
                        res.json({
                            code: 201,
                            msg: '删除失败'
                        });

                        console.log(err);
                    } else {
                        res.json({
                            code: 200,
                            msg: '删除成功'
                        });
                    }
                });
            } else {
                fs.writeFile(newName, '', 'utf8', function(err) {
                    if (err) {
                        res.json({
                            code: 201,
                            msg: '添加失败'
                        });
                        console.log(err);
                        return;
                    }

                    res.json({
                        code: 200,
                        msg: '添加成功'
                    });
                });

            }
        }

    });
};
