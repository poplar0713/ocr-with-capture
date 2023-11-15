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
        // 데이터 URL을 Blob 객체로 변환
        const data = atob(dataUrl.split(',')[1]);
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