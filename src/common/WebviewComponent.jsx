import { useEffect } from 'react';
import styles from './WebviewComponent.module.css';


export const WebviewComponent = (props) => {

    const preloadPath = window.initialData?.preloadPath || '';

    const { webviewRef, url } = props;

    useEffect(
        () => {
            const webview = webviewRef.current;
            if (!webview) return;

            webview.addEventListener(
                'dom-ready',
                () => {
                    webviewRef.current.openDevTools();
                    console.log('Webview loaded:', url);
                    webview.executeJavaScript(`document.title`)
                        .then(result => console.log('Website title:', result));
                }
            );

            return () => {
                if (webview) {
                    webview.removeEventListener('dom-ready', () => { });
                }
            };
        },
        [url]
    );

    return (
        <webview
            className={styles.webview_component}
            ref={webviewRef}
            src={url}
            preload={preloadPath}
            devtools
            webpreferences="contextIsolation=no"
            onMessage={(event) => {
                alert(event.nativeEvent.data);
            }}
        />
    );
}
