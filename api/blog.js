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
            tags = (typeof req.body.fields.tags=="string") ? req.body.fields.tags:req.body.fields.tags.join(',');
            category = (typeof req.body.fields.category=="string") ? req.body.fields.category:req.body.fields.category.join(',');
            pid = req.body.fields.pid;
            if (!pid) {
                pid = new Date().getTime()
                db.add('post', {
                    title: req.body.fields.title,
                    text: req.body.fields.text,
                    tags: tags,
                    user: req.body.fields.uid,
                    category: category,
                    pid: pid,
                    look: 0
                }).then(function(sql){
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify({status: true, code: 200, msg: '保存成功', pid: pid}));
                }).catch(function (error) {
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
    db.select('post','*', 'pid='+pid).then(function (sql) {
        if (sql.rows[0]) {
            res.end(JSON.stringify({
                status: true, code: 200, data: sql.rows[0]
            }));
            const Pl = AV.Object.createWithoutData('post', user[0].id);
            Pl.set('look', user[0].get('look')+1);
            Pl.save();
        } else {
            res.end(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 404}));
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
}

module.exports = {
    getList: getList, setPost: setPost, getPost: Post,
};
