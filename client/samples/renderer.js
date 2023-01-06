// one worker which steps forward, renders frames,
// and pushes RGB or RGBA into a (limited size) queue of buffers

const isDocument =
  typeof window !== "undefined" && typeof window.document !== "undefined";
// console.log("Doccument available:", isDocument);
// console.log(indexedDB);

const context2DAttributes = {
  antialias: true,
  alpha: false,
  desynchronized: true,
  powerPreference: "high-performance",
  willReadFrequently: true // not sure about this as it will force software
};

const dictBlob = {};
const Dictionary = ()=>{
  let _idPop = 0;
  let _length = 0;
  const dict = {};
  const _keyToString = (key)=>{
    if (typeof(key) !== 'string'){
      return key.toString();
    }
    return key;
  }
  const add = (key, value)=>{
    const _key = _keyToString(key);
    if (dict[_key]===undefined) _length++;
    dict[_key] = value;
  }
  const del = (key)=>{
    const _key = _keyToString(key);
    if (dict[_key]!==undefined){
      delete dict[_key];
      _length--;
    }
  }
  const deleteAll = ()=>{
    delete dict;
    _length = 0;
  }
  const get = (key)=>{
    const _key = _keyToString(key);
    return dict[_key];
  }
  const pop = ()=>{
    const _key = _idPop.toString();
    const value = dict[_key];
    del(_key);
    if (value !== undefined) _idPop++;
    return {
      idPop: _idPop-1,
      value
    };
  }
  const getLength = ()=>{
    return _length;
  }

  return {
    dict,
    add,
    del,
    deleteAll,
    get,
    pop,
    getLength
  }
}

const isOffscreenSupported = (() => {
  if (typeof self.OffscreenCanvas === "undefined") return false;
  try {
    new self.OffscreenCanvas(32, 32).getContext("2d");
    return true;
  } catch (_) {
    return false;
  }
})();

async function setupHandler ({ data }) {
    self.removeEventListener('message', setupHandler)
    if (data.event === 'setup') {
      console.log('Starting renderer...');
      console.log('Parameters:', data.settings, data.listNameImg);
      await start(data.settings, data.config);
    }
};

self.addEventListener("message", setupHandler);

function createCanvas(

  contextName = "2d",
  width = 300,
  height = 150,
  { attributes = {}, offscreen = true } = {}
) {
  if (!isOffscreenSupported) offscreen = false;
  if (offscreen || (isOffscreenSupported && !isDocument)) {
    try {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext(contextName, attributes);
      return { canvas, context };
    } catch (err) {
      return createRegularCanvas(contextName, width, height, attributes);
    }
  } else {
    return createRegularCanvas(contextName, width, height, attributes);
  }

  function createRegularCanvas(contextName, width, height, attributes) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext(contextName, attributes);
    canvas.width = width;
    canvas.height = height;
    return { canvas, context };
  }
}

function pixelGrabber(context, opts = {}) {
  const canvas = context.canvas;
  const {
    direct = false,
    sharedBuffer = false,
    format = "rgba",
    webgl: useGL = true,
    bitmap: useBitmap = true,
  } = opts;
  const { width, height } = canvas;
  console.log(width, height);

  const usingBitmap =
    useBitmap && useGL && typeof canvas.transferToImageBitmap === "function";

  let gl, glFormat, glInternalFormat;
  if (useGL && !direct) {
    const { canvas: webgl, context: _gl } = createCanvas(
      "webgl",
      128,
      128,
      {
        offscreen: true,
        attributes: {
          alpha: false,
          desynchronized: true,
          antialias: false,
          depth: false,
          powerPreference: "high-performance",
          stencil: false,
          willReadFrequently: true // not sure about this as it will force software
        },
      }
    );
    gl = _gl;
    const texture = gl.createTexture();
    glFormat = format === "rgba" ? gl.RGBA : gl.RGB;
    glInternalFormat = glFormat;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(
      gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
      gl.BROWSER_DEFAULT_WEBGL
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
  } else if (direct && useGL) {
    gl = context;
    glFormat = format === "rgba" ? gl.RGBA : gl.RGB;
    glInternalFormat = glFormat;
  }

  const channels = format === "rgb" && useGL ? 3 : 4;
  const bufferSize = width * height * channels;
  let buffer;
  if (sharedBuffer) {
    buffer = new Uint8Array(bufferSize);
  }

  let sharedCanvas;
  let sharedContext;

  return {
    buffer,
    bufferSize,
    channels,
    read(idRender) {
      // console.log('WW-Reader.read()');
      if (direct && useGL) {
        // console.log('WW-IF DIRECT & USEGL');
        const buf = sharedBuffer ? buffer : new Uint8Array(bufferSize);
        gl.readPixels(0, 0, width, height, glFormat, gl.UNSIGNED_BYTE, buf);
        return buf;
      } else if (useGL) {
        // console.log('WW-IF ONLY USEGL');
        const buf = sharedBuffer ? buffer : new Uint8Array(bufferSize);
        let input;
        if (usingBitmap) {
          console.log('WW-IF USING BITMAP', idRender);
          input = canvas.transferToImageBitmap();
          // input = dictBlob[idFrame.toString()];
        } else {
          // console.log('WW-IF NOT USING BITMAP');
          input = canvas;
        }
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          glInternalFormat,
          glFormat,
          gl.UNSIGNED_BYTE,
          input
        );
        gl.readPixels(0, 0, width, height, glFormat, gl.UNSIGNED_BYTE, buf);
        if (usingBitmap) input.close();
        return buf;
      } else {
        if (typeof context.getImageData === 'function') {
          return context.getImageData(0, 0, width, height).data;
        } else {
          if (!sharedCanvas) {
            let result = createCanvas('2d', width, height, {
              offscreen: true,
              attributes: { ...context2DAttributes }
            });
            sharedCanvas = result.canvas;
            sharedContext = result.context;
          }
          sharedContext.clearRect(0, 0, width, height);
          sharedContext.drawImage(canvas, 0, 0, width, height);
          return sharedContext.getImageData(0, 0, width, height).data;
        }
      }
    },
  };
}

async function start(settings, config) {
  // console.log('WW-start');
  const [width, height] = settings.dimensions;
  const { fps, duration } = settings;
  const { format = "rgba", webgl, bitmap, convertYUV = false, frameQueueLimit = 5 } = config;
  const totalFrames = settings.totalFrames;
  let contextName = '2d';
  const { canvas, context } = createCanvas(contextName, width, height, {
    offscreen: true,
    attributes: { ...context2DAttributes },
  });

  // const render = sketch(props);
  const render = ((canvas, context)=>{
    const next = (idRender)=>{
      return new Promise((resolve)=>{
        const blob = dictBlob[idRender.toString()];
        if (!blob){
          resolve('delay');
        }
        else{
          createImageBitmap(blob).then(async (bitmap)=>{
            delete dictBlob[idRender.toString()];
            await context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const stride = reader.channels;
            const buffer = reader.read(idRender);
            if (convertYUV) {
              resolve(RGB2YUV420p(buffer, width, height, stride));
            } else{
              resolve(buffer);
            }
          })
        }
      })
    }
    // const next = (idRender)=>{
    //   const blob = dictBlob[idRender.toString()];
    //   if (!blob){
    //     return false;
    //   };
    //   createImageBitmap(blob).then((bitmap)=>{
    //     context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    //   })
    //   return true;
    // };
    return {next};
  })(canvas, context);
  const useDirectWebGL = false; // could work except for Y-flip...
  const isDirectWebGL = useDirectWebGL && contextName !== '2d';

  let idFrame = 0;
  let finished = false;
  const reader = pixelGrabber(context, {
    direct: isDirectWebGL,
    format,
    bitmap,
    webgl,
    sharedBuffer: convertYUV,
  });

  let queue = [];
  let dictFrame = Dictionary();
  self.addEventListener("message", async ({ data }) => {
    if (data === "frame") {
      // if (queue.length === 0) {
      if (dictFrame.getLength() === 0){
        // no queued frames, just render and post one immediately
        postFrame(await nextFrame());
      } else {
        // we have some frames queued, take from start
        // const frame = queue.shift();
        let {idPop, value} = dictFrame.pop();
        if (value ===undefined) value = 'delay';

        postFrame({idCurrFrame: idPop, frame: value});
      }
    }
    else if(data.event === 'upblob'){
      const blob = data.blob;
      const idBlob = data.idBlob;
      console.log('upblob', idBlob);

      dictBlob[idBlob.toString()] = blob;
    }
  });

  // let loop = ()=>{
  //   return new Promise(async (resolve)=>{
  //     console.log('loop add queue');
  //     if (finished){
  //       resolve();
  //       console.log('finish loop add queue');
  //       return;
  //     };
  //     // we have room in our queue
  //     if (queue.length < frameQueueLimit) {
  //       const frame = await nextFrame();
  //       queue.push(frame);
  //       resolve(loop());
  //     }
  //   })
  // }
  // loop();
  // let loop = new Promise(async (resolve)=>{
  //   if (finished) return;
  //   // we have room in our queue
  //   if (queue.length < frameQueueLimit) {
  //     const frame = await nextFrame();
  //     queue.push(frame);
  //     resolve();
  //   }
  // })
  
  const throttle = 0;
  let loop = setInterval(async () => {
    if (finished) return;
    // we have room in our queue
    // if (queue.length < frameQueueLimit) {
    if (dictFrame.getLength() < frameQueueLimit) {
      const data = await nextFrame();

      const {idCurrFrame, frame} = await nextFrame();
      // queue.push(frame);
      dictFrame.add(idCurrFrame, frame);
    }
  }, throttle);

  postFrame(await nextFrame());

  function postFrame(data) {
    const {idCurrFrame, frame} = data;
    console.log('WW - post id', idCurrFrame);
    // console.log('WW-result:', frame);
    if (frame == null) {
      self.postMessage("finish");
    } else if (frame === 'delay'){
      self.postMessage(frame);
    }else {
      self.postMessage(frame, [frame.buffer]);
    }
  }

  async function nextFrame() {
    const idCurrFrame = idFrame;
    if (idFrame >= totalFrames) {
      finished = true;
      clearInterval(loop);
      return {idCurrFrame, frame:null}; // end event
    }
    idFrame++;
    const frame = await render.next(idCurrFrame);
    
    if (frame==='delay'){
      idFrame--;
      console.log(`Not found idFrame ${idFrame} in dictBlob`);
    }
    return {idCurrFrame, frame};

    // return await render.next(idFrame)
    // .then(()=>{
    //   idFrame++;
    //   const stride = reader.channels;
    //   buffer = reader.read();
    //   if (convertYUV) {
    //     return RGB2YUV420p(buffer, width, height, stride);
    //   } else{
    //     return buffer;
    //   }
    // })
    // .then(()=>{()=>{return undefined;}})

    // if (finished) return;
    // const done = renderFrame();
    // if (done) {
    //   finished = true;
    //   clearInterval(loop);
    //   return null; // end event
    // } else {
    //   const stride = reader.channels;
    //   const buffer = reader.read();
    //   if (convertYUV) {
    //     return RGB2YUV420p(buffer, width, height, stride);
    //   } else {
    //     return buffer;
    //   }
    // }
  }

  function RGB2YUV420p(rgb, width, height, stride = 3, buffer) {
    // console.log('WW-RGB2YUV420p');
    const image_size = width * height;
    let upos = image_size;
    let vpos = upos + Math.floor(upos / 4);
    let i = 0;
    if (!buffer) buffer = new Uint8Array(Math.floor((width * height * 3) / 2));
    for (let line = 0; line < height; ++line) {
      if (!(line % 2)) {
        for (let x = 0; x < width; x += 2) {
          let r = rgb[stride * i];
          let g = rgb[stride * i + 1];
          let b = rgb[stride * i + 2];
          buffer[i++] = ((66 * r + 129 * g + 25 * b) >> 8) + 16;
          buffer[upos++] = ((-38 * r + -74 * g + 112 * b) >> 8) + 128;
          buffer[vpos++] = ((112 * r + -94 * g + -18 * b) >> 8) + 128;
          r = rgb[stride * i];
          g = rgb[stride * i + 1];
          b = rgb[stride * i + 2];
          buffer[i++] = ((66 * r + 129 * g + 25 * b) >> 8) + 16;
        }
      } else {
        for (let x = 0; x < width; x += 1) {
          let r = rgb[stride * i];
          let g = rgb[stride * i + 1];
          let b = rgb[stride * i + 2];
          buffer[i++] = ((66 * r + 129 * g + 25 * b) >> 8) + 16;
        }
      }
    }
    return buffer;
  }

  function renderFrame() {
    if (idFrame >= totalFrames) {
      return true;
    }
    try {
      if (render.next(idFrame)){
        idFrame++;
      }
      else{
        console.log(`Not found idFrame ${idFrame} in dictBlob`);
      }
    } catch (error) {
      console.log('RENDER WW:', error);
    }
    return false;
  }
}