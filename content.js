let isSelecting = false;
let win_width, win_height;
let startX, startY;
let darkBackground = null;
let selectedArea = null;

window.addEventListener('message', function(event) {
    if (event.data.type === "START_SELECTION") {
        win_width = window.innerWidth;
        win_height = window.innerHeight;

        document.body.style.cursor = 'crosshair';

        darkBackground = document.createElement("div");
        darkBackground.id = "darkBackground";
        darkBackground.style.borderWidth = "0 0 " + win_height + "px 0";

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
    startX = e.clientX;
    startY = e.clientY;
    console.log('mousedown', startX, startY);

    document.body.removeEventListener("mousedown", mousedown);
}

function mousemove(e) {
    if(isSelecting) {
        let x = e.clientX;
        let y = e.clientY;
        selectedArea.style.left = x;
        selectedArea.style.right = y;

        var top = Math.min(y, startY);
        var right = win_width - Math.max(x, startX);
        var bottom = win_height - Math.max(y, startY);
        var left = Math.min(x, startX);
        darkBackground.style.borderWidth = top + 'px ' + right + 'px ' + bottom + 'px ' + left + 'px';
        console.log('mousemove', top, right, bottom, left);
    }
}

function mouseup(e) {
    isSelecting = false;
    document.body.removeEventListener("mousemove", mousemove);
    darkBackground.parentNode.removeChild(darkBackground);
    var x = e.clientX;
    var y = e.clientY;
    var top = Math.min(y, startY);
    var left = Math.min(x, startX);
    var width = Math.max(x, startX) - left;
    var height = Math.max(y, startY) - top;

    html2canvas(document.body).then(
        function(canvas) { //전체 화면 캡쳐
            // 선택 영역만큼 crop
            var img = canvas.getContext('2d').getImageData(left, top, width, height);
            var c = document.createElement("canvas");
            c.width = width;
            c.height = height;
            c.getContext('2d').putImageData(img, 0, 0);
            save(c);
        }
    );
    document.body.style.cursor = 'auto';
    selectedArea.parentNode.removeChild(selectedArea);
    document.body.removeEventListener("mouseup", mouseup);
    console.log('mouseup', width, height);
}

function save(canvas) {
    if (navigator.msSaveBlob) {
        var blob = canvas.msToBlob();
        return navigator.msSaveBlob(blob, '파일명.jpg');
    } else {
        var el = document.getElementById("target");
        el.href = canvas.toDataURL("image/jpeg");
        el.download = '파일명.jpg';
        el.click();
    }
}