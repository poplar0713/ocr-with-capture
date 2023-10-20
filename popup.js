document.getElementById("captureBtn").addEventListener("click", function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['html2canvas.min.js']
        }, () => {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                code: captureCode()
            });
        });
    });
});

function captureCode() {
    const format = document.getElementById("fileFormat").value;
    const saveTo = document.getElementById("saveTo").value;

    return `
        html2canvas(document.body).then(canvas => {
            const dataUrl = canvas.toDataURL('image/${format}');
            if ('${saveTo}' === 'clipboard') {
                navigator.clipboard.writeText(dataUrl);
            } else {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'capture.${format}';
                link.click();
            }
        });
    `;
}
