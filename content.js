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
    console.log('e.clientX,Y', e.clientX, e.clientY);
    console.log('e.pageX,Y', e.pageX, e.pageY);

    document.body.removeEventListener("mousedown", mousedown);
}

function mousemove(e) {
    if(isSelecting) {
        let x = e.clientX;
        let y = e.clientY;
        selectedArea.style.left = x;
        selectedArea.style.right = y;

        var top = Math.min(y, start_clientY);
        var right = window.innerWidth - Math.max(x, start_clientX);
        var bottom = window.innerHeight - Math.max(y, start_clientY);
        var left = Math.min(x, start_clientX);
        darkBackground.style.borderWidth = top + 'px ' + right + 'px ' + bottom + 'px ' + left + 'px';
        console.log('mousemove', top, right, bottom, left);
    }
}

function mouseup(e) {
    isSelecting = false;
    document.body.removeEventListener("mousemove", mousemove);
    var x = e.pageX;
    var y = e.pageY;
    var top = Math.min(y, start_pageY);
    var left = Math.min(x, start_pageX);
    var width = Math.max(x, start_pageX) - left;
    var height = Math.max(y, start_pageY) - top;

    //  html2canvas는 document.body를 기준으로 캡쳐를 한다.
    html2canvas(document.body).then(
        function(canvas) {
            var c = document.createElement("canvas");
            var img = canvas.getContext('2d').getImageData(left, top, width, height);
            c.width = width;
            c.height = height;
            c.getContext('2d').putImageData(img, 0, 0);
            save(c);
        }
    );
    document.body.style.cursor = 'auto';
    darkBackground.parentNode.removeChild(darkBackground);
    selectedArea.parentNode.removeChild(selectedArea);
    document.body.removeEventListener("mouseup", mouseup);
    console.log('mouseup', width, height);
}

function save(canvas) {
    el = document.createElement('a');
    el.id = 'target';
    el.style.display = 'none';
    document.body.appendChild(el);
    el.href = canvas.toDataURL("image/jpeg");
    el.download = '파일명.jpg';
    el.click();
    el.href = ''; // Clear the data URL
}