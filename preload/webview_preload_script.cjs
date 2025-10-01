const { contextBridge, ipcRenderer } = require('electron');

console.log(`Loading webview preload script!`);

contextBridge.exposeInMainWorld(
    'electron',
    {
        sendMessage: (channel, data) => {
            ipcRenderer.sendToHost(channel, data);
        },
    }
);
