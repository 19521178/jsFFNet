// import * as tf from '@tensorflow/tfjs';

const MODEL_URL = './model.json';

// For Keras use tf.loadLayersModel().
const model = tf.loadGraphModel(MODEL_URL);


// const cat = document.getElementById('cat');
// model.predict(tf.browser.fromPixels(cat));
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

function extract(){

}

function predict(){

}