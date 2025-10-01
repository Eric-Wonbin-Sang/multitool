// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { spawn } = require('child_process');

const dbPath = path.join(__dirname, 'database.cjs');
const { sourceDataDb, setupSourceDataDbHandlers, buildingsDb, listingsDb } = require(dbPath);

setupSourceDataDbHandlers();

const isDev = !app.isPackaged;

// ipcMain.handle(
//     'db:get-buildings',
//     async () => {
//         return new Promise(
//             (resolve, reject) => {
//                 buildingsDb.find(
//                     {},
//                     (err, docs) => {
//                         if (err) reject(err);
//                         else resolve(docs);
//                     }
//                 );
//             }
//         );
//     }
// );

// ipcMain.handle(
//     'db:insert-building',
//     async (_, buildingInfo) => {
//         return new Promise(
//             (resolve, reject) => {
//                 buildingsDb.insert(
//                     buildingInfo,
//                     (err, newDoc) => {
//                         if (err) reject(err);
//                         else resolve(newDoc);
//                     }
//                 );
//             }
//         );
//     }
// )


const createWindow = () => {

    const preloadPath = path.join(__dirname, 'preload', 'webview_preload_script.cjs');

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            additionalArguments: [`--webview-preload-path=${preloadPath}`],
            nodeIntegration: true,
            contextIsolation: true,
            webviewTag: true // 👈 enable webview support
        }
    })

    const startURL = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, 'dist/index.html')}`;

    if (isDev) {
        mainWindow.loadURL(startURL);
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(startURL);
    }
}

let pythonProcess;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    const backendPath = isDev
        ? path.join(__dirname, 'backend/.venv/Scripts/python.exe') // dev: launch Python
        : path.join(__dirname, 'dist/server.exe'); // prod: launch frozen binary

    const args = isDev
        ? [path.join(__dirname, 'backend/server.py')]
        : [];

    pythonProcess = spawn(backendPath, args);

    pythonProcess.stdout.on('data', (data) => console.log(`PYTHON: ${data}`));
    pythonProcess.stderr.on('data', (data) => console.error(`PYTHON ERR: ${data}`));

    createWindow()

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


app.on('will-quit', () => {
    if (pythonProcess) pythonProcess.kill();
});