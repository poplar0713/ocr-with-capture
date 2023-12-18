async function clickOcrButton() {
    try {
        showLoadingIndicator();
        const result = await sendToClovaOCR();
        if(result) {
            await displayOcrResult(result);
        } else {
            console.log("text result is null");
        }
    } catch(err) {
        console.error(err);
        alert(err);
    } finally {
        hideLoadingIndicator();
    }
}

async function sendToClovaOCR() {
    const base64Image = await getDataURLbody();
    const payload = {
        lang : "ko",
        requestId : USER_CONFIG.ID,
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
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'sendToClovaOCR', data: { apiConfig: API_CONFIG, payload: payload }
        }, response => {
            if (response.success) {
                let inferTexts = '';
                const data = response.data;
                if (data && data.images) {
                    data.images.forEach(image => {
                        if (image.fields) {
                            image.fields.forEach(field => {
                                if (field.inferText) {
                                    inferTexts += ' ' + field.inferText; // 문자열을 올바르게 누적
                                }
                            });
                        }
                    });
                    resolve(inferTexts.trim()); // 결과 반환
                } else {
                    reject('Response is not received or images are null.');
                }
            } else {
                reject('Failed to send image to the server: ' + response.error);
            }
        });
    });
}

function getDataURLbody() {
    return new Promise((resolve, reject) => {
        if(!image_base64) reject('dataURL is not founded');
        let result = image_base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        resolve(result);
    });
}