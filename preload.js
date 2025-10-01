const { contextBridge, ipcRenderer } = require('electron');


console.log(`Loading main.js preload script into electron app!`);


contextBridge.exposeInMainWorld(
    'initialData',
    {
        preloadPath: process.argv.find(arg => arg.startsWith('--webview-preload-path='))?.replace('--webview-preload-path=', '') || ''
    }
);


contextBridge.exposeInMainWorld(
    'electron',
    {
        invoke: (channel, data) => ipcRenderer.invoke(channel, data)
    }
);


// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener(
    'DOMContentLoaded',
    () => {
        const replaceText = (selector, text) => {
            const element = document.getElementById(selector)
            if (element) element.innerText = text
        }

        for (const dependency of ['chrome', 'node', 'electron']) {
            replaceText(`${dependency}-version`, process.versions[dependency])
        }
    }
);