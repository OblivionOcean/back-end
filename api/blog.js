const AV = require('leancloud-storage');
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

function getList(title, tags = 'ALL', categories = 'ALL') {
    const query = new AV.Query('post');
    return new Promise((resolve, reject) => {
        if (tags !== 'ALL') {
            query.equalTo('tags', tags);
        }
        if (categories !== 'ALL') {
            query.equalTo('categories', categories);
        }
        if (title !== 'ALLPosts') {
            query.contains('title', title);
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
                        pid: user[i].get('pid')
                    });
                }
                resolve(JSON.stringify({status: true, msg: `共找到${user.length}条`, code: 200, data: data}));
            } else {
                reject(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 404}));
            }
        });
    });
}

function setPost(title, text, tags, uid, category, pid='') {
    // 声明 class
    const query = new AV.Query('post');
    return new Promise((resolve, reject) => {
        if (!pid) {
            var POST = AV.Object.extend('post');
            var postobj = new POST();
            let date = new Date();
            pid = date.getTime();
            postobj.set('title', title);
            postobj.set('text', text);
            postobj.set('tags', tags);
            postobj.set('uid', uid);
            postobj.set('category', category);
            postobj.set('pid', pid);
            postobj.save().then(() => {
                resolve(JSON.stringify({state: true, code: 200, msg: '保存成功', pid: pid}));
            }, (error) => {
                resolve(JSON.stringify({state: false, code: 400, msg: '保存失败', pid: pid, error: error}));
            });
        } else {
            query.find().then((user) => {
                if (user.length > 0) {
                    var postobj = AV.Object.createWithoutData('post', user[0]);
                    postobj.set('title', title);
                    postobj.set('text', text);
                    postobj.set('tags', tags);
                    postobj.set('uid', uid);
                    postobj.set('category', category);
                    postobj.save().then(() => {
                        resolve(JSON.stringify({state: true, code: 200, msg: '保存成功', pid: pid}));
                    }, (error) => {
                        resolve(JSON.stringify({state: false, code: 400, msg: '保存失败', pid: pid, error: error}));
                    });
                } else {
                    reject(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 500}));
                }
            });
        }
    });
}

function Post(pid) {
    return new Promise((resolve, reject) => {
        const query = new AV.Query('post');
        query.equalTo('pid', pid);
        query.find().then((user) => {
            if (user.length > 0) {
                resolve(JSON.stringify({
                    status: true, code: 200, data: {
                        title: user[0].get('title'),
                        category: user[0].get('category'),
                        text: user[0].get('text'),
                        tags: user[0].get('tags'),
                        uid: user[0].get('uid'),
                        pid: user[0].get('pid')
                    }
                }));
            } else {
                reject(JSON.stringify({status: false, msg: '没有这样的文章哦！', code: 404}));
            }
        });
    });
}

module.exports = {
    getList: getList,
    setPost: setPost,
    Post: Post,
};