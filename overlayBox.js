function createImageOverlay(dataUrl, canvas) {
    const overlayBox = document.createElement('div');
    overlayBox.id = "overlayBox";

    const closeButton = document.createElement('button');
    closeButton.id = "closeButton"
    closeButton.innerText = 'X';
    closeButton.onclick = function() {
        document.body.removeChild(overlayBox);
    };

    const message = document.createElement('p');
    message.innerText = '이미지가 캡쳐되었습니다';
    message.id = "message";

    const img = new Image();
    img.src = dataUrl;
    img.style.width = '100%';
    img.style.borderRadius = '8px';

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";

    const ocrButton = document.createElement("button");
    ocrButton.id = "ocrButton";
    ocrButton.innerText = "OCR 분석";
    ocrButton.onclick = async function () {
        await sendToClovaOCR();
    }

    const saveButton = document.createElement("button");
    saveButton.id = "saveButton";
    saveButton.innerText = "저장";
    saveButton.onclick = function () {
        saveAsFile(canvas);
    }

    buttonContainer.appendChild(ocrButton);
    buttonContainer.appendChild(saveButton);

    overlayBox.appendChild(closeButton);
    overlayBox.appendChild(message);
    overlayBox.appendChild(img);
    overlayBox.appendChild(buttonContainer);
    document.body.appendChild(overlayBox);
}

async function displayClipboardImage(canvasEl) {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type === "image/png") {
                    const blob = await clipboardItem.getType(type);
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        createImageOverlay(event.target.result, canvasEl);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    } catch (err) {
        throw err;
    }
}