import { simd } from "https://unpkg.com/wasm-feature-detect?module";

const SIMDEncoder = async function(settings, listNameImg){
    // settings = {
    //     duration: 5,    //seconds
    //     context: "webgl",
    //     fps: 60,
    //     dimensions: [256, 256], //width, height,
    //     totalFrames: 450
    // };  
    const isOffscreenSupported = (() => {
        if (typeof self.OffscreenCanvas === "undefined") return false;
        try {
          new self.OffscreenCanvas(32, 32).getContext("2d");
          return true;
        } catch (_) {
          return false;
        }
    })();
      
    const wasmSupported = (() => {
        try {
            if (
                typeof WebAssembly === "object" &&
                typeof WebAssembly.instantiate === "function"
            ) {
            const module = new WebAssembly.Module(
                Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
            );
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) {}
        return false;
    })();
    
    async function createWorker() {
        // This worker setup could be better done with esbuild/bundler/etc,
        // or by just putting the sketch code into the worker
        const rendererResp = await fetch("./utils/SIMD-encoder/renderer.js");
        const rendererSrc = (await rendererResp.text());
        const rendererBlob = new Blob([rendererSrc], {
          type: "application/javascript",
        });
        const rendererUrl = URL.createObjectURL(rendererBlob);
        return new Worker(rendererUrl);
        // If you had it all in the renderer.js it would just look like this:
        // return new Worker("./encoder/renderer.js");
    }
    if (!wasmSupported) {
        console.log("No WASM support found; try again with latest Chrome or FireFox");
    }
    if (!isOffscreenSupported) {
        console.log("No support for OffscreenCanvas on this browser");
    }
    const simdSupported = await simd();
    
    const format = "rgba"; // todo: support RGB on windows
    const channels = format === "rgba" ? 4 : 3;
    const convertYUV = true;
    const yuvPointer = true;
    const bitmap = true;
    const frameQueueLimit = 5;
    
    console.log("Loading wasm...");
    let Module = await import(
        simdSupported
          ? "https://mattdesl.github.io/mp4-wasm-encoder/h264/simd/h264-mp4-encoder.js"
          : "https://mattdesl.github.io/mp4-wasm-encoder/h264/no-simd/h264-mp4-encoder.js"
    );
    const hme = await Module.default();
    const encoder = new hme.H264MP4Encoder();
    encoder.FS = hme.FS;
    console.log("Done loading wasm");
    
    console.log("Configuration:");
    console.log("SIMD Support?", simdSupported);
    console.log("JS YUV Conversion:", convertYUV);
    console.log("YUV Pointer Optimization:", yuvPointer);
    console.log("Bitmap Images?", bitmap);
    console.log("Pixel Format:", format);
    
    let currentFrame = 0;
    let totalFrames;
    let _yuv_buffer;
    let encoderStart;
    let renderer;
    


    
    async function startEncoding(callback) {
        renderer = await createWorker();
        const webgl = true;
        console.log("WebGL Pixel Grabber?", webgl);
    
        encoderStart = performance.now();
        console.time("encoder");
    
        const [width, height] = settings.dimensions;
        const { fps } = settings;
        totalFrames = settings.totalFrames;
    
        console.log("Dimensions: %d x %d", width, height);
        console.log("FPS:", fps);
        console.log("Total Frames:", totalFrames);
    
        // Must be a multiple of 2.
        encoder.width = width;
        encoder.height = height;
        encoder.sequential = true;
        encoder.fragmentation = true;
        encoder.quantizationParameter = 10;
        encoder.speed = 10; // adjust to taste
        encoder.frameRate = fps;
        // encoder.groupOfPictures = fps; // adjust to taste
        encoder.debug = false;
        encoder.initialize();
    
        if (convertYUV && yuvPointer) {
            const yuvLen = (width * height * 3) / 2;
            _yuv_buffer = encoder.create_buffer(yuvLen);
        }
    
        renderer.addEventListener("message", ({ data }) => {
            if (typeof data === "string" && data === "finish") {
                finalize(callback);
            } else {
                // console.log('Encoding frame %d / %d', currentFrame + 1, totalFrames);
                console.log(`Encoding frame ${
                    currentFrame + 1
                } / ${totalFrames}`);
                addFrame(data, channels);
                renderer.postMessage("frame");
            }
        });
    
        renderer.postMessage({
            event: "setup",
            settings,
            config: {
                frameQueueLimit,
                format,
                convertYUV,
                bitmap,
                webgl,
            }
        });
        for (let idBlob = 0; idBlob<listNameImg.length; idBlob++){
            ldb.get(listNameImg[idBlob], (blob)=>{
                renderer.postMessage({
                    event: 'upblob',
                    idBlob,
                    blob
                })
            });
        }

    }
    function addFrame(pixels) {
        if (convertYUV) {
          if (yuvPointer) {
            hme.HEAP8.set(pixels, _yuv_buffer);
            encoder.fast_encode_yuv(_yuv_buffer);
          } else {
            encoder.addFrameYuv(pixels);
          }
        } else {
          if (channels === 4) encoder.addFrameRgba(pixels);
          else encoder.addFrameRgb(pixels);
        }
        currentFrame++;
      }
    
    function finalize(callback) {
        encoder.finalize();
        const uint8Array = encoder.FS.readFile(encoder.outputFilename);
        const buf = uint8Array.buffer;

        const time = Math.floor(performance.now() - encoderStart);
        console.timeEnd("encoder");
        callback(buf);
        console.log(`Finished Encoding in ${time} milliseconds`);
        if (convertYUV && yuvPointer) encoder.free_buffer(_yuv_buffer);
        encoder.delete();
    }
    return {startEncoding, renderer, encoder};
}
window.SIMDEncoder = SIMDEncoder;
