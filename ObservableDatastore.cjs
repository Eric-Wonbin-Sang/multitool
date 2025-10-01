const { EventEmitter } = require('events');
const Datastore = require('@seald-io/nedb');


class ObservableDatastore extends EventEmitter {

    constructor({ filename, autoload = true }) {
        super();
        this.db = new Datastore({ filename, autoload });
        this.listen();  // <--- setup listeners immediately
    }

    listen() {
        this.on('insert', (newDoc) => {
            console.log('[DB] Inserted new document:', newDoc);
        });

        this.on('update', (updateInfo) => {
            console.log('[DB] Updated document(s):', updateInfo);
        });

        this.on('remove', (removeInfo) => {
            console.log('[DB] Removed document(s):', removeInfo);
        });
    }

    insert(doc) {
        return new Promise((resolve, reject) => {
            this.db.insert(doc, (err, newDoc) => {
                if (err) reject(err);
                else {
                    this.emit('insert', newDoc);
                    resolve(newDoc);
                }
            });
        });
    }

    update(query, update, options = {}) {
        return new Promise((resolve, reject) => {
            this.db.update(query, update, options, (err, numAffected, affectedDocs, upsert) => {
                if (err) reject(err);
                else {
                    this.emit('update', { query, update, options, affectedDocs });
                    resolve({ numAffected, affectedDocs, upsert });
                }
            });
        });
    }

    remove(query, options = {}) {
        return new Promise((resolve, reject) => {
            this.db.remove(query, options, (err, numRemoved) => {
                if (err) reject(err);
                else {
                    this.emit('remove', { query, options });
                    resolve(numRemoved);
                }
            });
        });
    }

    find(...args) {
        return this.db.find(...args);
    }

    findOne(...args) {
        return this.db.findOne(...args);
    }

    count(...args) {
        return this.db.count(...args);
    }
}


module.exports = ObservableDatastore;
