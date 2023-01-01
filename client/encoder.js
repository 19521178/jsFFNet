// import loadEncoder from "./utils/mp4-encoder.js";
async function createEncoder (width, height, fps) {
    const Encoder = await loadEncoder();

    // const encoderOutputs = [];
    // const nalFrames = [];
    const mp4Outputs = [];

    const init = {
        output: h264_write,
        error: (e) => {
            console.error(e.message);
        }
    };

    const mux = Encoder.create_encoder({
        width,
        height,
        sequential: true,
        h264: false
    }, mux_write);

    const config = {
        // codec: 'avc1.4d401e',
        // codec: 'avc1.4d002a',
        // codec: 'avc1.4d0028',
        codec: 'avc1.640034',
        width: width,
        height: height,
        bitrate: 8_000_000, // N Mbps
        framerate: fps,
    };

    const encoder = new VideoEncoder(init);
    encoder.configure(config);

    return {
        async end () {
            await encoder.flush();
            encoder.close();

            Encoder.finalize_encoder(mux);
            return concatBuffers(mp4Outputs);
        },
        addFrame (bitmap, keyFrame, time = 0) {
            time *= 1000000; // in microseconds
            let frame = new VideoFrame(bitmap, { timestamp: time });
            const ret = encoder.encode(frame, { keyFrame });
            frame.destroy();
        },
        flush () {
            return encoder.flush();
        }
    }

    function concatBuffers (arrays) {
        // Calculate byteSize from all arrays
        const size = arrays.reduce((a,b) => a + b.byteLength, 0)
        // Allcolate a new buffer
        const result = new Uint8Array(size);
        let offset = 0;
        for (let i = 0; i < arrays.length; i++) {
        const arr = arrays[i];
        result.set(arr, offset);
        offset += arr.byteLength;
        }
        return result;
    }

    function mux_write (data_ptr, size) {
        const buf = Encoder.HEAPU8.slice(data_ptr, data_ptr + size);
        mp4Outputs.push(buf);
        return 0;
    }

    function convertAVCToAnnexBInPlaceForLength4 (arrayBuf) {
        const kLengthSize = 4;
        let pos = 0;
        const chunks = [];
        const size = arrayBuf.byteLength;
        const uint8 = new Uint8Array(arrayBuf);
        while (pos + kLengthSize < size) {
        // read uint 32, 4 byte NAL length
        let nal_length = uint8[pos];
        nal_length = (nal_length << 8) + uint8[pos+1];
        nal_length = (nal_length << 8) + uint8[pos+2];
        nal_length = (nal_length << 8) + uint8[pos+3];

        chunks.push(new Uint8Array(arrayBuf, pos + kLengthSize, nal_length));
        if (nal_length == 0) throw new Error('erro')
        pos += kLengthSize + nal_length;
        }
        return chunks;
    }

    function parseAVCC (avcc) {
        const view = new DataView(avcc);
        let off = 0;
        const version = view.getUint8(off++)
        const profile = view.getUint8(off++);
        const compat = view.getUint8(off++);
        const level = view.getUint8(off++);
        const length_size = (view.getUint8(off++) & 0x3) + 1;
        if (length_size !== 4) throw new Error('Expected length_size to indicate 4 bytes')
        const numSPS = view.getUint8(off++) & 0x1f;
        const sps_list = [];
        for (let i = 0; i < numSPS; i++) {
        const sps_len = view.getUint16(off, false);
        off += 2;
        const sps = new Uint8Array(view.buffer, off, sps_len);
        sps_list.push(sps);
        off += sps_len;
        }
        const numPPS = view.getUint8(off++);
        const pps_list = [];
        for (let i = 0; i < numPPS; i++) {
        const pps_len = view.getUint16(off, false);
        off += 2;
        const pps = new Uint8Array(view.buffer, off, pps_len);
        pps_list.push(pps)
        off += pps_len;
        }
        return {
        offset: off,
        version,
        profile,
        compat,
        level,
        length_size,
        pps_list,
        sps_list,
        numSPS
        }
    }

    function write_nal (uint8) {
        const p = Encoder._malloc(uint8.byteLength);
        Encoder.HEAPU8.set(uint8, p);
        Encoder.write_nal(mux, p, uint8.length);
        Encoder._free(p);
    }

    function h264_write (chunk, opts) {
        let avccConfig = null;
        if (opts.description) {
            avccConfig = parseAVCC(opts.description);
        }

        const nal = [];
        if (avccConfig) {
            avccConfig.sps_list.forEach(sps => {
                nal.push(START_CODE);
                nal.push(sps);
            });
            avccConfig.pps_list.forEach(pps => {
                nal.push(START_CODE);
                nal.push(pps);
            });
        }
        
        convertAVCToAnnexBInPlaceForLength4(chunk.data).forEach(sub => {
            nal.push(START_CODE);
            nal.push(sub);
        });

        write_nal(concatBuffers(nal))
    }
}
async function test(){
    const fps = 30;
    // const duration = 10;
    let frame = 0;
    // let totalFrames = Math.round(fps * duration);
    let totalFrames = 300;

    const width = 1920;
    const height = 1080;

    console.time('encode');
    const encoder = await createEncoder(width, height, fps);

    requestAnimationFrame(loop);

    async function loop() {
        if (frame >= totalFrames) {
            await encoder.flush()
            const buf = await encoder.end();
            console.timeEnd('encode');

            show(buf, width, height);
            return;
        }


        drawFrame(frame / (totalFrames - 1));
        const bitmap = await createImageBitmap(canvas);
        const timestamp = 1 / fps * frame;
        const keyframe = frame % 20 === 0;
        encoder.addFrame(bitmap, keyframe, timestamp);
        if ((frame + 1) % 10 === 0) {
            await encoder.flush()
        }
        requestAnimationFrame(loop);
        frame++;
    }
}
