const Blog = require('./blog.js');
const User = require('./user.js');
const Project = require('./project.js');
const AV = require('leancloud-storage');
const ss = require('simplest-server')

if (process.env.serverURL) {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey, serverURL: process.env.serverURL
    });
} else {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey
    });
}

ss.http({
    '404': function (req, res) {
        res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'});
        res.write('<title>404 Not Found</title><style>h1,p {text-align:center;}</style><h1>404 Not Found</h1><hr><p>玄云海</p>');
        res.end();
    },
    'AllRun': function (req, res) {
        var pattern = new RegExp('/((https|http)?:\\/\\/)[^\\s]+oblivionocean.top/')
        res.setHeader("Access-Control-Allow-Credentials", "true");
        if (req.headers.origin && pattern.test(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
        } else {
            res.setHeader('Access-Control-Allow-Origin', 'https://www.oblivionocean.top')
        }
    },
    'OPTIONS': function (req, res) {
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader('Access-Control-Allow-Credentials', true);
        var pattern = new RegExp('/((https|http)?:\\/\\/)[^\\s]+oblivionocean.top/')
        if (req.headers.origin && pattern.test(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
        } else {
            res.setHeader('Access-Control-Allow-Origin', 'https://www.oblivionocean.top')
        }
        res.writeHead(200, {'Content-Type': 'text/plan;charset=utf-8'});
        res.end('')
        return false;
    },
    '/blog/getlist': Blog.getList,
    '/blog/set': Blog.setPost,
    '/blog/get': Blog.getPost,
    '/user/login': User.login,
    '/user/logon': User.logon,
    '/user/user': User.Uqueru,
    '/user/auth': User.auth,
    '/project/getlist': Project.getList,
    '/project/set': Project.setProject,
    '/project/get': Project.getProject
}).listen(80);
