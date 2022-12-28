// import {getWebGLRenderingContext} from "./utils/gl/gl-util";
var fps = 30;

var getImgDataTimes = [];


const inputContainer = new InputContainer(fps, 'input-video-container');
inputContainer.hiddenVideo.muted = true;
if (true) {
    // outputContainer.video.controls = false;
    inputContainer.videoControls.classList.remove('hidden');
}
// const videoWorks = !!document.createElement('video').canPlayType;
// if (videoWorks) {
//     inputContainer.video.controls = false;
//     inputContainer.videoControls.classList.remove('hidden');
// }

const outputContainer = new OutputContainer(fps, 'output-video-container');
// outputContainer.hiddenVideo.muted = true;
// const videoWorks = !!document.createElement('video').canPlayType;
if (true) {
    // outputContainer.video.controls = false;
    outputContainer.videoControls.classList.remove('hidden');
}

var buffer = new BufferFrame(length=150, idMaxPoint=90, savedFrames=outputContainer.listImage);

var videoEncoder;
const blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
    });
};
var vidName;
// var lengthSegment = fps * 30;
// var isFirstSegment = true;
// var idStartSegment = 0;
// var storeCanvas;
// var storeCtx;

var captureCanvas = document.getElementById('capture-canvas');
var captureCtx;
// var localStoreCanvas = document.createElement('canvas');
var localStoreCanvas = document.getElementById('local-store-canvas');
var localStoreGlCtx;
readyWebgl();
async function readyWebgl(){
    // await registerWebGLbackend(localStoreCanvas);
    // await tf.setBackend('customgl');
    // await tf.ready();
    // await syncWait(tf.backend().getGPGPUContext().gl); 

    const customBackendName = 'custom-webgl2';
    const kernels = tf.getKernelsForBackend('webgl');
    kernels.forEach(kernelConfig => {
        const newKernelConfig = {...kernelConfig, backendName: customBackendName};
        tf.registerKernel(newKernelConfig);
    });
    localStoreGlCtx = getWebGLRenderingContext(localStoreCanvas);
    tf.registerBackend(customBackendName, () => {
        return new tf.MathBackendWebGL(
            new tf.GPGPUContext(localStoreGlCtx));
    });
    await tf.setBackend(customBackendName);
    await tf.ready();
}


ldb.clear();



var hiddenVideo = document.getElementById("hidden-video");
hiddenVideo.muted = true;

var inputTag = document.querySelector("#input-tag");
async function readVideo(files) {
    if (files && files[0]) {
        console.log('ON CHANGE');
        const file = files[0];
        vidName = inputTag.value.split('\\').pop();
        let urlBlob = URL.createObjectURL(file);
        hiddenVideo.src = urlBlob;
        inputContainer.hiddenVideo.src = urlBlob;
        // outputContainer.hiddenVideo.src = urlBlob;
        await hiddenVideo.load();
        await inputContainer.hiddenVideo.load();
        // await outputContainer.hiddenVideo.load();

        inputTag = document.querySelector("#input-tag");
        fileInput = inputTag;
        inputTag.addEventListener('change', (e)=>{
            onChangeInputTag(e);
            readVideo(e.target.files);
        });
        inputTag.addEventListener('click', onClickInputTag());
    }
};
inputTag.addEventListener('change', (e)=>{
    readVideo(e.target.files);
});
uploadButton.disabled = true;
uploadButton.addEventListener('click', async ()=>{
    await captureCtx.drawImage(hiddenVideo, 0, 0, captureCanvas.width, captureCanvas.height);
    tensor = await tf.browser.fromPixels(captureCanvas);
    showTensorInCanvasGL(postTensor(tensor), captureCanvas.height, captureCanvas.width, localStoreGlCtx);
})

inputContainer.hiddenVideo.addEventListener('loadedmetadata', async ()=>{
    await inputContainer.hiddenVideo.play();
    await inputContainer.hiddenVideo.pause();
    inputContainer.initializeSize();
    outputContainer.video.width = inputContainer.hiddenVideo.videoWidth;
    outputContainer.video.height = inputContainer.hiddenVideo.videoHeight;
});

hiddenVideo.onloadedmetadata = async () => {
    // alert("Video on load");
    await hiddenVideo.play();
    await hiddenVideo.pause();

    captureCanvas.width = hiddenVideo.videoWidth;
    captureCanvas.height = hiddenVideo.videoHeight;
    captureCtx = captureCanvas.getContext('2d');

    localStoreCanvas.width = hiddenVideo.videoWidth;
    localStoreCanvas.height = hiddenVideo.videoHeight;

    
    // outputContainer.initializeSize();
    
    // outputContainer.hiddenVideo.play();
    // outputContainer.hiddenVideo.pause();


    // storeCanvas = document.createElement('canvas');
    // storeCanvas.width = outputContainer.video.width;
    // storeCanvas.height = outputContainer.video.height;
    // storeCtx = storeCanvas.getContext('2d', { willReadFrequently: true });

    
    
};

async function saveCSV (array, filename) {
    // (A) ARRAY OF DATA

    // (B) ARRAY TO CSV STRING
    var csv = "";
    for (let row of array) {
        try {
            for (let col of row) { csv += col + ","; }
        } catch (error) {
            csv += row + ',';
            // console.log(error)
        }
        
        csv += "\r\n";
    }

    // (C) CREATE BLOB OBJECT
    var myBlob = new Blob([csv], {type: "text/csv"});

    // (D) FILE HANDLER & FILE STREAM
    const fileHandle = await window.showSaveFilePicker({
        suggestedName : filename,
        types: [{
            description: "CSV file",
            accept: {"text/csv": [".csv"]}
        }]
    });
    const fileStream = await fileHandle.createWritable();

    // (E) WRITE FILE
    await fileStream.write(myBlob);
    await fileStream.close();
}
// async function saveOutput(){
//     btnProcess.textContent = 'Saving';
//     btnProcess.disabled = true;
//     saveCSV(delayTimes, 'delay-time.csv');
//     await videoEncoder.compile(false, async (vidBlob)=>{
//         // blobToBase64(vidBlob).then(url=>{
//         //     let a = document.createElement("a");
//         //     a.href = url;
//         //     a.download = vidName.split('.')[0] + '_VFF.webm';
//         //     document.body.appendChild(a);
//         //     a.click();
//         // })

//         // let downloadURL = URL.createObjectURL(vidBlob);
//         // let a = document.createElement("a");
//         // a.href = downloadURL;
//         // a.download = vidName.split('.')[0] + '_VFF.webm';
//         // document.body.appendChild(a);
//         // a.click();
//         // URL.revokeObjectURL(downloadURL);
//         videoEncoder = new Whammy.Video(fps);
//         btnProcess.textContent = 'Save Output';
//         btnProcess.disabled = false;
//         const fileHandle = await window.showSaveFilePicker({
//             suggestedName : vidName.split('.')[0] + '_VFF',
//             types: [{
//                 description: "WEBM file",
//                 accept: {"video/webm": [".webm"]}
//             }]
//         });
//         const fileStream = await fileHandle.createWritable();
    
//         // (E) WRITE FILE
//         await fileStream.write(vidBlob);
//         await fileStream.close();
//     });
// }

async function saveOutput(){
    btnProcess.textContent = 'Saving';
    btnProcess.disabled = true;
    saveCSV(delayTimes, 'delay-time.csv');
    videoEncoder = new Whammy.Video(fps);
    const allAppendPromises = outputContainer.listImage.map(nameImg=>{
        return new Promise((resolve)=>{
            ldb.get(nameImg, (blob)=>{
                blobToBase64(blob).then(url=>{
                    videoEncoder.add(url);
                    resolve();
                })
            });     
        })
    })
    await Promise.all(allAppendPromises);
    await videoEncoder.compile(false, async (vidBlob)=>{
        // blobToBase64(vidBlob).then(url=>{
        //     let a = document.createElement("a");
        //     a.href = url;
        //     a.download = vidName.split('.')[0] + '_VFF.webm';
        //     document.body.appendChild(a);
        //     a.click();
        // })

        // let downloadURL = URL.createObjectURL(vidBlob);
        // let a = document.createElement("a");
        // a.href = downloadURL;
        // a.download = vidName.split('.')[0] + '_VFF.webm';
        // document.body.appendChild(a);
        // a.click();
        // URL.revokeObjectURL(downloadURL);
        btnProcess.textContent = 'Save Output';
        btnProcess.disabled = false;
        const fileHandle = await window.showSaveFilePicker({
            suggestedName : vidName.split('.')[0] + '_VFF',
            types: [{
                description: "WEBM file",
                accept: {"video/webm": [".webm"]}
            }]
        });
        const fileStream = await fileHandle.createWritable();
    
        // (E) WRITE FILE
        await fileStream.write(vidBlob);
        await fileStream.close();
    });
}

function analystOutput(){
    console.log('num_cookie:', buffer.countCookie, '=> fps:', buffer.countCookie/hiddenVideo.currentTime);
    sum = 0;
    min = Infinity;
    max = 0;
    delayTimes.forEach(x=>{
        sum += x;
        min = Math.min(min, x);
        max = Math.max(max, x);
    })
    console.log('DelayTimes:\tmean:', sum/delayTimes.length, '\tmin:', min, '\tmax:', max);
}

hiddenVideo.addEventListener('ended', async ()=>{
    btnProcess.click();
    // btnProcess.disabled = true;
    btnProcess.textContent = 'Save Output';
    btnProcess.onclick = saveOutput;

    while(buffer.idPoint > 0){
        await buffer.Expired();
    }
    outputContainer.fcUpdateVideoDuration();
    analystOutput();

})

var btnProcess = document.getElementById('play-process');
btnProcess.textContent = 'Start';
var frameCapture;
btnProcess.onclick = ()=>{
    if (btnProcess.textContent === 'Start'){
        btnProcess.textContent = 'Pause';
        frameCapture = setInterval(async () => {     
            // let currTime = hiddenVideo.currentTime;
            inputContainer.numFrames += 1;
            inputContainer.lenVideo = Math.floor(hiddenVideo.currentTime * fps);
            inputContainer.fcUpdateVideoDuration();
            captureCtx.drawImage(hiddenVideo, 0, 0, captureCanvas.width, captureCanvas.height);
            tensor = await tf.browser.fromPixels(captureCanvas);
            // inputContainer.listImage.push(tensor);
            buffer.CookieFrame(tensor);
            buffer.UpServer();
            if (buffer.idPoint >= buffer.idMaxPoint){
                buffer.Expired();
                outputContainer.fcUpdateVideoDuration();
            }
            

            // if (outputContainer.listImage.length >= idStartSegment + lengthSegment){
            //     let startTimeStore = Date.now();
            //     storeOutput()
            //     let endTimeStore = Date.now();
            //     console.log("Time Store: "+ endTimeStore - startTimeStore + " miliseconds");
            //     idStartSegment += lengthSegment;
            //     isFirstSegment = false;
            // }
        }, 1000/fps);
        hiddenVideo.play();
    }
    else{
        btnProcess.textContent = 'Start';
        clearInterval(frameCapture);
        hiddenVideo.pause();
        // while(buffer.idPoint > 0 && btnProcess.textContent==='Start'){
        //     buffer.Expired();
        // }
        // outputContainer.fcUpdateVideoDuration();
    }
}





// function storeOutput(){
//     const idEndSegment = Math.min(outputContainer.listImage.length, idStartSegment + lengthSegment);
//     var listURL = outputContainer.listImage.slice(idStartSegment, idEndSegment).forEach(element => {
//         storeCtx.putImageData(element, 0, 0);
//         return storeCanvas.toDataURL('image/webp', quality=1);
//     });
//     if (isFirstSegment == true){
//         var storeSegmentVideo = Whammy.fromImageArray(listURL, fps);
//         console.log(storeSegmentVideo);
//     }
// }



document.addEventListener('DOMContentLoaded', () => {
    if (!('pictureInPictureEnabled' in document)) {
        inputContainer.pipButton.classList.add('hidden');
    }
});