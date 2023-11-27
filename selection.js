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
    });
    document.body.style.cursor = 'auto';
    darkBackground.parentNode.removeChild(darkBackground);
    selectedArea.parentNode.removeChild(selectedArea);
    document.body.removeEventListener("mouseup", mouseup);
}