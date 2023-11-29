function clickSaveButton(canvas) {
    try {
        saveAsFile(canvas);
    } catch(err) {
        console.error(err);
        alert('예기치 못한 오류로 인해 파일을 저장하는데 실패하였습니다.');
    }
}

function saveAsFile(canvas) {
    const defaultName = 'capture';
    const fileName = prompt('파일명을 입력해주세요:', defaultName);
    if (fileName === null) return;

    const dataUrl = canvas.toDataURL("image/jpeg");
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.jpg`;

    link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

    showMessage("파일을 저장하는데 성공하였습니다.", "#28a745");
}