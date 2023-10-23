let isSelecting = false;
let startX, startY, endX, endY;
let selectionBox = null;

function createSelectionBox(x, y) {
    const box = document.createElement('div');
    box.style.border = '2px dashed black';
    box.style.position = 'absolute';
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    document.body.appendChild(box);
    console.log('box created');
    return box;
}

window.addEventListener('message', function(event) {
    if (event.data.type === "START_SELECTION") {
        isSelecting = true;
        console.log('capture start');
    }
});

window.addEventListener('mousedown', function (e) {
    if(isSelecting) {
        console.log('mouse down');
        startX = e.pageX;
        startX = e.pageY;
        selectionBox = createSelectionBox(startX, startY);
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isSelecting) return;
    if (isSelecting && selectionBox) {
        console.log('mousemove');
        endX = e.pageX
        endY = e.pageY

        const rectWidth = Math.abs(endX - startX);
        const rectHeight = Math.abs(endY - startY);

        selectionBox.style.left = `${Math.min(startX, endX)}px`;
        selectionBox.style.top = `${Math.min(startY, endY)}px`;
        selectionBox.style.width = `${rectWidth}px`;
        selectionBox.style.height = `${rectHeight}px`;
    }
});

window.addEventListener('mouseup', function(e) {
    if (isSelecting && selectionBox) {
        console.log('mouseup')
        isSelecting = false;

        // Determine the coordinates of the selected area
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(startX - endX);
        const height = Math.abs(startY - endY);

        captureSelectedArea(x, y, width, height);

        // Remove the selection box
        document.body.removeChild(selectionBox);
        selectionBox = null;
        console.log('box destory');
    }
});

function captureSelectedArea(x, y, width, height) {
    html2canvas(document.body, {
        x: x,
        y: y,
        width: width,
        height: height,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight
    }).then(canvas => {
        const dataUrl = canvas.toDataURL("image/jpg");
        console.log('dataURL : ' + dataUrl);
        // Send the captured image data to the background script
        // chrome.runtime.sendMessage({ image: dataUrl }, (response) => {
        //     console.log(response.status);
        // });
    });
}