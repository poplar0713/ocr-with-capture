document.getElementById('captureButton').addEventListener('click', function() {
    // 현재 활성 탭을 가져온다.
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        if (activeTab) {
            chrome.scripting.insertCSS({
                target: { tabId: activeTab.id },
                files: ["capture.css"]
            });
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: startSelection
            });
        }
    });
});

function startSelection() {
    // 메세지 전달
    window.postMessage({ type: "START_SELECTION" }, '*');
}