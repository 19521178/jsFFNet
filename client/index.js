// import Whammy from ./client/
// import * as tf from '@tensorflow/tfjs'



var fps = 30;

var getImgDataTimes = [];

const inputHiddenVideo = document.createElement('video');
inputHiddenVideo.style.display = 'none';
inputHiddenVideo.muted = true;
const inputContainer = new InputContainer(fps, 'input-video-container', inputHiddenVideo);
if (true) {
    // outputContainer.video.controls = false;
    inputContainer.videoControls.classList.remove('hidden');
}
// const videoWorks = !!document.createElement('video').canPlayType;
// if (videoWorks) {
//     inputContainer.video.controls = false;
//     inputContainer.videoControls.classList.remove('hidden');
// }
const outputHiddenVideo = document.createElement('video');
outputHiddenVideo.style.display = 'none';
outputHiddenVideo.muted = true;
const outputContainer = new OutputContainer(fps, 'output-video-container');
// const videoWorks = !!document.createElement('video').canPlayType;
if (true) {
    // outputContainer.video.controls = false;
    outputContainer.videoControls.classList.remove('hidden');
}

var buffer = new Buffer(length=120, idMaxPoint=90, savedFrames=outputContainer.listImage);

// var videoEncoder = new Whammy.Video(fps);
// var lengthSegment = fps * 30;
// var isFirstSegment = true;
// var idStartSegment = 0;

// var cap;
var captureCanvas;
var captureCtx;
// var convertURLCanvas;
// var convertURLctx;
// var storeCanvas;
// var storeCtx;

var btnProcess = document.getElementById('play-process');
var frameCapture;
btnProcess.onclick = ()=>{
    if (btnProcess.textContent === 'Start'){
        btnProcess.textContent = 'Pause';
        frameCapture = setInterval(async () => {     
            // await cap.read(srcMat);
            // await cv.imshow(captureCanvas, srcMat);
            captureCtx.drawImage(hiddenVideo, 0, 0, VID_WIDTH, VID_HEIGHT);
            gl = await tf.browser.fromPixels(captureCanvas);
            // inputContainer.listImage.push(gl);
            inputContainer.lenVideo += 1;
            inputContainer.fcUpdateVideoDuration();
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
    }
}


const VID_WIDTH = 400;
const VID_HEIGHT = 320;
var hiddenVideo = document.getElementById("hidden-video");
// var srcMat;
hiddenVideo.height = VID_HEIGHT;
hiddenVideo.width = VID_WIDTH;



const inputTag = document.querySelector("#input-tag");
async function readVideo(event) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        var urlBlob = URL.createObjectURL(file);
        hiddenVideo.src = urlBlob;
        inputHiddenVideo.src = urlBlob;
        await inputHiddenVideo.load();
        await hiddenVideo.load();
        // cap = new cv.VideoCapture(hiddenVideo);
    }
};
inputTag.onchange = readVideo;

hiddenVideo.onloadedmetadata = () => {
    // alert("Video on load");
    hiddenVideo.play();
    hiddenVideo.pause();

    hiddenVideo.clientHeight = VID_HEIGHT;
    hiddenVideo.clientWidth = VID_WIDTH;

    inputHiddenVideo.clientHeight = VID_HEIGHT;
    inputHiddenVideo.clientWidth = VID_WIDTH;

    inputContainer.video.width = VID_WIDTH;
    inputContainer.video.height = VID_HEIGHT;

    outputContainer.video.width = VID_WIDTH;
    outputContainer.video.height = VID_HEIGHT;

    // srcMat  = new cv.Mat(VID_HEIGHT, VID_WIDTH, cv.CV_8UC4);

    captureCanvas = document.createElement('canvas');
    captureCanvas.width = outputContainer.video.width;
    captureCanvas.height = outputContainer.video.height;
    captureCtx = captureCanvas.getContext('2d');


    // storeCanvas = document.createElement('canvas');
    // storeCanvas.width = outputContainer.video.width;
    // storeCanvas.height = outputContainer.video.height;
    // storeCtx = storeCanvas.getContext('2d', { willReadFrequently: true });

    
    
};



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