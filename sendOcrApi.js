async function sendToClovaOCR() {
    const base64Image = await convertBlobToBase64(image_blob);
    const requestId = USER_CONFIG.ID;
    const payload = {
        lang : "ko",
        requestId : requestId,
        timestamp : Date.now(),
        version: "V1",
        images : [
            {
                format : "png",
                name : "target",
                data : base64Image,
                url : null,
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
    });

    return true;
}

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onloadend = function() {
            let base64data = reader.result;
            let result = base64data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            resolve(result);
        };

        reader.onerror = function(error) {
            reject(error);
        };
    });
}