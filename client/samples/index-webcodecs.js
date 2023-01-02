// import {getWebGLRenderingContext} from "./utils/gl/gl-util";
var fps = 30;

var getImgDataTimes = [];


var inputContainer = new InputContainer(fps, 'input-video-container');
inputContainer.hiddenVideo.muted = true;
inputContainer.videoControls.classList.remove('hidden');

var outputContainer = new OutputContainer(fps, 'output-video-container');
outputContainer.videoControls.classList.remove('hidden');

const LENGTH_BUFFER = 300;
const ID_MAX_POINT_BUFFER = 90;
var buffer = new BufferFrame(length=LENGTH_BUFFER, idMaxPoint=ID_MAX_POINT_BUFFER, savedFrames=outputContainer.listImage);

var videoEncoder;
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
    // (A) ARRAY TO CSV STRING
    try {
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

        // (B) CREATE BLOB OBJECT
        var myBlob = new Blob([csv], {type: "text/csv"});

        // (C) FILE HANDLER & FILE STREAM
        const fileHandle = await window.showSaveFilePicker({
            suggestedName : filename,
            types: [{
                description: "CSV file",
                accept: {"text/csv": [".csv"]}
            }]
        });
        const fileStream = await fileHandle.createWritable();

        // (D) WRITE FILE
        await fileStream.write(myBlob);
        await fileStream.close();
    } catch (error) {
        console.log(error.message);
        if (error.message !== 'The user aborted a request.'){
            console.log('Changing type of save file: .csv -> .txt');
            saveStr = array.join('\n');
            let a = document.createElement('a');
            let urlText = URL.createObjectURL(new Blob([saveStr]), {type: "text/plain"});
            a.href = urlText;
            a.download = filename + '.txt';
            a.click();
            URL.revokeObjectURL(urlText);
        }
    }
    
}

async function saveOutput(){
    var saveOutputStartTime = Date.now();
    btnProcess.textContent = 'Saving';
    btnProcess.disabled = true;
    saveCSV(delayTimes, 'delay-time');
    // videoEncoder = new Whammy.Video(fps, outputQuality);
    const saveOutputCanvas = document.createElement('canvas');
    const saveOutputCtx = saveOutputCanvas.getContext('2d');
    saveOutputCanvas.width = localStoreCanvas.width;
    saveOutputCanvas.height = localStoreCanvas.height;
    const width = localStoreCanvas.width;
    const height = localStoreCanvas.height;
    var saveOutputImg = new Image();
    const blob2ImageBitmap = blob=>{
        saveOutputImg.src = URL.createObjectURL(blob);
        return new Promise(resolve => {
            saveOutputImg.onload = async (event) => {
                URL.revokeObjectURL(event.target.src);
                await saveOutputCtx.drawImage(saveOutputImg, 0, 0);
                const bitmap = await createImageBitmap(saveOutputCanvas);
                // const bitmap = await createImageBitmap(saveOutputImg);
                resolve(bitmap);
            };
        });
    }


    videoEncoder = await createEncoder(width, height, fps);
    for (let i=0; i<outputContainer.listImage.length; i++){
        let timestamp = 1 / fps * i;
        let keyframe = i % 20 === 0;
        let nameImg = outputContainer.listImage[i];
        appendPromise = new Promise((resolve)=>{
            ldb.get(nameImg, (blob)=>{
                blob2ImageBitmap(blob).then(async (bitmap)=>{
                    videoEncoder.addFrame(bitmap, keyframe, timestamp);
                    if ((i + 1) % 10 === 0) {
                        await videoEncoder.flush()
                    }
                    console.log('Add', nameImg, 'done');
                    resolve();
                })
            });    
        })
        await appendPromise;
    }
    console.log('SAVING OUTPUT: Add images successfully');

    const endAddImages = new Promise(async (resolve) => {
        await videoEncoder.flush()
        const buf = await videoEncoder.end();
        console.log(buf);
        console.log('SAVING OUTPUT: Compiled')
        const blob = new Blob([buf], { type: "video/mp4" });
        console.log(blob);
        console.log("Saving output time:", Date.now() - saveOutputStartTime);
        resolve(blob);
    });
    endAddImages.then(async (vidBlob)=>{
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName : vidName.split('.')[0] + '_VFF',
                types: [{
                    description: "MP4 file",
                    accept: {"video/mp4": [".mp4"]}
                }]
            });
            const fileStream = await fileHandle.createWritable();
        
            await fileStream.write(vidBlob);
            await fileStream.close();
        } catch (error) {
            console.log(error);
            if (error.message !== 'The user aborted a request.'){
                console.log('DOWNLOADING DIRECTLY TO LOCAL');
                let downloadURL = URL.createObjectURL(vidBlob);
                let a = document.createElement("a");
                a.href = downloadURL;
                a.download = vidName.split('.')[0] + '_VFF.mp4';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(downloadURL);
                document.body.removeChild(a);
            }
            
        }
        

        
        btnProcess.textContent = 'Save Output';
        btnProcess.disabled = false;
    })
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
            while((buffer.numMissExpired>0) && (buffer.idLastProccessed > buffer.idMaxPoint/2)){
                buffer.Expired();
                buffer.numMissExpired -= 1;
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

var btnBackPage = document.getElementById('back-page');
btnBackPage.onclick = ()=>{
    // refresh outputContainer
    outputContainer = new OutputContainer(fps, 'output-video-container');
    outputContainer.videoControls.classList.remove('hidden');
    outputContainer.fcUpdateVideoDuration();
    outputContainer.fcUpdateTimeElapsed();
    outputContainer.fcUpdatePlayButton();
    outputContainer.fcUpdateProgress();
    outputContainer.videoCtx.clearRect(0, 0, outputContainer.video.width, outputContainer.video.height);


    // refresh inputContainer
    inputContainer = new InputContainer(fps, 'input-video-container');
    inputContainer.hiddenVideo.muted = true;
    inputContainer.videoControls.classList.remove('hidden');
    inputContainer.fcUpdateVideoDuration();
    inputContainer.fcUpdateTimeElapsed();
    inputContainer.fcUpdatePlayButton();
    inputContainer.fcUpdateProgress();
    inputContainer.videoCtx.clearRect(0, 0, inputContainer.video.width, inputContainer.video.height);

    // refresh buffer
    delete buffer;
    buffer = new BufferFrame(length=LENGTH_BUFFER, idMaxPoint=ID_MAX_POINT_BUFFER, savedFrames=outputContainer.listImage);

    // refresh indexedDB
    ldb.clear();

    // refresh pre_c, pre_h
    pre_h = tf.zeros([1, 256], tf.float32);
    pre_c = tf.zeros([1, 256], tf.float32);

    // hidden main-div
    mainDiv.style.display = "none";
	uploadDiv.style.display = "flex";
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