chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureVisibleTab") {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
            sendResponse(dataUrl);
        });
        // 비동기 응답을 보내기 위해 true를 반환
        return true;
    }
});