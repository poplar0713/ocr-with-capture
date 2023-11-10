async function sendToClovaOCR() {
    const base64Image = convertBlobToBase64(image_blob);
    const payload = {
        lang : "ko",
        request_id : USER_CONFIG.ID,
        timestamp : Date.now(),
        version: "V1",
        images : [
            {
                format : "png",
                name : "target",
                url : null,
                data : base64Image
            }
        ]
    };

    chrome.runtime.sendMessage({
        action: 'sendToClovaOCR', data: { apiConfig: API_CONFIG, payload: payload }
    }, response => {
        if(response.success) {
            console.log('Image sent to the server successfully', response.data);
        } else {
            console.error('Failed to send image to the server', response.error);
        }
    })

}

async function convertBlobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return reader.result;
}