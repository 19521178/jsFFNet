
// var cookieTimes = [];
// var upserverTimes = [];
// var labelTimes = [];
// var expireTimes = [];
// var result;
var delayTimes = [];

function BufferFrameElement(){
    this.image = undefined;
    this.isSelected = false;
    this.time = 0;
}

function BufferFrame(length, idMaxPoint, savedFrames){
    this.savedFrames = savedFrames;
    this.listFrames = [];
    for (let i=0; i<length; i++){
        this.listFrames.push(new BufferFrameElement());
    }
    this.idPoint = 0;
    this.idMaxPoint = idMaxPoint;
    this.idLastProccessed = -1;
    this.idNextProccessed = 0;

    this.countExpired = 0;
    this.idStore = -1;

    this.tmpImg = null;

    async function storeImg(expiredFrame, nameImg){

        // const data = expiredFrame.image.dataToGPU({ customTexShape: [localStoreCanvas.width, localStoreCanvas.height] }); // get pointer to tensor texture on gpu
        
        // await drawTexture(localStoreCanvas, data.texture); // draw texture on canvas
        // tf.dispose(data.tensorRef); // dispose tensor
        tf.browser.toPixels(expiredFrame.image, localStoreCanvas);

        localStoreCanvas.toBlob((blob) => {
            ldb.set(
                nameImg, 
                blob,
            );
        }, 'image/jpeg', 0.1);
        
    }

    // this.numMissExpired = 0;
    this.Expired = function(){
        console.log("Start Expire")
        // var start_expire_time = Date.now();
        // if (this.idLastProccessed > 0){
            this.countExpired+=1;
            // Pop first element and push new init element to tail
            let expiredFrame = this.listFrames.shift();
            this.listFrames.push(new BufferFrameElement());
            
            this.idLastProccessed -= 1;
            this.idNextProccessed -= 1;
            this.idPoint -= 1;

            if (expiredFrame.isSelected === true){
                this.idStore += 1;
                console.log('Up image'+this.idStore);
                let nameImg = 'output_'+this.idStore.toString().padStart(6, '0');
                savedFrames.push(nameImg);
                storeImg(expiredFrame, nameImg);

                // this.tmpImg = localStoreCanvas.toDataURL('image/jpeg', quality=0.1);
                // ldb.set(
                //     nameImg, 
                //     this.tmpImg,
                //     ()=>{
                //         delete this.tmpImg;
                //     }
                // );
                
                expiredFrame.image.dispose();
            }
            else{
                expiredFrame.image.dispose();
            }
            delayTimes.push(Date.now() - expiredFrame.time);
            
            delete expiredFrame;
            
        // }
        // else{
        //     this.numMissExpired += 1;
        // }
        // var end_expire_time = Date.now();
        // expireTimes.push(end_expire_time-start_expire_time);
        
    }

    this.countLabel = 0;
    this.LabelFrames = function(action, indicesNeighbor){
        this.countLabel+=1;
        // var start_label_time = Date.now();
        this.idNextProccessed = this.idLastProccessed + action;

        try {
            for(let idNeighbor of indicesNeighbor){
                try{
                    this.listFrames[this.idNextProccessed + idNeighbor].isSelected = true;
                }
                catch{
                    // console.log('miss pp', this.idNextProccessed + idNeighbor);
                }
            }
        } catch (error) {
            console.log('ERROR INDICES NEIGHBOR:', indicesNeighbor, this.countLabel);
        }
        
        // var end_label_time = Date.now();
        // labelTimes.push(end_label_time-start_label_time);
        // console.log(this.idLastProccessed, this.idNextProccessed);
    }

    this.countCookie = 0;
    this.CookieFrame = function(image){
        this.countCookie += 1;
        console.log('Count cookie: ' + this.countCookie);
        // var start_cookie_time = Date.now();
        this.listFrames[this.idPoint].image = image;
        this.listFrames[this.idPoint].time = Date.now();
        // this.listFrames[this.idPoint].time = time;
        this.idPoint += 1;
        // var end_cookie_time = Date.now();
        // cookieTimes.push(end_cookie_time - start_cookie_time);
    }

    this.UpServer = function(){
        if (this.idNextProccessed <= this.idPoint - 1){
            console.log("Start Upserver", this.idNextProccessed);
            this.idLastProccessed = this.idNextProccessed;
            this.idNextProccessed = Infinity;
            // var start_upserver_time = Date.now();
            
            predict(extract(preprocess(this.listFrames[this.idLastProccessed].image)), this)
            // var end_upserver_time = Date.now();
            // upserverTimes.push(end_upserver_time - start_upserver_time);
            // console.log(this.idNextProccessed, this.listFrames[this.idNextProccessed].image);
        }       
    }



           

        

        // if (this.idNextProccessed > this.idPoint - 1){
        //     while(this.numMissExpired > 0){
        //         this.Expired();
        //         this.numMissExpired -= 1;
        //     }
        // }

        
        
    
}
