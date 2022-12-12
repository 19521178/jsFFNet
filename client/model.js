const MODEL_LSTM_URL = 'https://19521178.github.io/jsFFNet/server/model_lstm/model.json';
const MODEL_MOBILE_URL = 'https://19521178.github.io/jsFFNet/server/model_mobile/model.json';
var MOBILENET;
var LSTMNET;
var pre_h = tf.zeros([1, 256], tf.float32);
var pre_c = tf.zeros([1, 256], tf.float32);

async function loadMobileNet(){
    try {
        MOBILENET = await tf.loadGraphModel(MODEL_MOBILE_URL);
        //warm-up model
        console.log(await MOBILENET.predict(tf.randomNormal([1, 224, 224, 3])));
        alert('MobileNet loaded successfully')
    } catch (err) {
        console.log(err);
        console.log("failed load model");
    }
}
async function loadLSTMNet(){
    try {
        LSTMNET = await tf.loadGraphModel(MODEL_LSTM_URL);
        //warm-up model
        // LSTM has dynamic exit Exit_4 so need executeAsync
        console.log(LSTMNET.executeAsync([pre_h, pre_c, tf.randomNormal([1, 960], tf.float32)]));
    } catch (err) {
        console.log(err);
        console.log("failed load model");
    }
}


// Load-models-promise returned when function model.predict be called, so need warm-up immediately after tf.loadGraphModel
tf.ready().then(loadMobileNet()).then(loadLSTMNet());

const RESIZE_SIZE = 256;
const CROP_SIZE = 224;
const START_CROP = (RESIZE_SIZE-CROP_SIZE)/2;
function preprocess(img){
    // resize img, output: {uint8, shape=[resizeSize, resizeSize, 3]}
    var resizeImg = tf.image.resizeBilinear(img, [RESIZE_SIZE, RESIZE_SIZE]);
    // cop img, output: {uint8, shape=[cropSize, cropSize, 3]}
    var cropImg = resizeImg.slice(
        [START_CROP, START_CROP, 0],
        [CROP_SIZE, CROP_SIZE, 3]
    );

    // scale img to float32 (0, 1) then normalize by standard mean, dst of ImageNet
    var normalImg = cropImg.div(tf.scalar(255)).sub([0.485, 0.456, 0.406]).div([0.229, 0.224, 0.225]);

    // to shape [1, cropSize, cropSize, 3]
    var output = normalImg.expandDims(0);

    // release memory of not-used-anymore variable in this preprocess-func
    // var img still used for render tasks
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
            //results includes [probs, c, h]
            handlerAction(results[0], buffer);

            // release GPU memory for previous variabile cuz only need store previous-info of current frame
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
    if (action>=ppArgs.threshold){  //if skip-action
        // if (ppArgs.windowSizeSkip>0){   
            // Ex: windowSizeSkip=3, stepSelectSkip=2 => [-6, -4, -2, 0, 2, 4, 6]
            return range(-ppArgs.windowSizeSkip*ppArgs.stepSelectSkip, ppArgs.windowSizeSkip*ppArgs.stepSelectSkip+1, ppArgs.stepSelectSkip);
        // }
    }
    else{   //if focus-action
        return range(-ppArgs.windowSize, ppArgs.windowSize+1, 1)    // Ex: windowSize=3 => [-3, -2, -1, 0, 1, 2, 3]
    }
}

function handlerAction(probs, buffer){
    // probs shape [1, 25] so need squeeze to shape [25] in order to can argmax,
    // .dataSync()[0] to convert integer GPU to CPU
    action = tf.argMax(tf.squeeze(probs, 0)).dataSync()[0] + 1;

    // Define which neighbor will be selected, Ex: output [-4, -2, 0, 2, 4]
    const indicesNeighbor = extendBothFormula(action);

    // label to buffer
    buffer.LabelFrames(action, indicesNeighbor);
}