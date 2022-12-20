this.onmessage = e =>{
    let storeCanvas = e.data.canvas;
    let img = e.data.image;
    let nameImg = e.data.nameImg;
    tf.browser.toPixels(img, storeCanvas);
    storeCanvas.toBlob((blob) => {
        ldb.set(
            nameImg, 
            blob,
        );
    }, 'image/jpeg', 0.1);
};