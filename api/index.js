const Blog = require('./blog.js');
const User = require('./user.js');
const http = require('http');
const url = require('url');
const AV = require("leancloud-storage");

if (process.env.serverURL) {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey
    });
} else {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey, serverURL: process.env.serverURL
    });
}

http.createServer(function (req, res)   {
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
        this.setHeader('set-cookie', id + '=' + value + '; path=' + json.path + json.maxAge + json.expires + json.domain);
    }
    res.clearCookie = function (id, path = '/') {
        this.setHeader('set-cookie', id + '=; maxAge=0; path=' + path);
    }
    req.url = url.parse(req.url)
    res.getQueryVariable = function (variable, err) {
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

    path = {
        '/blog/getlist': Blog.getList,
        '/blog/set': Blog.setPost,
        '/blog/get': Blog.getPost,
        '/user/login': User.login,
        '/user/logon': User.logon,
        '/user/user': User.Uqueru,
        '/user/auth': User.auth
    };
    console.log(req.url.pathname[req.url.pathname.length - 1], path[req.url.pathname.substring(0, req.url.pathname.length - 1)], path)
    if (req.url.pathname[req.url.pathname.length - 1] == '/') {
        if (req.headers.origin) {
            originUrl = req.headers.origin.split('.')
            res.setHeader('Access-Control-Allow-Credentials', true);
            if (originUrl[originUrl.length-1]==='top'&& originUrl[originUrl.length-2]==='oblivionocean') {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
            } else {
                res.setHeader('Access-Control-Allow-Origin', 'https://www.oblivionocean.top')
            }
            console.log(originUrl,originUrl[originUrl.length-1]==='top'&& originUrl[originUrl.length-2]==='oblivionocean')
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*')
        }
        if (!path[req.url.pathname.substring(0, req.url.pathname.length - 2)]) {
            res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'});
            res.write('<title>404 Not Found</title><style>h1,p {text-align:center;}</style><h1>404 Not Found</h1><hr><p>玄云海</p>');
            res.end();
        } else {
            path[req.url.pathname.substring(0, req.url.pathname.length - 2)](req, res)
        }
    } else {
        if (req.headers.origin) {
            originUrl = req.headers.origin.split('.')
            res.setHeader('Access-Control-Allow-Credentials', true);
            if (originUrl[originUrl.length-1]==='top'&& originUrl[originUrl.length-2]==='oblivionocean') {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
            } else {
                res.setHeader('Access-Control-Allow-Origin', 'https://www.oblivionocean.top')
            }
            console.log(originUrl,originUrl[originUrl.length-1]==='top'&& originUrl[originUrl.length-2]==='oblivionocean')
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*')
        }
        if (!path[req.url.pathname]) {
            res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'});
            res.write('<title>404 Not Found</title><style>h1,p {text-align:center;}</style><h1>404 Not Found</h1><hr><p>玄云海</p>');
            res.end();
        } else {
            path[req.url.pathname](req, res)
        }
    }
}).listen(80);