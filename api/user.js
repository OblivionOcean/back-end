const crypto = require('crypto');
const db = require('./db')

//环境变量

function fauth(req) {
    return new Promise((resolve, reject) => {
        if (req.cookie.key) {
            db.find('userls', '*', "key='" + req.cookie.key + "'").then(function (sql) {
                if (sql.rows[0]) {
                    resolve({
                        status: true, msg: '用户已登录', code: 200, data: sql.rows[0]
                    });
                } else {
                    reject({status: false, msg: '用户凭证异常', code: 200});
                }
            }).catch(function (err) {
                console.log(err)
                reject({
                    status: false,
                    msg: '查询失败,数据库错误!',
                    code: 500,
                    err: (typeof err == 'string') ? err.toString() : err
                });
            });
        } else {
            reject({status: false, msg: '用户未登录', code: 200})
        }

    });
}

function auth(req, res) {
    fauth(req).then(function (data) {
        res.writeHead(data['code'], {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify(data));
    }).catch(function (err) {
        res.writeHead(err['code'], {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify(err));
    })
}

function Uqueru(req, res) {
    if (req.body.fields.id) {
        uid = req.body.fields.id;
        db.find('userls', '*', "uid=" + uid).then(function (sql) {
            if (sql.rows[0]) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                sql.rows[0].key = undefined;
                res.end(JSON.stringify({
                    status: true, msg: '用户找到了', code: 200, data: sql.rows[0]
                }));
            } else {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({status: false, msg: '不存在', code: 403}));
            }
        }).catch(function (err) {
            res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
            res.end(JSON.stringify({
                status: false,
                msg: '查询失败,数据库错误！',
                code: 500,
                err: (typeof err == 'string') ? err.toString() : err
            }))
        });
    } else {
        res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify({status: false, msg: '参数错误!', code: 500}));
    }
}

function login(req, res) {
    if (req.body.fields.id && req.body.fields.password) {
        id = req.body.fields.id;
        password = req.body.fields.password;
        db.find('userls', '*', (/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(id)) ? "email='" + id.toLowerCase() + "'" : 'uid=' + id).then(function (sql) {
            if (sql.rows[0]) {
                if (sql.rows[0]['key'] === crypto.createHash('sha512').update(sql.rows[0]['uid'].toString() + '|' + password).digest("hex")) {
                    res.cookie('key', sql.rows[0]['key'], {path: '/', domain: '.oblivionocean.top', maxAge: 604800000});
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: true, msg: '登录成功', code: 200, key: sql.rows[0]['key']}));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: false, msg: '密码错误', code: 1002}));
                }
            } else {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({status: false, msg: '用户不存在', code: 404}));
            }
        }).catch(function (err) {
            res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
            console.log(err)
            res.end(JSON.stringify({status: false, msg: '查询失败,数据库错误！', code: 500, err: err}));
        });
    } else {
        res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify({status: false, msg: '参数错误!', code: 500}));
    }
}

function logon(req, res) {
    if (req.body.fields.email && req.body.fields.password) {
        if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(req.body.fields.email)) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
            res.end({status: false, msg: '邮箱不正确！', code: 200});
            return;
        }
        email = req.body.fields.email.toLowerCase();
        password = req.body.fields.password;
        db.find('userls', '*', `email='${email}'`).then(function (sql) {
            if (!sql.rows[0]) {
                db.count('userls').then(function (count) {
                    num = parseInt(count.rows[0].count) + 1
                    db.add('userls', {
                        uid: num,
                        email: email,
                        key: crypto.createHash('sha512').update(num.toString() + '|' + password).digest("hex")
                    }).then(function (sql) {
                        res.cookie('key', crypto.createHash('sha512').update(num.toString() + '|' + password).digest("hex"))
                        res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                        res.end(JSON.stringify({
                            status: true,
                            msg: '注册成功，请前往邮箱验证',
                            code: 200,
                            key: crypto.createHash('sha512').update(num.toString() + '|' + password).digest("hex")
                        }));
                    }).catch(function (err) {
                        res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
                        res.end(JSON.stringify({status: false, msg: '查询失败,数据库错误！', code: 500, err: err}))
                    });
                }).catch(function (err) {
                    res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: false, msg: '查询失败,数据库错误！', code: 500, err: err}))
                });
            } else {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({status: false, msg: '用户已注册', code: 400}));
            }
        }).catch(function (err) {
            res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
            res.end(JSON.stringify({status: false, msg: '查询失败,数据库错误！', code: 500, err: err}))
        });
    } else {
        res.writeHead(500, {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify({status: false, msg: '参数错误!', code: 500}));
    }
}

module.exports = {
    logon: logon, login: login, auth: auth, Uqueru: Uqueru, fauth: fauth
};
