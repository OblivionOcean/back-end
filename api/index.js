const Blog = require('./blog.js');
const User = require('./user.js');
const http = require('http');
const url = require('url');

http.createServer(function (req, res) {
    if (req.headers.origin){
        originUrl=req.headers.origin.split('.')
        if(originUrl[originUrl.length-1]=='top'&&originUrl[originUrl.length-2]=='oblivionocean') {
            ACAO = req.headers.origin
        }
    } else {
        ACAO = '*'
    }
    function getQueryVariable(variable, err) {
        if (req.url.query) {
            var vars = req.url.query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
        }
        return (err);
    }

    function cookie2json() {
        req.cookie = {}
        if (req.headers.cookie && req.headers.cookie.indexOf('=') != -1) {
            if (req.headers.cookie.indexOf('; ') != -1) {
                var x = req.headers.cookie.split("; ");
            } else {
                var x = [req.headers.cookie];
            }
            for (let i = 0; i < x.length; i++) {
                req.cookie[x[i].split('=')[0]] = x[i].split('=')[1];
            }
        }
    }

    cookie2json()

    console.log(req.cookie);

    res.cookie = function (id, value, json = {path: '/', maxAge: null, expires: null, domain: null}) {
        if (json.maxAge) {
            json.maxAge = '; max-age=' + json.maxAge;
        } else {
            json.maxAge = '';
        }
        if (json.expires) {
            json.expires = '; expires=' + json.expires;
        } else {
            json.expires = '';
        }
        if (json.domain) {
            json.domain = '; domain=' + json.domain;
        } else {
            json.domain = '';
        }
        if (!json.path) {
            json.path = '/';
        }
        console.log(json.domain)
        this.setHeader('set-cookie', id + '=' + value + '; path=' + json.path + json.maxAge + json.expires + json.domain);
    }
    res.clearCookie = function (id, path = '/') {
        this.setHeader('set-cookie', id + '=; maxAge=0; path=' + path);
    }
    req.url = url.parse(req.url)
    if (req.url.pathname === '/post/getlist') {
        if (getQueryVariable('tags', 'ALL') === 'ALL') {
            tags = 'ALL';
        } else if (getQueryVariable('tags', 'ALL').indexOf(',') == -1) {
            tags = [getQueryVariable('tags', 'ALL')];
        } else {
            tags = getQueryVariable('tags', 'ALL').split(',');
        }
        if (getQueryVariable('categories', 'ALL') === 'ALL') {
            categories = 'ALL';
        } else if (getQueryVariable('categories', 'ALL').indexOf(',') == -1) {
            categories = [getQueryVariable('categories', 'ALL')];
        } else {
            categories = getQueryVariable('categories', 'ALL').split(',');
        }
        Blog.getList(getQueryVariable('title', 'ALLPosts'), tags, categories).then(function (data) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write(data);
            res.end();
        }).catch(function (err) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write(err);
            res.end();
        });
    } else if (req.url.pathname === '/post/set') {
        if (getQueryVariable('tags', 'ALL') === 'ALL') {
            tags = [''];
        } else if (getQueryVariable('tags', 'ALL').indexOf(',') == -1) {
            tags = [getQueryVariable('tags', 'ALL')];
        } else {
            tags = getQueryVariable('tags', 'ALL').split(',');
        }
        if (getQueryVariable('categories', 'ALL') === 'ALL') {
            categories = [];
        } else if (getQueryVariable('categories', 'ALL').indexOf(',') == -1) {
            categories = [getQueryVariable('categories', 'ALL')];
        } else {
            categories = getQueryVariable('categories', 'ALL').split(',');
        }
        User.auth(req).then(function (response) {
            Blog.setPost(getQueryVariable('title', ''), getQueryVariable('text', ''), tags, JSON.parse(response).data.uid, categories, getQueryVariable('pid', '')).then(function (data) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(data);
                res.end();
            }).catch(function (err) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(err);
                res.end();
            });
        }).catch(function (err) {
            console.log(err)
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            //res.write(err);
            res.end();
        })
    } else if (req.url.pathname === '/post/get') {
        Blog.Post(parseInt(getQueryVariable('pid', 0))).then(function (data) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write(data);
            res.end();
        }).catch(function (err) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write(err);
            res.end();
        });
    } else if (req.url.pathname === '/user/login') {
        if (getQueryVariable('id', null) && getQueryVariable('password', null)) {
            User.login(getQueryVariable('id', null), getQueryVariable('password', null)).then(function (user) {
                if (JSON.parse(user).key) {
                    res.cookie('key', JSON.parse(user).key, {path: '/',domain: '.oblivionocean.top', maxAge: 604800000});
                }
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(user);
                res.end();
            }).catch(function (err) {
                console.log(err);
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                //res.write(err);
                res.end();
            })
        } else {
            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write('<title>500 Sever error</title><style>h1,p {text-align:center;}</style><h1>500 Sever error</h1><hr><p>玄云海</p>');
            res.end();
        }

    } else if (req.url.pathname === '/user/logon') {
        if (getQueryVariable('email', null) && getQueryVariable('password', null)) {
            User.logon(getQueryVariable('email', null), getQueryVariable('password', null)).then(function (user) {
                if (JSON.parse(user).key) {
                    res.cookie('key', JSON.parse(user).key, {path: '/', domain: '.oblivionocean.top', maxAge: 604800000});
                }
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(user);
                res.end();
            }).catch(function (err) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(err);
                res.end();
            })
        } else {
            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write('<title>500 Sever error</title><style>h1,p {text-align:center;}</style><h1>500 Sever error</h1><hr><p>玄云海</p>');
            res.end();
        }

    } else if (req.url.pathname === '/user/logout') {
        res.clearCookie('key');
    } else if (req.url.pathname === '/user/user') {
        if (getQueryVariable('uid', null)) {
            User.Uqueru(getQueryVariable('uid', null)).then(function (user) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(user);
                res.end();
            }).catch(function (err) {
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
                res.write(err);
                res.end();
            })
        } else {
            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write('<title>500 Sever error</title><style>h1,p {text-align:center;}</style><h1>500 Sever error</h1><hr><p>玄云海</p>');
            res.end();
        }

    } else if (req.url.pathname === '/user/auth') {
        User.auth(req).then(function (user) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write(user);
            res.end();
        }).catch(function (err) {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
            res.write(err);
            res.end();
        })
    } else {
        // url参数获取
        res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8', "Access-Control-Allow-Origin": ACAO, 'Access-Control-Allow-Credentials': true});
        res.write('<title>404 Not Found</title><style>h1,p {text-align:center;}</style><h1>404 Not Found</h1><hr><p>玄云海</p>');
        res.end();
    }
}).listen(80);