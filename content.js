let isSelecting = false;
let start_clientX, start_clientY;
let start_pageX, start_pageY;
let darkBackground = null;
let selectedArea = null;

window.addEventListener('message', function(event) {
    if (event.data.type === "START_SELECTION") {
        document.body.style.cursor = 'crosshair';

        darkBackground = document.createElement("div");
        darkBackground.id = "darkBackground";
        darkBackground.style.borderWidth = "0 0 " + window.innerHeight + "px 0";
        let bgInnerText = document.createElement("p");
        bgInnerText.style.color = "white";
        bgInnerText.style.fontWeight = "bolder"
        bgInnerText.style.backgroundColor = "black"
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
    start_pageX = e.pageX;
    start_pageY = e.pageY;
    document.body.removeEventListener("mousedown", mousedown);
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
    let x = e.pageX;
    let y = e.pageY;
    let top = Math.min(y, start_pageY);
    let left = Math.min(x, start_pageX);
    let width = Math.max(x, start_pageX) - left;
    let height = Math.max(y, start_pageY) - top;

    //  html2canvas는 document.body를 기준으로 캡쳐를 한다.
    await html2canvas(document.body).then(
        async function(canvas) {
            var c = document.createElement("canvas");
            var img = canvas.getContext('2d').getImageData(left, top, width, height);
            c.width = width;
            c.height = height;
            c.getContext('2d').putImageData(img, 0, 0);
            await saveToClipboard(canvas).then( async () => {
                await displayClipboardImage().catch((err) => {
                    console.error(displayClipboardImage(), err);
                });
            }).catch((err) => {
                console.error("saveToClipboard", err);
            });
            await saveAsFile(c);
        }
    );
    document.body.style.cursor = 'auto';
    darkBackground.parentNode.removeChild(darkBackground);
    selectedArea.parentNode.removeChild(selectedArea);
    document.body.removeEventListener("mouseup", mouseup);
}

function saveAsFile(canvas) {
    el = document.createElement('a');
    el.id = 'target';
    el.style.display = 'none';
    document.body.appendChild(el);
    el.href = canvas.toDataURL("image/jpg");
    el.download = 'capture.jpg';
    el.click();
    el.href = ''; // Clear the data URL
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

async function displayClipboardImage() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type === "image/png") {
                    const blob = await clipboardItem.getType(type);
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        createImageOverlay(event.target.result);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    } catch (err) {
        throw err;
    }
}


function createImageOverlay(dataUrl) {
    const overlayBox = document.createElement('div');
    overlayBox.style.position = 'fixed';
    overlayBox.style.right = '50px';
    overlayBox.style.top = '50px';
    overlayBox.style.zIndex = '2147483647';
    overlayBox.style.boxShadow = '0 0 10px rgba(0,0,0,1)';
    overlayBox.style.background = 'white';
    overlayBox.style.borderRadius = '10px';
    overlayBox.style.padding = '10px';
    overlayBox.style.maxWidth = '300px';

    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '10px';
    closeButton.style.top = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '12px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
        document.body.removeChild(overlayBox);
    };
    overlayBox.appendChild(closeButton);

    const message = document.createElement('p');
    message.innerText = '이미지가 캡쳐되었습니다';
    message.style.fontWeight = 'bold';
    message.style.marginBottom = '10px';

    const img = new Image();
    img.src = dataUrl;
    img.style.width = '100%';
    img.style.borderRadius = '8px';

    overlayBox.appendChild(message);
    overlayBox.appendChild(img);
    document.body.appendChild(overlayBox);
}