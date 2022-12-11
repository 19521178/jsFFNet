// import Whammy from ./client/
// import * as tf from '@tensorflow/tfjs'



var fps = 30;

var getImgDataTimes = [];

const inputContainer = new InputContainer();
const videoWorks = !!document.createElement('video').canPlayType;
if (videoWorks) {
    inputContainer.video.controls = false;
    inputContainer.videoControls.classList.remove('hidden');
}

const outputContainer = new OutputContainer(fps);
// const videoWorks = !!document.createElement('video').canPlayType;
if (true) {
    // outputContainer.video.controls = false;
    outputContainer.videoControls.classList.remove('hidden');
}

var buffer = new Buffer(length=120, idMaxPoint=90, savedFrames=outputContainer.listImage);

// var videoEncoder = new Whammy.Video(fps);
var lengthSegment = fps * 30;
var isFirstSegment = true;
var idStartSegment = 0;

var cap;
var captureCanvas;
var captureCtx;
var convertURLCanvas;
var convertURLctx;
var storeCanvas;
var storeCtx;

// Get access to the camera!
// if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     // Not adding `{ audio: true }` since we only want video now
//     navigator.mediaDevices.getUserMedia({audio: false, 
//         video: true
//         // video: {
//         //     mandatory: {
//         //     minWidth: 768,
//         //     minHeight: 768,
//         //     minFrameRate: fps
//         // }}
//     }).then(function(stream) {
//         inputContainer.video.srcObject = stream;
//         // video.src = window.URL.createObjectURL(stream)
//         inputContainer.video.play();
//         inputContainer.video.onloadedmetadata = () => {
//             outputContainer.video.width = inputContainer.video.clientWidth;
//             outputContainer.video.height = inputContainer.video.clientHeight;

//             captureCanvas = document.createElement('canvas');
//             captureCanvas.width = outputContainer.video.width;
//             captureCanvas.height = outputContainer.video.height;
//             captureCtx = captureCanvas.getContext('2d', { willReadFrequently: true });

//             convertURLCanvas = document.createElement('canvas');
//             convertURLCanvas.width = outputContainer.video.width;
//             convertURLCanvas.height = outputContainer.video.height;
//             convertURLctx = convertURLCanvas.getContext('2d', { willReadFrequently: true });

//             captureBlob = setInterval(() => {
//                 if(inputContainer.video.paused || inputContainer.video.currentTime > 5){}
//                 else{
//                     // alert('Thay doi kich thuoc');
//                     // outputContainer.video.width = inputContainer.video.clientWidth;
//                     // outputContainer.video.height = inputContainer.video.clientHeight;
                    
//                     captureCtx.drawImage(inputContainer.video, 0, 0, outputContainer.video.width, outputContainer.video.height);
//                     // imgURL = captureCanvas.toDataURL('image/png');
//                     img = captureCtx.getImageData(0, 0, outputContainer.video.width, outputContainer.video.height);
//                     buffer.CookieFrame(img);
//                     outputContainer.fcUpdateVideoDuration();
//                 }
//             }, 1000/fps);
//         };
        
//         // mediaRecorder = new MediaRecorder(stream);
//         // // let chunks = [];//Cria uma matriz para receber as parte.
//         // mediaRecorder.ondataavailable = (data) => {
//         //     console.log('recorder available');
//         //     // chunks.push(data.data)//Vai adicionando as partes na matriz
//         //     blobing = new Blob(data.data, {type: 'image/png'});
//         //     console.log(num_show_blob, blob);
//         // };
//         // mediaRecorder.onstop = () => {//Quando ativar a função parar a gravação
//         // //Cria o BLOB com as partes acionadas na Matriz
//         //     // const blob = new Blob(chunks, { type: 'audio/wav' });
//         //     // alert('Media Recorder Stopped', blob)
//         // }
//     });
// }

// function updatePlayButton() {
//     this.playbackIcons.forEach((icon) => icon.classList.toggle('hidden'));

//     if (this.isPlaying) {
//         this.playButton.setAttribute('data-title', 'Play (k)');
//     } else {
//         this.playButton.setAttribute('data-title', 'Pause (k)');
//     }
// }
var btnProcess = document.getElementById('play-process');
var frameCapture;
btnProcess.onclick = ()=>{
    if (btnProcess.textContent === 'Start'){
        btnProcess.textContent = 'Pause';
        frameCapture = setInterval(async () => {     
            await cap.read(srcMat);
            await cv.imshow(captureCanvas, srcMat);
            gl = await tf.browser.fromPixels(captureCanvas);
            outputContainer.listImage.push(gl);
            // buffer.CookieFrame(gl);
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
    }
    else{
        btnProcess.textContent = 'Start';
        clearInterval(frameCapture);
    }
}


const VID_WIDTH = 400;
const VID_HEIGHT = 320;
var hiddenVideo = document.getElementById("hidden-video");
var srcMat;
var dstMat;
hiddenVideo.height = VID_HEIGHT;
hiddenVideo.width = VID_WIDTH;



const inputTag = document.querySelector("#input-tag");
async function readVideo(event) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        var urlBlob = URL.createObjectURL(file);
        hiddenVideo.src = urlBlob;
        await hiddenVideo.load();
        cap = new cv.VideoCapture(hiddenVideo);
    }
};
inputTag.onchange = readVideo;

hiddenVideo.onloadedmetadata = () => {
    // alert("Video on load");
    hiddenVideo.play();
    hiddenVideo.pause();

    hiddenVideo.clientHeight = VID_HEIGHT;
    hiddenVideo.clientWidth = VID_WIDTH;

    inputContainer.video.width = VID_WIDTH;
    inputContainer.video.height = VID_HEIGHT;

    outputContainer.video.width = VID_WIDTH;
    outputContainer.video.height = VID_HEIGHT;

    srcMat  = new cv.Mat(VID_HEIGHT, VID_WIDTH, cv.CV_8UC4);
    dstMat = new cv.Mat(VID_HEIGHT, VID_WIDTH, cv.CV_8UC4);

    captureCanvas = document.createElement('canvas');
    captureCanvas.width = outputContainer.video.width;
    captureCanvas.height = outputContainer.video.height;
    captureCtx = captureCanvas.getContext('2d', { willReadFrequently: true });

    convertURLCanvas = document.createElement('canvas');
    convertURLCanvas.width = outputContainer.video.width;
    convertURLCanvas.height = outputContainer.video.height;
    convertURLctx = convertURLCanvas.getContext('2d', { willReadFrequently: true });

    storeCanvas = document.createElement('canvas');
    storeCanvas.width = outputContainer.video.width;
    storeCanvas.height = outputContainer.video.height;
    storeCtx = storeCanvas.getContext('2d', { willReadFrequently: true });

    
    
};



function storeOutput(){
    const idEndSegment = Math.min(outputContainer.listImage.length, idStartSegment + lengthSegment);
    var listURL = outputContainer.listImage.slice(idStartSegment, idEndSegment).forEach(element => {
        storeCtx.putImageData(element, 0, 0);
        return storeCanvas.toDataURL('image/webp', quality=1);
    });
    if (isFirstSegment == true){
        var storeSegmentVideo = Whammy.fromImageArray(listURL, fps);
        console.log(storeSegmentVideo);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    if (!('pictureInPictureEnabled' in document)) {
        inputContainer.pipButton.classList.add('hidden');
    }
});