let isSelecting = false;
let start_clientX, start_clientY;
let darkBackground = null;
let selectedArea = null;
let DPR;

window.addEventListener('message', function(event) {
    if (event.data.type === "START_SELECTION") {
        DPR = window.devicePixelRatio;
        document.body.style.cursor = 'crosshair';
        darkBackground = document.createElement("div");
        darkBackground.id = "darkBackground";
        darkBackground.style.borderWidth = "0 0 " + window.innerHeight + "px 0";
        let bgInnerText = document.createElement("p");
        bgInnerText.style.color = "white";
        bgInnerText.style.fontWeight = "bolder"
        bgInnerText.id = "bgInnerText";
        bgInnerText.innerText = "화면을 클릭, 드래그하면 캡쳐할 수 있습니다.";
        darkBackground.appendChild(bgInnerText);

        selectedArea = document.createElement("div");
        selectedArea.id = "selectedArea";

        document.body.appendChild(darkBackground);
        document.body.appendChild(selectedArea);

        document.body.addEventListener("mousedown", mousedown);
        document.body.addEventListener("mousemove", mousemove);
        document.body.addEventListener("mouseup", mouseup);
    }
});

function mousedown(e) {
    e.preventDefault();
    isSelecting = true;
    start_clientX = e.clientX;
    start_clientY = e.clientY;
    document.body.removeEventListener("mousedown", mousedown);
    //darkBackground.removeChild("bgInnerText")
}

function mousemove(e) {
    if(isSelecting) {
        let x = e.clientX;
        let y = e.clientY;
        selectedArea.style.left = x;
        selectedArea.style.right = y;

        let top = Math.min(y, start_clientY);
        let right = window.innerWidth - Math.max(x, start_clientX);
        let bottom = window.innerHeight - Math.max(y, start_clientY);
        let left = Math.min(x, start_clientX);
        darkBackground.style.borderWidth = top + 'px ' + right + 'px ' + bottom + 'px ' + left + 'px';
    }
}

async function mouseup(e) {
    isSelecting = false;
    document.body.removeEventListener("mousemove", mousemove);
    let x = e.clientX * DPR;
    let y = e.clientY * DPR;
    let top = Math.min(y, start_clientY * DPR);
    let left = Math.min(x, start_clientX * DPR);
    let width = Math.max(x, start_clientX * DPR) - left;
    let height = Math.max(y, start_clientY * DPR) - top;

    chrome.runtime.sendMessage({action: "captureVisibleTab"}, async (response) => {
        let canvasEl = document.createElement("canvas");
        let canvasRenderingContext2D = canvasEl.getContext('2d');
        const dataURL = response;
        const resImg = new Image();
        resImg.src = dataURL;
        resImg.onerror = function (err) {
            console.log('Failed to load the image.', err);
        }
        resImg.onload = function() {
            canvasEl.width = width;
            canvasEl.height = height;
            canvasRenderingContext2D.drawImage(resImg, left, top, width, height, 0, 0, width, height);
            saveToClipboard(canvasEl).then( () => {
                displayClipboardImage(canvasEl).catch((err) => {
                    console.error('displayClipboardImage()', err);
                })
            }).catch((err) => {
                console.error('saveToClipboard()', err);
            });
        }
        //await saveAsFile(canvasEl);
    });

    document.body.style.cursor = 'auto';
    darkBackground.parentNode.removeChild(darkBackground);
    selectedArea.parentNode.removeChild(selectedArea);
    document.body.removeEventListener("mouseup", mouseup);
}

function saveAsFile(canvas) {
    const defaultName = 'capture';
    const fileName = prompt('파일명을 입력해주세요:', defaultName);
    // 사용자가 취소 버튼을 눌렀다면 저장 작업을 중단
    if (fileName === null) return;
    const el = document.createElement('a');
    el.style.display = 'none';
    document.body.appendChild(el);
    el.href = canvas.toDataURL("image/jpeg");
    el.download = `${fileName}.jpg`;
    el.click();
    document.body.removeChild(el);
}

async function saveToClipboard(canvas) {
    try {
        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ]);
        console.log('Image copied to clipboard');
    } catch (err) {
        throw err;
    }
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

    const saveButton = document.createElement("button");
    saveButton.id = "saveButton";
    saveButton.innerText = "저장";
    saveButton.onclick = function () {
        saveAsFile(canvas);
    }

    overlayBox.appendChild(closeButton);
    overlayBox.appendChild(message);
    overlayBox.appendChild(img);
    overlayBox.appendChild(saveButton);
    document.body.appendChild(overlayBox);
}