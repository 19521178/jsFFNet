
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

var buffer = new Buffer(length=240, idMaxPoint=180, savedFrames=outputContainer.listImage);

// var videoEncoder = new Whammy.Video(fps);
// var lengthSegment = fps * 30;
// var isFirstSegment = true;
// var idStartSegment = 0;

var captureCanvas = document.getElementById('capture-canvas');
var captureCtx;
var localStoreCanvas = document.createElement('canvas');
ldb.clear();
// var storeCanvas;
// var storeCtx;

// const { createFFmpeg, fetchFile } = FFmpeg; //error happens here
// const ffmpegInstance = createFFmpeg({
//     corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
//     log: true,
// });


var hiddenVideo = document.getElementById("hidden-video");

var inputTag = document.querySelector("#input-tag");
async function readVideo(files) {
    if (files && files[0]) {
        console.log('ON CHANGE');
        const file = files[0];
        var urlBlob = URL.createObjectURL(file);
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

var btnProcess = document.getElementById('play-process');
var frameCapture;
btnProcess.onclick = ()=>{
    if (btnProcess.textContent === 'Start'){
        btnProcess.textContent = 'Pause';
        frameCapture = setInterval(async () => {     
            // let currTime = hiddenVideo.currentTime;
            inputContainer.lenVideo += 1;
            inputContainer.fcUpdateVideoDuration();
            captureCtx.drawImage(hiddenVideo, 0, 0, captureCanvas.width, captureCanvas.height);
            gl = await tf.browser.fromPixels(captureCanvas);
            // inputContainer.listImage.push(gl);
            buffer.CookieFrame(gl);
            outputContainer.fcUpdateVideoDuration();

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