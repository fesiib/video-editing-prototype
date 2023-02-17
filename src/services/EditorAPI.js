const ADDR = "http://localhost:7777/";

const REQUEST_TYPES = {
    upload: {
        serverAddr: ADDR,
        route: "upload_video"
    },
    subclip: {
        serverAddr: ADDR,
        route: "edit/subclip"
    },
    getVideo: {
        serverAddr: ADDR,
        route: "video/",
    }
};

function sendJSONRequest(requestJSON, requestType, retries = 0) {
    return new Promise((resolve, reject) => {
        if (retries > 0) {
            console.log("Error: cannot access the server: " + requestType.route);
            reject([]);
        }
        else {
            const request = new Request(
                requestType.serverAddr + requestType.route,
                {
                    method: 'POST',
                    body: JSON.stringify(requestJSON),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            fetch(
                request,
            )
                .then( (response) => response.json())
                    .then((response) => {
                        resolve(response);
                    })
                        .catch((error) => {
                            console.log("retrying because of: " + error);
                            resolve(sendJSONRequest(requestJSON, requestType, retries + 1));
                        });
        }
    });
}

function uploadVideoFileRequest(videoFile, requestType) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('video_file', videoFile);
        formData.append('video_filename', videoFile.name);

        for (let data of formData) {
            console.log(data);
        }

        const request = new Request(
            requestType.serverAddr + requestType.route,
            {
                method: 'POST',
                body: formData,
                // headers: {
                //     'Content-Type': 'multipart/form-data',
                // },
            }
        );
        fetch(request)
            .then( (response) => response.json())
                .then((response) => {
                    if (response["status"] === 0)
                        reject(response);
                    resolve(response);
                })
                    .catch((error) => {
                        console.log(error);
                        reject([]);
                    });
    });
}

export function uploadVideoToServer(videoFile) {
    return uploadVideoFileRequest(videoFile, REQUEST_TYPES.upload);
}

export function getVideoUrlFromVideoId(videoId) {
    return REQUEST_TYPES.getVideo.serverAddr + REQUEST_TYPES.getVideo.route + videoId;
}