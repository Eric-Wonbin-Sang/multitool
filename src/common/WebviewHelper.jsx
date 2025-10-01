
export const MESSAGE_CHANNELS = {
    FETCH_CHANNEL: 'fetch-channel',
    BEACON_CHANNEL: 'beacon-channel',
}


export class WebviewEvent {

    constructor({ targetMessageChannel, targetUrl, responseCheck = null }) {
        this.targetMessageChannel = targetMessageChannel;
        this.targetUrl = targetUrl;
        this.responseCheck = responseCheck ?? (() => true);
    }
}


export class WebviewHelper {
    
    constructor({ webviewRef }) {
        this.webviewRef = webviewRef;
    }

    runJsInWebview = async (jsStr) => {
        // console.log(`Running in webview:`, jsStr);
        if (!this.webviewRef.current) return;
        return await this.webviewRef.current.executeJavaScript(jsStr);
    }

    runFuncInWebview = async (func) => {  // this requires that the func has no args
        return await this.runJsInWebview(`(${func.toString()})()`);
    }

    getUrl = async () => {
        return await this.runFuncInWebview(() => window.location.href);
    }

    getHtml = async () => {
        return await this.runFuncInWebview(() => document.documentElement.outerHTML);
    }

    waitForElement = async ({ selector, timeout = 5_000 }) => {
        console.log(`Waiting for elem via selector ${selector}`);
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await this.runJsInWebview(`(() => !!document.querySelector('${selector}'))();`)) {
                console.log(`Selector ${selector} found!`);
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 500)); // wait 500ms before trying again
        }
        throw new Error(`Element ${selector} not found within ${timeout}ms`);
    };
    
    clickBySelector = async (selector) => {
        await this.runJsInWebview(
            `
            (
                () => {
                    const el = document.querySelector('${selector}');
                    // console.log('el: ', el);
                    if (el) el.click();
                }
            )();
            `
        );
    }

    scrollThroughElem = async ({ selector, scrollStep = 500, delay = 20 } = {}) => {
        return await this.runJsInWebview(`
            (
                () => {

                    const selector = '${selector}';
                    const scrollStep = ${scrollStep};
                    const delay = ${delay};

                    return new Promise(
                        (resolve) => {
                            const container = document.querySelector(selector);
                            if (!container) return resolve();
            
                            let prevScrollTop = 0;
                            container.scrollTop = 0;
                            const scrollInterval = setInterval(
                                () => {
                                    prevScrollTop = container.scrollTop;
                                    container.scrollTop += scrollStep;
                                    if (container.scrollTop + container.clientHeight >= container.scrollHeight || prevScrollTop == container.scrollTop) {
                                        clearInterval(scrollInterval);
                                        resolve();
                                    }
                                },
                                delay
                            );
                        }
                    )
                }
            )();
            `
        );
    }

    sleep = async (delay) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // ---- REQUEST EVENT LOGIC

    injectFetchListener = async () => {
        await this.runJsInWebview(
            `
            (
                function() {

                    const originalFetch = window.fetch;
                
                    window.fetch = function(input, init) {

                        const getResponse = async () => {
                            const response = await originalFetch.call(this, input, init);
                            if (window.electron && window.electron.sendMessage) {

                                const url = typeof input === "string" ? input : input.url;

                                // Clone first so you don't disturb the real fetch chain
                                const clonedResponse = response.clone();

                                let responseData;

                                try {
                                    responseData = await clonedResponse.json();
                                }
                                catch (error) {
                                    try {
                                        responseData = await clonedResponse.text();
                                    }
                                    catch {
                                        responseData = clonedResponse;
                                    }
                                }

                                const channel = '${MESSAGE_CHANNELS.FETCH_CHANNEL}';
                                const message = { url, input, init, response: responseData };
                                console.log(\`FETCH OVERRIDE - sending data to \${channel}:\`, message);
                                window.electron.sendMessage(channel, message);
                            }
                            else {
                                console.warn('FETCH OVERRIDE - Electron bridge not available');
                            }
                            return response;
                        }
                        return getResponse();
                    };
                }
            )();
            `
        );
    }

    injectBeaconListener = async () => {
        await this.runJsInWebview(
            `
            (
                function() {

                    const originalSendBeacon = navigator.sendBeacon;
                
                    navigator.sendBeacon = function(url, data) {

                        const getResponse = async () => {
                            const response = await originalSendBeacon.call(this, url, data);
                            if (window.electron && window.electron.sendMessage) {

                                parsed = typeof data === 'string' ? JSON.parse(data) : JSON.parse(new TextDecoder().decode(data));

                                const channel = '${MESSAGE_CHANNELS.BEACON_CHANNEL}';
                                const message = { url, data, response: parsed };
                                console.log(\`BEACON OVERRIDE - sending data to \${channel}:\`, message);
                                window.electron.sendMessage(channel, message);
                            }
                            else {
                                console.warn('BEACON OVERRIDE - Electron bridge not available');
                            }
                            return response;
                        }
                        return getResponse();
                    };
                }
            )();
            `
        );
    }

    waitForEvent = ({ targetEvent, timeout = 5000 }) => {
        return new Promise(
            (resolve) => {
                if (!this.webviewRef.current) return;

                let timeoutId;

                const cleanup = () => {
                    this.webviewRef.current.removeEventListener('ipc-message', handleMessage);
                    if (timeoutId) clearTimeout(timeoutId);
                }

                const handleMessage = (event) => {
                    if (event.channel !== targetEvent.targetMessageChannel) return;
        
                    const payload = event.args[0];
                    const { url, response } = payload;
                    if (url.includes(targetEvent.targetUrl) && targetEvent.responseCheck(response)) {
                        console.warn('waitForEvent - found event:', targetEvent);
                        cleanup();
                        resolve(payload);
                    }
                };

                this.webviewRef.current.addEventListener('ipc-message', handleMessage);

                timeoutId = setTimeout(
                    () => {
                        cleanup();
                        console.warn('Could not get event:', targetEvent);
                        resolve(null);
                    },
                    timeout
                );
            }
        );
    }
    
    waitForEvents = ({ targetEvent, timeout = 5000 }) => {

        const results = [];

        return new Promise(
            (resolve) => {
                if (!this.webviewRef.current) return;

                let timeoutId;

                const cleanup = () => {
                    this.webviewRef.current.removeEventListener('ipc-message', handleMessage);
                    if (timeoutId) clearTimeout(timeoutId);
                }

                const handleMessage = (event) => {
                    if (event.channel !== targetEvent.targetMessageChannel) return;
        
                    const payload = event.args[0];
                    const { url } = payload;
                    if (url.includes(targetEvent.targetUrl)) {
                        console.warn('waitForEvent - found event:', targetEvent);
                        results.push(payload);
                    }
                };

                this.webviewRef.current.addEventListener('ipc-message', handleMessage);

                timeoutId = setTimeout(
                    () => {
                        cleanup();
                        console.warn('Could not get event:', targetEvent);
                        resolve(results);
                    },
                    timeout
                );
            }
        );
    }
}
