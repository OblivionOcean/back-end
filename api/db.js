var {Client} = require('pg');
const crypto = require("crypto");
client = new Client({
    host: process.env.host, user: process.env.user, password: process.env.password, port: parseInt(process.env.post)
});
client.connect();

module.exports = {
    client: client, add: function (tab_name, json) {
        keys = ''
        vals = ''
        for (i in json) {
            if (keys === '') {
                keys += i
            } else {
                keys += ', ' + i
            }
            val = (typeof json[i] === 'string') ? "'" + json[i] + "'" : json[i].toString()
            if (vals === '') {
                vals += val
            } else {
                vals += ', ' + val
            }
        }
        return new Promise(function (resolve, reject) {
            client.query(`INSERT INTO ${tab_name} (${keys})
                          VALUES (${vals})`).then(function (sql) {
                resolve(sql);
            }).catch(function (err) {
                reject(err);
            })
        })
    }, del: function (tab_name, query = undefined) {
        return new Promise(function (resolve, reject) {
            client.query(`DELETE
                          FROM ${tab_name} ${(query != undefined) ? ' WHERE ' + query : ''}`).then(function (sql) {
                resolve(sql);
            }).catch(function (err) {
                reject(err);
            })
        })
    }, find: function (tab_name, select_name = '*', query = undefined) {
        return new Promise(function (resolve, reject) {
            client.query(`SELECT ${select_name}
                          FROM ${tab_name} ${(query != undefined) ? ' WHERE ' + query : ''}`).then(function (sql) {
                resolve(sql);
            }).catch(function (err) {
                reject(err);
            })
        })
    }, update: function (tab_name, json, query = undefined) {
        set = ''
        for (i in json) {
            val = (typeof json[i] === 'string') ? "'" + json[i] + "'" : json[i].toString()
            if (set === '') {
                set += i + ' = ' + val
            } else {
                set += ', ' + i + ' = ' + val
            }
        }
        return new Promise(function (resolve, reject) {
            client.query(`UPDATE ${tab_name}
                          SET ${set}${(query != undefined) ? ' WHERE ' + query : ''}`).then(function (sql) {
                resolve(sql);
            }).catch(function (err) {
                reject(err);
            })
        })
    }, count: function (tab_name, select_name = '*', query = undefined) {
        return new Promise(function (resolve, reject) {
            client.query(`SELECT COUNT(${select_name})
                          FROM ${tab_name}${(query != undefined) ? ' WHERE ' + query : ''}`).then(function (sql) {
                resolve(sql);
            }).catch(function (err) {
                reject(err);
            })
        })
    }
}
