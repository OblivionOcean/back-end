const AV = require('leancloud-storage');
const User = require('./user.js');
//环境变量
if (!process.env.serverURL) {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey
    });
} else {
    AV.init({
        appId: process.env.appId, appKey: process.env.appKey, serverURL: process.env.serverURL
    });
}

function getList(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    if (res.getQueryVariable('tags', 'ALL').indexOf(',') == -1) {
        tags = res.getQueryVariable('tags', 'ALL');
    } else {
        tags = res.getQueryVariable('tags', 'ALL').split(',');
    }
    if (res.getQueryVariable('categories', 'ALL').indexOf(',') == -1) {
        categories = res.getQueryVariable('categories', 'ALL');
    } else {
        categories = res.getQueryVariable('categories', 'ALL').split(',');
    }
    const query = new AV.Query('post');
    if (tags !== 'ALL') {
        query.equalTo('tags', tags);
    }
    if (categories !== 'ALL') {
        query.equalTo('categories', categories);
    }
    if (res.getQueryVariable('tile', 'ALLPosts') !== 'ALLPosts') {
        query.contains('title', res.getQueryVariable('tile', 'ALLPosts'));
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
            pid = res.getQueryVariable('pid', undefined);
            title = res.getQueryVariable('title', '');
            text = res.getQueryVariable('text', '');
            if (res.getQueryVariable('tags', 'ALL') === 'ALL') {
                tags = [''];
            } else if (res.getQueryVariable('tags', 'ALL').indexOf(',') == -1) {
                tags = [res.getQueryVariable('tags', 'ALL')];
            } else {
                tags = res.getQueryVariable('tags', 'ALL').split(',');
            }
            if (res.getQueryVariable('categories', 'ALL') === 'ALL') {
                category = [];
            } else if (res.getQueryVariable('category', 'ALL').indexOf(',') == -1) {
                category = [res.getQueryVariable('category', 'ALL')];
            } else {
                category = res.getQueryVariable('category', 'ALL').split(',');
            }
            // 声明 class
            const query = new AV.Query('post');
            if (!pid) {
                var POST = AV.Object.extend('post');
                var postobj = new POST();
                let date = new Date();
                pid = date.getTime();
                postobj.set('title', title);
                postobj.set('text', text);
                postobj.set('tags', tags);
                postobj.set('uid', response.data.uid);
                postobj.set('category', category);
                postobj.set('pid', parseInt(pid));
                postobj.set('look', 0);
                postobj.set('avatar', response.data.avatar);
                postobj.save().then(() => {
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({state: true, code: 200, msg: '保存成功', pid: pid}));
                }, (error) => {
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({state: false, code: 400, msg: '保存失败', pid: pid, error: error}));
                });
            } else {
                query.equalTo('pid', parseInt(pid));
                query.find().then((user) => {
                    if (user.length > 0) {
                        var postobj = AV.Object.createWithoutData('post', user[0].id);
                        postobj.set('title', title);
                        postobj.set('text', text);
                        postobj.set('tags', tags);
                        postobj.set('category', category);
                        postobj.set('pid', parseInt(pid));
                        postobj.set('look', 0);
                        postobj.save().then(() => {
                            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                            res.end(JSON.stringify({state: true, code: 200, msg: '保存成功', pid: pid}));
                        }, (error) => {
                            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                            res.end(JSON.stringify({state: false, code: 400, msg: '保存失败', pid: pid, error: error}));
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
    pid = parseInt(res.getQueryVariable('pid', 0))
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
