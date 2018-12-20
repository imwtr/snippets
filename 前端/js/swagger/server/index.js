let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let fs = require('fs');
let app = express();
let readFileWithSync = require('./getApiTree');

app.use('/editor/', express.static('../views/editor/'));
app.use('/viewer/', express.static('../views/viewer/'));
app.use('/public/', express.static('../public/'));
app.use('/api/', express.static('../apis/'));

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../views/index.html'));
});

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

require('./getApiTree')(app);

require('./saveApi')(app);

require('./changeFile')(app);

let server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
