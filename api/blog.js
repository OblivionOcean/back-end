const AV = require('leancloud-storage');
const User = require('./user.js');
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

function getList(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    const query = new AV.Query('post');
    if (req.body.fields.tags&&req.body.fields.tags !== 'ALL') {
        query.equalTo('tags', req.body.fields.tags);
    }
    if (req.body.fields.categories&&req.body.fields.categories !== 'ALL') {
        query.equalTo('categories', req.body.fields.categories);
    }
    if (req.body.fields.title&&req.body.fields.title !== 'ALLPosts') {
        query.contains('title', req.body.fields.title);
    }
    query.find().then((user) => {
        if (user.length > 0) {
            let data = [];
            for (let i = 0; i < user.length; i++) {
                data.push({
                    title: user[i].get('title'),
                    category: user[i].get('category'),
                    text: user[i].get('text'),
                    tags: user[i].get('tags'),
                    uid: user[i].get('uid'),
                    pid: user[i].get('pid'),
                    look: user[i].get('look'),
                    avatar: user[0].get('avatar')
                });
            }
            res.end(JSON.stringify({status: true, msg: `共找到${user.length}条`, code: 200, data: data}));
        } else {
            res.end(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 404}));
        }
    });
}

function setPost(req, res) {
    User.fauth(req).then(function (response) {
        if (response.data.isjoin) {
            pid = req.body.fields.pid;
            // 声明 class
            const query = new AV.Query('post');
            if (!pid) {
                var POST = AV.Object.extend('post');
                var postobj = new POST();
                let date = new Date();
                pid = date.getTime();
                postobj.set('title', req.body.fields.title);
                postobj.set('text', req.body.fields.text);
                postobj.set('tags', req.body.fields.tags?req.body.fields.tags:['']);
                postobj.set('uid', response.data.uid);
                postobj.set('category', req.body.fields.category?req.body.fields.category:['']);
                postobj.set('pid', pid);
                postobj.set('look', 0);
                postobj.set('avatar', response.data.avatar);
                postobj.save().then(() => {
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: true, code: 200, msg: '保存成功', pid: pid}));
                }, (error) => {
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: false, code: 400, msg: '保存失败', pid: pid, error: error}));
                });
            } else {
                query.find().then((user) => {
                    if (user.length > 0) {
                        var postobj = AV.Object.createWithoutData('post', user[0]);
                        postobj.set('title', title);
                        postobj.set('text', text);
                        postobj.set('tags', tags);
                        postobj.set('uid', response.data.uid);
                        postobj.set('category', category);
                        postobj.set('pid', pid);
                        postobj.set('look', 0);
                        postobj.set('avatar', response.data.avatar);
                        postobj.save().then(() => {
                            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                            res.end(JSON.stringify({status: true, code: 200, msg: '保存成功', pid: pid}));
                        }, (error) => {
                            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                            res.end(JSON.stringify({status: false, code: 400, msg: '保存失败', pid: pid, error: error}));
                        });
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                        res.end(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 500}));
                    }
                });
            }
        } else {
            res.writeHead(403, {'Content-Type': 'application/json;charset=utf-8'});
            res.end({status: false, msg: '无权限！', code: 403});
        }
    }).catch(function (err) {
        res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify(err));
        console.log(err)
    })
}

function Post(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    pid = parseInt(req.body.fields.pid?req.body.fields.pid:0)
    const query = new AV.Query('post');
    query.equalTo('pid', pid);
    query.find().then((user) => {
        if (user.length > 0) {
            res.end(JSON.stringify({
                status: true, code: 200, data: {
                    title: user[0].get('title'),
                    category: user[0].get('category'),
                    text: user[0].get('text'),
                    tags: user[0].get('tags'),
                    uid: user[0].get('uid'),
                    pid: user[0].get('pid'),
                    look: user[0].get('look'),
                    avatar: user[0].get('avatar')
                }
            }));
            const Pl = AV.Object.createWithoutData('post', user[0].id);
            Pl.set('look', user[0].get('look')+1);
            Pl.save();
        } else {
            res.end(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 404}));
        }
    });
}

module.exports = {
    getList: getList, setPost: setPost, getPost: Post,
};
