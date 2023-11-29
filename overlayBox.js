async function displayClipboardImage(canvasEl) {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type === "image/png") {
                    const blob = await clipboardItem.getType(type);
                    const reader = new FileReader();
                    reader.onload = function (event) {
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

async function displayOcrResult(result) {
    const overlayBox = document.getElementById("overlayBox");
    if(overlayBox == null) {
        return;
    }
    overlayBox.removeChild(document.getElementById("clipboardImage"));
    overlayBox.removeChild(document.getElementById("buttonContainer"));

    const contentBox = document.createElement("div");
    contentBox.id = "contentBox";

    const imageContent = new Image();
    imageContent.id = "imageContent";
    imageContent.src = image_base64;

    const textContent = document.createElement("div");
    textContent.id = "textContent";
    textContent.innerText = result;

    contentBox.appendChild(imageContent);
    contentBox.appendChild(textContent);
    overlayBox.appendChild(contentBox);
}

function createImageOverlay(dataUrl, canvas) {
    const overlayBox = document.createElement('div');
    overlayBox.id = "overlayBox";

    const loadingIndicator = document.createElement('div');

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
    img.id = "clipboardImage";
    img.src = dataUrl;
    img.style.width = '100%';
    img.style.borderRadius = '8px';

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";

    const ocrButton = document.createElement("button");
    ocrButton.id = "ocrButton";
    ocrButton.innerText = "OCR 분석";
    ocrButton.onclick = () => clickOcrButton();

    const saveButton = document.createElement("button");
    saveButton.id = "saveButton";
    saveButton.innerText = "저장";
    saveButton.onclick = () => clickSaveButton(canvas);

    buttonContainer.appendChild(ocrButton);
    buttonContainer.appendChild(saveButton);

    overlayBox.appendChild(loadingIndicator);
    overlayBox.appendChild(closeButton);
    overlayBox.appendChild(message);
    overlayBox.appendChild(img);
    overlayBox.appendChild(buttonContainer);
    document.body.appendChild(overlayBox);
}

function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}