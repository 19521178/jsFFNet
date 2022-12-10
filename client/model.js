// import * as tf from '@tensorflow/tfjs';

const MODEL_LSTM_URL = 'https://19521178.github.io/jsFFNet/server/model_lstm/model.json';
const MODEL_MOBILE_URL = 'https://19521178.github.io/jsFFNet/server/model_mobile/model.json';
var pre_h = tf.zeros([1, 256], tf.float32);
var pre_c = tf.zeros([1, 256], tf.float32);
var test_results;
// For Keras use tf.loadLayersModel().
async function loadMobileNet(){
    try {
        MOBILENET = await tf.loadGraphModel(MODEL_MOBILE_URL);
        console.log(MOBILENET.predict(tf.randomNormal([1, 224, 224, 3])));
        // return model;
    } catch (err) {
        console.log(err);
        console.log("failed load model");
    }
}
async function loadLSTMNet(){
    try {
        LSTMNET = await tf.loadGraphModel(MODEL_LSTM_URL);
        console.log(LSTMNET.executeAsync([pre_h, pre_c, tf.randomNormal([1, 960], tf.float32)]));
        // model.predict();
        // return model;
    } catch (err) {
        console.log(err);
        console.log("failed load model");
    }
}
var MOBILENET;
var LSTMNET;

tf.ready().then(loadMobileNet()).then(loadLSTMNet());

const RESIZE_SIZE = 256;
const CROP_SIZE = 224;
const START_CROP = (RESIZE_SIZE-CROP_SIZE)/2;
// const END_CROP = START_CROP + CROP_SIZE;
function preprocess(img){
    var resizeImg = tf.image.resizeBilinear(img, [RESIZE_SIZE, RESIZE_SIZE]);
    // slice and resize the image
    var cropImg = resizeImg.slice(
        [START_CROP, START_CROP, 0],
        [CROP_SIZE, CROP_SIZE, 3]
    );

    var normalImg = cropImg.div(tf.scalar(255)).sub([0.485, 0.456, 0.406]).div([0.229, 0.224, 0.225]);

    // output = tf.cast(output, dtype='float32');

    var output = normalImg.expandDims(0);
    normalImg.dispose();
    cropImg.dispose();
    resizeImg.dispose();
    return output;
}

function extract(inputTensor){
    return MOBILENET.predict(inputTensor);
}

function predict(feat, buffer){
    LSTMNET.executeAsync([pre_h, pre_c, feat])
        .then((results)=>{
            test_results = results;
            handlerAction(results[0], buffer);
            
            pre_c.dispose();
            pre_c = results[1];
            pre_h.dispose();
            pre_h = results[2];
        })

    feat.dispose();
}

var ppArgs = {
    windowSize: 0,
    stepSelect: 1,
    windowSizeSkip: 4,
    stepSelectSkip: 3,
    threshold: 15
}

function range(start, end, step=1){
    const arrayLength = Math.floor(((end - start) / step)) + 1;
    return [...Array(arrayLength).keys()].map(x => (x * step) + start);
}

function extendBothFormula(action){
    if (action>=ppArgs.threshold){
        if (ppArgs.windowSizeSkip<0){
            return range(-ppArgs.windowSizeSkip*ppArgs.stepSelectSkip, ppArgs.windowSizeSkip*ppArgs.stepSelectSkip+1, ppArgs.stepSelectSkip);
        }
        else{
            return range(-ppArgs.windowSize, ppArgs.windowSize+1, 1)
        }
    }
}

function handlerAction(probs, buffer){
    console.log(probs);
    action = tf.argMax(tf.squeeze(probs, 0)).dataSync()[0];
    const indicesNeighbor = extendBothFormula(action);
    buffer.LabelFrames(action, indicesNeighbor);
}