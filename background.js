function captureVisibleTabPromise() {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
            console.log(dataUrl);
            resolve(dataUrl);
        });
    });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "captureVisibleTab") {
        const dataUrl = await captureVisibleTabPromise();
        console.log(dataUrl);
        sendResponse(dataUrl);
        // 비동기 응답을 보내기 위해 true를 반환
        return true;
    }
});