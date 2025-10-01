const path = require('path');
const fs = require('fs');
const { ipcMain } = require('electron');
const dayjs = require('dayjs');

const observableDatastorePath = path.join(__dirname, 'ObservableDatastore.cjs');
const ObservableDatastore = require(observableDatastorePath);


// Make sure data directory exists
const dbPath = path.join(__dirname, 'data');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
}

// Setup NeDB datastores
const sourceDataDb = new ObservableDatastore({ filename: path.join(dbPath, 'sourceData.db') });
const buildingsDb = new ObservableDatastore({ filename: path.join(dbPath, 'buildings.db') });
const listingsDb = new ObservableDatastore({ filename: path.join(dbPath, 'listings.db') });

setupSourceDataDbHandlers = () => {
    ipcMain.handle(
        'sourceDataDb:insert',
        async (_, data) => {
            const documentToInsert = {
                ...data,
                createdAt: dayjs().toISOString(),
            };
            return await new Promise(
                (resolve, reject) => {
                    sourceDataDb.insert(
                        documentToInsert,
                        (err, newDoc) => {
                            if (err) reject(err);
                            else resolve(newDoc);
                        }
                    );
                }
            );
        }
    );
}

module.exports = {
    sourceDataDb,
    setupSourceDataDbHandlers,
    buildingsDb,
    listingsDb,
};
