let isSelecting = false;
let start_clientX, start_clientY;
let darkBackground = null;
let selectedArea = null;
let DPR;
let image_blob = null;
let image_base64 = null;

function showMessage(message, bgColor, textColor) {
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.id = "bottomMessage";
    messageEl.style.backgroundColor = bgColor;
    messageEl.style.color = textColor;

    document.body.appendChild(messageEl);

    setTimeout(() => {
        document.body.removeChild(messageEl);
    }, 4000);
}