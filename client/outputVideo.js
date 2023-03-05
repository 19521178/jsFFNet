
// inputVideoModule = require('./inputVideo.js')
// console.log(inputVideoModule.blobing)
const OutputContainer = function(fps, idContainer){
    this.outputVideoContainer = document.getElementById(idContainer);
    this.video = this.outputVideoContainer.querySelector('#video');
    // this.hiddenVideo = this.outputVideoContainer.querySelector('#hidden-video');
    this.videoControls = this.outputVideoContainer.querySelector('#video-controls');
    this.playButton = this.outputVideoContainer.querySelector('#play');
    this.playbackIcons = this.outputVideoContainer.querySelectorAll('.playback-icons use');
    this.timeElapsed = this.outputVideoContainer.querySelector('#time-elapsed');
    this.duration = this.outputVideoContainer.querySelector('#duration');
    this.progressBar = this.outputVideoContainer.querySelector('#progress-bar');
    this.seek = this.outputVideoContainer.querySelector('#seek');
    this.seekTooltip = this.outputVideoContainer.querySelector('#seek-tooltip');
    this.volumeButton = this.outputVideoContainer.querySelector('#volume-button');
    this.volumeIcons = this.outputVideoContainer.querySelectorAll('.volume-button use');
    this.volumeMute = this.outputVideoContainer.querySelector('use[href="#volume-mute"]');
    this.volumeLow = this.outputVideoContainer.querySelector('use[href="#volume-low"]');
    this.volumeHigh = this.outputVideoContainer.querySelector('use[href="#volume-high"]');
    this.volume = this.outputVideoContainer.querySelector('#volume');
    this.playbackAnimation = this.outputVideoContainer.querySelector('#playback-animation');
    this.fullscreenButton = this.outputVideoContainer.querySelector('#fullscreen-button');
    this.fullscreenIcons = this.fullscreenButton.querySelectorAll('use');
    this.pipButton = this.outputVideoContainer.querySelector('#pip-button');

    this.localStoreImg = new Image();
    this.imgSrc;
    this.videoCtx = this.video.getContext('2d', { willReadFrequently: true });
    this.idPlaying = 0;
    this.lenVideo = 0;
    this.listImage = [];
    this.isPlaying = false;
    this.isPaused = true;
    this.isStopped = false;
    this.fps = fps;
    this.renderInterval;

    this.fcTogglePlay = togglePlay.bind(this);
    this.fcUpdatePlayButton = updatePlayButton.bind(this);
    this.fcInitializeVideo = initializeVideo.bind(this);
    this.fcUpdateVideoDuration = updateVideoDuration.bind(this);
    this.fcUpdateTimeElapsed = updateTimeElapsed.bind(this);
    // this.fcStoreFrame = storeFrame.bind(this);
    this.fcUpdateProgress = updateProgress.bind(this);
    this.fcUpdateSeekTooltip = updateSeekTooltip.bind(this);
    this.fcSkipAhead = skipAhead.bind(this);
    this.fcUpdateVolume = updateVolume.bind(this);
    this.fcUpdateVolumeIcon = updateVolumeIcon.bind(this);
    this.fcToggleMute = toggleMute.bind(this);
    this.fcAnimatePlayback = animatePlayback.bind(this);
    this.fcToggleFullScreen = toggleFullScreen.bind(this);
    this.fcUpdateFullscreenButton = updateFullscreenButton.bind(this);
    this.fcTogglePip = togglePip.bind(this);
    this.fcHideControls = hideControls.bind(this);
    this.fcShowControls = showControls.bind(this);
    this.fcKeyboardShortcuts = keyboardShortcuts.bind(this);

    // togglePlay toggles the playback state of the video.
    // If the video playback is paused or ended, the video is played
    // otherwise, the video is paused
    this.play = play;
    this.pause = pause;

    this.timeUpdateEvent = new Event('timeupdate');
    
    this.localStoreImg.onload = (event) => {
        URL.revokeObjectURL(event.target.src) // Once it loaded the resource, then you can free it at the beginning.
        this.videoCtx.drawImage(event.target, 0, 0)
    }

    this.initializeSize = () => {
        this.video.width = this.hiddenVideo.videoWidth;
        this.video.height = this.hiddenVideo.videoHeight;
    }
    
    async function play(){
        this.isPlaying = true;
        this.isPaused = false;
        this.renderInterval = setInterval(() => {
            this.idPlaying += 1;
            if (this.idPlaying >= this.listImage.length){
                this.idPlaying -= 1;
                console.log(this.idPlaying);
                
                // this.pause();
                this.fcTogglePlay();
            }
            else{
                // this.displaySrcTime(this.listImage[this.idPlaying]);

                // tf.browser.toPixels(this.listImage[this.idPlaying], this.video);
                // this.videoControls.dispatchEvent(this.timeUpdateEvent);

                this.displaySrcTime();               

            }
        }, 1000/this.fps);
        // this.hiddenVideo.play();
    }

    function pause(){
        this.isPlaying = false;
        this.isPaused = true;
        try{
            clearInterval(this.renderInterval);
        }
        catch{}        
        // this.hiddenVideo.pause();
        this.fcShowControls();
    }

    function togglePlay() {
        if (this.isPaused || this.isStopped) {
            this.play();
        } else {
            this.pause();
        }
        this.fcUpdatePlayButton();
    }

    // updatePlayButton updates the playback icon and tooltip
    // depending on the playback state
    function updatePlayButton() {
        this.playbackIcons.forEach((icon) => icon.classList.toggle('hidden'));

        if (this.isPlaying) {
            this.playButton.setAttribute('data-title', 'Pause');
        } else {
            this.playButton.setAttribute('data-title', 'Play');
        }
    }

    // formatTime takes a time length in seconds and returns the time in
    // minutes and seconds
    // function formatTime(timeInSeconds) {
    //     const result = new Date(timeInSeconds * 1000).toISOString().substring(11, 8);

    //     return {
    //         minutes: result.substring(3, 2),
    //         seconds: result.substring(6, 2),
    //     };
    // }
    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds/60);
        const seconds = timeInSeconds % 60

        return {
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
        };
    }

    // initializeVideo sets the video duration, and maximum value of the
    // progressBar
    function initializeVideo() {
        const videoDuration = Math.round(this.listImage.length/this.fps);
        this.seek.setAttribute('max', this.listImage.length);
        this.progressBar.setAttribute('max', this.listImage.length);
        const time = formatTime(videoDuration);
        this.duration.innerText = `${time.minutes}:${time.seconds}`;
        this.duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    }

    function updateVideoDuration(){
        const videoDuration = Math.round(this.listImage.length / this.fps);
        this.seek.setAttribute('max', this.listImage.length);
        this.progressBar.setAttribute('max', this.listImage.length);
        const time = formatTime(videoDuration);
        this.duration.innerText = `${time.minutes}:${time.seconds}`;
        this.duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    }

    // updateTimeElapsed indicates how far through the video
    // the current playback is by updating the timeElapsed element
    function updateTimeElapsed() {
        const time = formatTime(Math.round((this.idPlaying+1)/this.fps));
        this.timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
        this.timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    }

    function storeFrame(){
        // num_change_currentTime += 1;
        // console.log(num_change_currentTime)
    }

    // updateProgress indicates how far through the video
    // the current playback is by updating the progress bar
    function updateProgress() {
        this.seek.value = this.idPlaying;
        this.progressBar.value = this.idPlaying;
    }

    // updateSeekTooltip uses the position of the mouse on the progress bar to
    // roughly work out what point in the video the user will skip to if
    // the progress bar is clicked at this point
    function updateSeekTooltip(event) {
        const skipTo = Math.round(
            (event.offsetX / event.target.clientWidth) *
            parseInt(event.target.getAttribute('max'), 10)
        );
        this.seek.setAttribute('data-seek', skipTo);
        const t = formatTime(Math.round(skipTo/this.fps));
        this.seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
        const rect = this.video.getBoundingClientRect();
        this.seekTooltip.style.left = `${event.pageX - rect.left}px`;
    }

    // skipAhead jumps to a different point in the video when the progress bar
    // is clicked
    // this.displaySrcTime = async (time)=>{
    //     this.hiddenVideo.currentTime = time;
    //     // await this.hiddenVideo.play();
    //     // await this.hiddenVideo.pause();
        
    //     setTimeout(()=>{
    //         this.videoCtx.drawImage(this.hiddenVideo, 0, 0, this.video.width, this.video.height);
    //         this.videoControls.dispatchEvent(this.timeUpdateEvent);
    //     }, 0);
    //     // window.requestAnimationFrame(this.displaySrcTime);
    //     // console.log(this.hiddenVideo.currentTime);
        
    // }
    // // window.requestAnimationFrame(this.displaySrcTime);

    this.displaySrcTime = async ()=>{
        ldb.get(this.listImage[this.idPlaying], (blob)=>{
            // delete this.imgSrc;
            // this.imgSrc = value;
            // this.localStoreImg.src = this.imgSrc;
            // this.videoCtx.drawImage(this.localStoreImg, 0, 0);
            // this.videoControls.dispatchEvent(this.timeUpdateEvent);
            this.localStoreImg.src = URL.createObjectURL(blob)
            this.videoControls.dispatchEvent(this.timeUpdateEvent);
        });               
    }

    function skipAhead(event) {
        const skipTo = event.target.dataset.seek
            ? event.target.dataset.seek
            : event.target.value;
        console.log(skipTo);
        this.idPlaying = skipTo - 1;
        this.idPlaying = (this.idPlaying>=0) ? this.idPlaying : 0;
        // this.progressBar.value = skipTo;
        // this.seek.value = skipTo;
        // this.updateTimeElapsed();
        // this.displaySrcTime(this.listImage[this.idPlaying]);

        // tf.browser.toPixels(this.listImage[this.idPlaying], this.video);
        // this.videoControls.dispatchEvent(this.timeUpdateEvent);

        this.displaySrcTime();

        // console.log(this.hiddenVideo.currentTime);
    }

    // updateVolume updates the video's volume
    // and disables the muted state if active
    function updateVolume() {
        if (this.video.muted) {
            this.video.muted = false;
        }

        this.video.volume = this.volume.value;
    }

    // updateVolumeIcon updates the volume icon so this it correctly reflects
    // the volume of the video
    function updateVolumeIcon() {
        this.volumeIcons.forEach((icon) => {
            icon.classList.add('hidden');
        });

        this.volumeButton.setAttribute('data-title', 'Mute (m)');

        if (this.video.muted || this.video.volume === 0) {
            this.volumeMute.classList.remove('hidden');
            this.volumeButton.setAttribute('data-title', 'Unmute (m)');
        } else if (this.video.volume > 0 && this.video.volume <= 0.5) {
            this.volumeLow.classList.remove('hidden');
        } else {
            this.volumeHigh.classList.remove('hidden');
        }
    }

    // toggleMute mutes or unmutes the video when executed
    // When the video is unmuted, the volume is returned to the value
    // it was set to before the video was muted
    function toggleMute() {
        this.video.muted = !this.video.muted;

        if (this.video.muted) {
            this.volume.setAttribute('data-volume', this.volume.value);
            this.volume.value = 0;
        } else {
            this.volume.value = this.volume.dataset.volume;
        }
    }

    // animatePlayback displays an animation when
    // the video is played or paused
    function animatePlayback() {
        this.playbackAnimation.animate(
            [
                {
                    opacity: 1,
                    transform: 'scale(1)',
                },
                {
                    opacity: 0,
                    transform: 'scale(1.3)',
                },
                ],
                {
                duration: 500,
            }
        );
    }

    // toggleFullScreen toggles the full screen state of the video
    // If the browser is currently in fullscreen mode,
    // then it should exit and vice versa.
    function toggleFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
            // Need this to support Safari
            document.webkitExitFullscreen();
        } else if (this.outputVideoContainer.webkitRequestFullscreen) {
            // Need this to support Safari
            this.outputVideoContainer.webkitRequestFullscreen();
        } else {
            this.outputVideoContainer.requestFullscreen();
        }
        // this.outputVideoContainer.dispatchEvent(new Event('fullscreenchange'));
    }

    // updateFullscreenButton changes the icon of the full screen button
    // and tooltip to reflect the current full screen state of the video
    function updateFullscreenButton() {
        this.fullscreenIcons.forEach((icon) => icon.classList.toggle('hidden'));

        if (document.fullscreenElement) {
            this.fullscreenButton.setAttribute('data-title', 'Exit full screen');
        } else {
            this.fullscreenButton.setAttribute('data-title', 'Full screen');
        }
    }

    // togglePip toggles Picture-in-Picture mode on the video
    async function togglePip() {
        try {
            if (this.video !== document.pictureInPictureElement) {
                this.pipButton.disabled = true;
            await this.video.requestPictureInPicture();
            } else {
            await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.pipButton.disabled = false;
        }
    }

    // hideControls hides the video controls when not in use
    // if the video is paused, the controls must remain visible
    function hideControls() {
        if (this.video.paused) {
            return;
        }

        // this.videoControls.classList.add('hide');
    }

    // showControls displays the video controls
    function showControls() {
        this.videoControls.classList.remove('hide');
    }

    // keyboardShortcuts executes the relevant functions for
    // each supported shortcut key
    function keyboardShortcuts(event) {
        const { key } = event;
        switch (key) {
            case 'k':
                this.togglePlay();
                this.animatePlayback();
            if (this.video.paused) {
                showControls();
            } else {
                setTimeout(() => {
                hideControls();
                }, 2000);
            }
            break;
            case 'm':
            toggleMute();
            break;
            case 'f':
            toggleFullScreen();
            break;
            case 'p':
            togglePip();
            break;
        }
    }

    // Add eventlisteners here
    this.localStoreImg.addEventListener('load', ()=>{
        this.videoCtx.drawImage(this.localStoreImg, 0, 0);
    })
    this.playButton.addEventListener('click', this.fcTogglePlay);
    // this.video.addEventListener('play', this.fcUpdatePlayButton);
    // this.video.addEventListener('pause', this.fcUpdatePlayButton);
    // this.video.addEventListener('loadedmetadata', this.fcInitializeVideo);
    this.videoControls.addEventListener('timeupdate', this.fcUpdateTimeElapsed);
    this.videoControls.addEventListener('timeupdate', this.fcUpdateProgress);
    // this.video.addEventListener('timeupdate', this.fcStoreFrame);
    // this.video.addEventListener('volumechange', this.fcUpdateVolumeIcon);
    this.video.addEventListener('click', this.fcTogglePlay);
    this.video.addEventListener('click', this.fcAnimatePlayback);
    this.video.addEventListener('mouseenter', this.fcShowControls);
    this.video.addEventListener('mouseleave', this.fcHideControls);
    this.videoControls.addEventListener('mouseenter', this.fcShowControls);
    this.videoControls.addEventListener('mouseleave', this.fcHideControls);
    this.seek.addEventListener('mousemove', this.fcUpdateSeekTooltip);
    this.seek.addEventListener('input', this.fcSkipAhead);
    // this.volume.addEventListener('input', this.fcUpdateVolume);
    // this.volumeButton.addEventListener('click', this.fcToggleMute);
    this.fullscreenButton.addEventListener('click', this.fcToggleFullScreen);
    this.outputVideoContainer.addEventListener('fullscreenchange', this.fcUpdateFullscreenButton);
    this.pipButton.addEventListener('click', this.fcTogglePip);

    

    function removeEventListener(){
        this.playButton.removeEventListener('click', this.fcTogglePlay);
        this.videoControls.removeEventListener('timeupdate', this.fcUpdateTimeElapsed);
        this.videoControls.removeEventListener('timeupdate', this.fcUpdateProgress);
        this.video.removeEventListener('click', this.fcTogglePlay);
        this.video.removeEventListener('click', this.fcAnimatePlayback);
        this.video.removeEventListener('mouseenter', this.fcShowControls);
        this.video.removeEventListener('mouseleave', this.fcHideControls);
        this.videoControls.removeEventListener('mouseenter', this.fcShowControls);
        this.videoControls.removeEventListener('mouseleave', this.fcHideControls);
        this.seek.removeEventListener('mousemove', this.fcUpdateSeekTooltip);
        this.seek.removeEventListener('input', this.fcSkipAhead);
        this.fullscreenButton.removeEventListener('click', this.fcToggleFullScreen);
        this.outputVideoContainer.removeEventListener('fullscreenchange', this.fcUpdateFullscreenButton);
        this.pipButton.removeEventListener('click', this.fcTogglePip);
    }
    this.fcRemoveEventListener = removeEventListener;
}

