const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let connection;

const open = async () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(path.resolve(__dirname, './db/kolding-horing-scraper.sqlite'), (err) => {
            if (err) {
                reject(err);
            } else {
                connection = db;
                resolve(db);
            }
        });
    });
}

const createHearingTable = () => {
    return new Promise((resolve, reject) => {
        connection.run(
            `CREATE TABLE IF NOT EXISTS hearings (
                Id integer primary key, 
                Title text, 
                Content text,
                Url text,
                Location text,
                Category text,
                CreatedAt text )`, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const createRunsTable = () => {
    return new Promise((resolve, reject) => {
        connection.run(
            `CREATE TABLE IF NOT EXISTS runs (
                Id integer primary key, 
                CreatedAt text )`, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


const init = async () => {
    await createHearingTable();
    await createRunsTable();
}

const alreadySeen = async (title) => {
    return new Promise((resolve, reject) => {
        connection.get(`SELECT 
                    Id 
                 FROM hearings
                 WHERE title = ?`, [title], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? true : false);
            }
        });
    });
}

const logRun = async () => {
    const createdAt = (new Date()).toISOString();

    return new Promise((resolve, reject) => {
        connection.run(`INSERT INTO runs (CreatedAt)
                        VALUES (?)`,
            [createdAt], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
    });
}
const insert = async (title, content, url, location, category) => {
    const createdAt = (new Date()).toISOString();

    const exists = await alreadySeen(title);
    if (exists) {
        return false;
    }

    return new Promise((resolve, reject) => {
        connection.run(`INSERT INTO hearings (Title, Content, Url, Location, Category, CreatedAt)
                        VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title,
                content,
                url,
                location,
                category,
                createdAt
            ], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
    });
}

exports.open = open;
exports.init = init;
exports.insert = insert;
exports.logRun = logRun;
exports.connection = connection;
