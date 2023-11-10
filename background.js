function captureVisibleTabPromise() {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
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

    if (message.action === "sendToClovaOCR") {
        fetch(message.data.apiConfig.CLOVA_OCR_URL, {
            method: 'post',
            headers: {
                'Content-Type' : 'application/json',
                'X-OCR-SECRET' : message.data.apiConfig.X_OCR_SECRET
            },
            body: JSON.stringify(message.data.payload)
        }).then(response => response.json())
            .then(data => {
                sendResponse({success: true, data: data});
            }).catch(err => {
                sendResponse({success: false, error: err});
        });

        return true;
    }
});