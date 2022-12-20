const MODEL_LSTM_URL = 'https://19521178.github.io/jsFFNet/server/model_lstm/model.json';
const MODEL_MOBILE_URL = 'https://19521178.github.io/jsFFNet/server/model_mobile/model.json';
var MOBILENET;
var LSTMNET;
var pre_h = tf.zeros([1, 256], tf.float32);
var pre_c = tf.zeros([1, 256], tf.float32);

// var actions = [];

async function loadMobileNet(){
    try {
        MOBILENET = await tf.loadGraphModel(MODEL_MOBILE_URL);
        console.log(MOBILENET.predict(tf.randomNormal([1, 224, 224, 3])));
        alert('Models loaded');
        uploadButton.disabled = false;
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


tf.ready().then(loadMobileNet()).then(loadLSTMNet());

const RESIZE_SIZE = 256;
const CROP_SIZE = 224;
const START_CROP = (RESIZE_SIZE-CROP_SIZE)/2;
const IS_ALIGN_CORNERS = false;
const IS_HALF_PIXEL_CENTERS = true;
// const END_CROP = START_CROP + CROP_SIZE;
function preprocess(img){
    let biggerDim = (img.shape[0]>img.shape[1]) ? 0 : 1;
    let biggerDimScale = img.shape[biggerDim] / img.shape[1 - biggerDim]

    let resizeShape = [img.shape[0], img.shape[1]];
    resizeShape[biggerDim] = Math.floor(biggerDimScale * RESIZE_SIZE);
    resizeShape[1-biggerDim] = RESIZE_SIZE;
    let resizeImg = tf.image.resizeBilinear(img, resizeShape, IS_ALIGN_CORNERS, IS_HALF_PIXEL_CENTERS);

    // slice and resize the image
    let cropStart = [START_CROP, START_CROP, 0];
    let cropSize = [CROP_SIZE, CROP_SIZE, 3];
    cropStart[biggerDim] = Math.floor((resizeShape[biggerDim] - CROP_SIZE)/2);
    
    let cropImg = resizeImg.slice(cropStart, cropSize);

    let normalImg = cropImg.div(tf.scalar(255)).sub([0.485, 0.456, 0.406]).div([0.229, 0.224, 0.225]);

    // output = tf.cast(output, dtype='float32');

    let output = normalImg.expandDims(0);
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
    minAction : 3,
    windowSize: 0,
    stepSelect: 1,
    windowSizeSkip: 2,
    stepSelectSkip: 3,
    threshold: 20
}

function range(start, end, step=1){
    const arrayLength = Math.floor(((end - start) / step)) + 1;
    return [...Array(arrayLength).keys()].map(x => (x * step) + start);
}

function extendBothFormula(action){
    if (action>ppArgs.threshold){  //if skip-action
        // if (ppArgs.windowSizeSkip>0){   
            // Ex: windowSizeSkip=3, stepSelectSkip=2 => [-6, -4, -2, 0, 2, 4, 6]
            return range(
                -ppArgs.windowSizeSkip*ppArgs.stepSelectSkip, 
                ppArgs.windowSizeSkip*ppArgs.stepSelectSkip+1, 
                ppArgs.stepSelectSkip
            );
        // }
    }
    else{   //if focus-action
        let actionNeighbors = range(-ppArgs.windowSize, ppArgs.windowSize, ppArgs.stepSelect);
        if (action <= ppArgs.minAction){  //if action<=minaction expend more neighbor of first element
            let resultSet = new Set(actionNeighbors);
            for (let midAction = -ppArgs.minAction+1; midAction<0; midAction++){
                for (let idNeighbor = midAction - ppArgs.windowSize * ppArgs.stepSelect;
                    idNeighbor <= midAction + ppArgs.windowSize * ppArgs.stepSelect;
                    idNeighbor+=ppArgs.stepSelect){
                    resultSet.add(idNeighbor);
                }
            }
            return Array.from(resultSet);
        }
        else{
            return actionNeighbors;
        }
    } 
}

function handlerAction(probs, buffer){
    // probs shape [1, 25] so need squeeze to shape [25] in order to can argmax,
    // .dataSync()[0] to convert integer GPU to CPU
    let action = tf.tidy(()=>{
        return tf.argMax(tf.squeeze(probs, 0)).dataSync()[0] + 1;
    }) 
    action = (action<ppArgs.minAction)?(ppArgs.minAction):action;
    // actions.push(action);

    // Define which neighbor will be selected, Ex: output [-4, -2, 0, 2, 4]
    const indicesNeighbor = extendBothFormula(action);
    // console.log(action, indicesNeighbor);
    probs.dispose();
    // label to buffer
    buffer.LabelFrames(action, indicesNeighbor);
}