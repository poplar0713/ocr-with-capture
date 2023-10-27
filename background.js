function captureVisibleTabPromise() {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
            console.log(dataUrl);
            resolve(dataUrl);
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureVisibleTab") {
        captureVisibleTabPromise().then(dataUrl => {
            sendResponse(dataUrl);
        });
        return true;
    }
});