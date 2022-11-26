const AV = require('leancloud-storage');
const crypto = require('crypto');
//环境变量
if (process.env.serverURL) {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey, serverURL: process.env.serverURL
    });
} else {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey
    });
}

function auth(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    if (req.cookie.key) {
        const query = new AV.Query('UserList');
        query.equalTo('key', req.cookie.key);
        query.find().then((user) => {
            if (user.length > 0) {
                res.end(JSON.stringify({
                    status: true, msg: '用户已登录', code: 200, data: {
                        email: user[0].get('email'),
                        key: user[0].get('key'),
                        uid: user[0].get('id'),
                        coreUser: user[0].get('coreUser'),
                        name: user[0].get('name'),
                        avatar: user[0].get('avatar'),
                        admin: user[0].get('admin'),
                        isjoin: user[0].get('join'),
                        lv: user[0].get('lv')
                    }
                }));
            } else {
                res.end(JSON.stringify({status: false, msg: '用户凭证异常', code: 403}));
            }
        });
    } else {
        res.end(JSON.stringify({status: false, msg: '用户未登录', code: 403}))
    }
}

function fauth(req) {
    return new Promise((resolve, reject) => {
        if (req.cookie.key) {
            const query = new AV.Query('UserList');
            query.equalTo('key', req.cookie.key);
            query.find().then((user) => {
                if (user.length > 0) {
                    resolve({status: true, msg: '用户已登录', code: 200, data: {email: user[0].get('email'), key: user[0].get('key'), uid: user[0].get('id'), coreUser: user[0].get('coreUser'), name: user[0].get('name'), avatar: user[0].get('avatar'), admin: user[0].get('admin'), isjoin: user[0].get('join'), lv: user[0].get('lv')}});
                } else {
                    reject({status: false, msg: '用户凭证异常', code: 403});
                }
            });
        } else {
            reject({status: false, msg: '用户未登录', code: 403})
        }
    });
}

function Uqueru(req, res) {
    if (req.body.fields.uid) {
        uid = req.body.fields.uid;
        const query = new AV.Query('UserList');
        query.equalTo('id', parseInt(uid));
        query.find().then((user) => {
            if (user.length > 0) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({
                    status: true, msg: '用户找到了', code: 200, data: {
                        email: user[0].get('email'),
                        uid: user[0].get('id'),
                        coreUser: user[0].get('coreUser'),
                        name: user[0].get('name'),
                        avatar: user[0].get('avatar'),
                        admin: user[0].get('admin'),
                        join: user[0].get('join'),
                        lv: user[0].get('lv')
                    }
                }));
            } else {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({status: false, msg: '不存在', code: 403}));
            }
        });
    } else {
        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'});
        res.write('<title>500 Sever error</title><style>h1,p {text-align:center;}</style><h1>500 Sever error</h1><hr><p>玄云海</p>');
        res.end();
    }
}

function login(req, res) {
    const query = new AV.Query('UserList');
    if (req.body.fields.id && req.body.fields.password) {
        id = req.body.fields.id;
        password = req.body.fields.password;
        if (id.indexOf('@') > -1 && id.indexOf('.') > -1) {
            query.equalTo('email', id);
        } else {
            query.equalTo('id', id);
        }
        query.find().then((user) => {
            if (user.length > 0) {
                if (user[0].get('key') === crypto.createHash('sha512').update(user[0].get('id') + '|' + password).digest("hex")) {
                    res.cookie('key', user[0].get('key'), {path: '/', domain: '.oblivionocean.top', maxAge: 604800000});
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: true, msg: '登录成功', code: 200, key: user[0].get('key')}));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: false, msg: '密码错误', code: 1002}));
                }
            } else {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({status: false, msg: '用户不存在', code: 404}));
            }
        });
    } else {
        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'});
        res.end('<title>500 Sever error</title><style>h1,p {text-align:center;}</style><h1>500 Sever error</h1><hr><p>玄云海</p>');
    }
}

function logon(req, res) {
    if (req.body.fields.email && req.body.fields.password) {
        email = req.body.fields.email;
        password = req.body.fields.password;
        const query = new AV.Query('UserList');
        query.equalTo('email', email);
        query.find().then((user) => {
            if (user.length === 0) {
                query.find().then((user) => {
                    const query2 = new AV.Query('UserList');
                    query2.count().then((count) => {
                        let User = AV.Object.extend('UserList');
                        let uSer = new User();
                        uSer.set('email', email);
                        uSer.set('key', crypto.createHash('sha512').update(count + 1 + '|' + password).digest("hex"));
                        uSer.set('id', count + 1);
                        uSer.save().then((todo) => {
                            res.cookie('key', crypto.createHash('sha512').update(count + 1 + '|' + password).digest("hex"))
                            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                            res.end(JSON.stringify({
                                status: true,
                                msg: '注册成功，请前往邮箱验证',
                                code: 200,
                                key: crypto.createHash('sha512').update(count + 1 + '|' + password).digest("hex")
                            }));
                        }, (error) => {
                            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                            res.end(JSON.stringify({status: false, msg: '注册失败', code: 400}));
                        });
                    });
                });
            } else {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({status: false, msg: '用户已注册', code: 400}));
            }
        })
    } else {
        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'});
        res.end('<title>500 Sever error</title><style>h1,p {text-align:center;}</style><h1>500 Sever error</h1><hr><p>玄云海</p>');
    }
}

module.exports = {
    logon: logon, login: login, auth: auth, Uqueru: Uqueru, fauth:fauth
};
