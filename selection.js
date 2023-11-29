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
        darkBackground.appendChild(bgInnerText);

        selectedArea = document.createElement("div");
        selectedArea.id = "selectedArea";

        document.body.appendChild(darkBackground);
        document.body.appendChild(selectedArea);

        document.body.addEventListener("mousedown", mousedown);
        document.body.addEventListener("mousemove", mousemove);
        document.body.addEventListener("mouseup", mouseup);

        showMessage("화면을 클릭, 드래그하면 캡쳐할 수 있습니다." , '#FFFFFF', '#000000')
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
    document.body.removeEventListener("mouseup", mouseup);
    document.body.style.cursor = 'auto';
    darkBackground.parentNode.removeChild(darkBackground);
    selectedArea.parentNode.removeChild(selectedArea);

    const x = e.clientX * DPR;
    const y = e.clientY * DPR;
    const startX = start_clientX * DPR;
    const startY = start_clientY * DPR;
    const top = Math.min(y, startY);
    const left = Math.min(x, startX);
    const width = Math.max(x, startX) - left;
    const height = Math.max(y, startY) - top;

    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({action: "captureVisibleTab"}, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });

        let canvasEl = document.createElement("canvas");
        let canvasRenderingContext2D = canvasEl.getContext('2d');
        canvasEl.width = width;
        canvasEl.height = height;

        const resImg = new Image();
        resImg.src = response;
        resImg.onload = async function() {
            canvasRenderingContext2D.drawImage(resImg, left, top, width, height, 0, 0, width, height);
            try {
                await saveToClipboard(canvasEl);
                await displayClipboardImage(canvasEl);
            } catch (err) {
                console.error('Error in saving to clipboard or displaying image:', err);
            }
        };
        resImg.onerror = function (err) {
            console.error('Failed to load the image.', err);
        };
    } catch (err) {
        console.error('Error in capturing the tab:', err);
    }
}

async function saveToClipboard(canvas) {
    try {
        image_base64 = canvas.toDataURL('image/png');
        // 데이터 URL을 Blob 객체로 변환
        const data = atob(image_base64.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(data.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < data.length; i++) {
            uintArray[i] = data.charCodeAt(i);
        }

        image_blob = new Blob([uintArray], { type: 'image/png' });
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': image_blob
            })
        ]);
    } catch (err) {
        throw err;
    }
}