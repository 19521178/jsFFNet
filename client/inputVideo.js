// Select elements here
const InputContainer = function(){
    this.inputVideoContainer = document.getElementById('input-video-container');
    this.video = this.inputVideoContainer.querySelector('#video');
    this.videoControls = this.inputVideoContainer.querySelector('#video-controls');
    this.playButton = this.inputVideoContainer.querySelector('#play');
    this.playbackIcons = this.inputVideoContainer.querySelectorAll('.playback-icons use');
    this.timeElapsed = this.inputVideoContainer.querySelector('#time-elapsed');
    this.duration = this.inputVideoContainer.querySelector('#duration');
    this.progressBar = this.inputVideoContainer.querySelector('#progress-bar');
    this.seek = this.inputVideoContainer.querySelector('#seek');
    this.seekTooltip = this.inputVideoContainer.querySelector('#seek-tooltip');
    this.volumeButton = this.inputVideoContainer.querySelector('#volume-button');
    this.volumeIcons = this.inputVideoContainer.querySelectorAll('.volume-button use');
    this.volumeMute = this.inputVideoContainer.querySelector('use[href="#volume-mute"]');
    this.volumeLow = this.inputVideoContainer.querySelector('use[href="#volume-low"]');
    this.volumeHigh = this.inputVideoContainer.querySelector('use[href="#volume-high"]');
    this.volume = this.inputVideoContainer.querySelector('#volume');
    this.playbackAnimation = this.inputVideoContainer.querySelector('#playback-animation');
    this.fullscreenButton = this.inputVideoContainer.querySelector('#fullscreen-button');
    this.fullscreenIcons = this.fullscreenButton.querySelectorAll('use');
    this.pipButton = this.inputVideoContainer.querySelector('#pip-button');

    this.fcTogglePlay = togglePlay;
    this.fcUpdatePlayButton = updatePlayButton;
    this.fcInitializeVideo = initializeVideo;
    this.fcUpdateTimeElapsed = updateTimeElapsed;
    this.fcStoreFrame = storeFrame;
    this.fcUpdateProgress = updateProgress;
    this.fcUpdateSeekTooltip = updateSeekTooltip;
    this.fcSkipAhead = skipAhead;
    this.fcUpdateVolume = updateVolume;
    this.fcUpdateVolumeIcon = updateVolumeIcon;
    this.fcToggleMute = toggleMute;
    this.fcAnimatePlayback = animatePlayback;
    this.fcToggleFullScreen = toggleFullScreen;
    this.fcUpdateFullscreenButton = updateFullscreenButton;
    this.fcTogglePip = togglePip;
    this.fcHideControls = hideControls;
    this.fcShowControls = showControls;
    this.fcKeyboardShortcuts = keyboardShortcuts;

    // togglePlay toggles the playback state of the video.
    // If the video playback is paused or ended, the video is played
    // otherwise, the video is paused
    function togglePlay() {
        if (this.video.paused || this.video.ended) {
            this.video.play();
            // mediaRecorder.play()
        } else {
            this.video.pause();
        }
    }

    // updatePlayButton updates the playback icon and tooltip
    // depending on the playback state
    function updatePlayButton() {
        this.playbackIcons.forEach((icon) => icon.classList.toggle('hidden'));

        if (this.video.paused) {
            this.playButton.setAttribute('data-title', 'Play (k)');
        } else {
            this.playButton.setAttribute('data-title', 'Pause (k)');
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
        const videoDuration = Math.round(this.video.duration);
        this.seek.setAttribute('max', videoDuration);
        this.progressBar.setAttribute('max', videoDuration);
        const time = formatTime(videoDuration);
        this.duration.innerText = `${time.minutes}:${time.seconds}`;
        this.duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    }

    // function updateVideoDuration(){
    //     const videoDuration = Math.round(video.duration);
    //     seek.setAttribute('max', videoDuration);
    //     progressBar.setAttribute('max', videoDuration);
    //     const time = formatTime(videoDuration);
    //     duration.innerText = `${time.minutes}:${time.seconds}`;
    //     duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    // }

    // updateTimeElapsed indicates how far through the video
    // the current playback is by updating the timeElapsed element
    function updateTimeElapsed() {
        const time = formatTime(Math.round(this.video.currentTime));
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
        this.seek.value = Math.floor(this.video.currentTime);
        this.progressBar.value = Math.floor(this.video.currentTime);
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
        const t = formatTime(skipTo);
        this.seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
        const rect = this.video.getBoundingClientRect();
        this.seekTooltip.style.left = `${event.pageX - rect.left}px`;
    }

    // skipAhead jumps to a different point in the video when the progress bar
    // is clicked
    function skipAhead(event) {
        const skipTo = event.target.dataset.seek
            ? event.target.dataset.seek
            : event.target.value;
            this.video.currentTime = skipTo;
            this.progressBar.value = skipTo;
            this.seek.value = skipTo;
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
        } else if (this.videoContainer.webkitRequestFullscreen) {
            // Need this to support Safari
            this.videoContainer.webkitRequestFullscreen();
        } else {
            this.videoContainer.requestFullscreen();
        }
    }

    // updateFullscreenButton changes the icon of the full screen button
    // and tooltip to reflect the current full screen state of the video
    function updateFullscreenButton() {
        this.fullscreenIcons.forEach((icon) => icon.classList.toggle('hidden'));

        if (document.fullscreenElement) {
            this.fullscreenButton.setAttribute('data-title', 'Exit full screen (f)');
        } else {
            this.fullscreenButton.setAttribute('data-title', 'Full screen (f)');
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

        this.videoControls.classList.add('hide');
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
    this.playButton.addEventListener('click', this.fcTogglePlay.bind(this));
    this.video.addEventListener('play', this.fcUpdatePlayButton.bind(this));
    this.video.addEventListener('pause', this.fcUpdatePlayButton.bind(this));
    this.video.addEventListener('loadedmetadata', this.fcInitializeVideo.bind(this));
    this.video.addEventListener('timeupdate', this.fcUpdateTimeElapsed.bind(this));
    this.video.addEventListener('timeupdate', this.fcUpdateProgress.bind(this));
    this.video.addEventListener('timeupdate', this.fcStoreFrame.bind(this));
    this.video.addEventListener('volumechange', this.fcUpdateVolumeIcon.bind(this));
    this.video.addEventListener('click', this.fcTogglePlay.bind(this));
    this.video.addEventListener('click', this.fcAnimatePlayback.bind(this));
    this.video.addEventListener('mouseenter', this.fcShowControls.bind(this));
    this.video.addEventListener('mouseleave', this.fcHideControls.bind(this));
    this.videoControls.addEventListener('mouseenter', this.fcShowControls.bind(this));
    this.videoControls.addEventListener('mouseleave', this.fcHideControls.bind(this));
    this.seek.addEventListener('mousemove', this.fcUpdateSeekTooltip.bind(this));
    this.seek.addEventListener('input', this.fcSkipAhead.bind(this));
    this.volume.addEventListener('input', this.fcUpdateVolume.bind(this));
    this.volumeButton.addEventListener('click', this.fcToggleMute.bind(this));
    this.fullscreenButton.addEventListener('click', this.fcToggleFullScreen.bind(this));
    this.inputVideoContainer.addEventListener('fullscreenchange', this.fcUpdateFullscreenButton.bind(this));
    this.pipButton.addEventListener('click', this.fcTogglePip.bind(this));
}






// document.addEventListener('keyup', inputContainer.fcKeyboardShortcuts.bind(inputContainer));
