const mediaErrors = {
  1: 'MEDIA_ERR_ABORTED - fetching process aborted by user',
  2: 'MEDIA_ERR_NETWORK - error occurred when downloading',
  3: 'MEDIA_ERR_DECODE - error occurred when decoding',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - audio/video not supported'
};

class Player {

  constructor() {
    this._audio = null;
    this._streamUrl = '/stream?cache-buster=' + Date.now();
    this._playing = false;
    this._volume = 0.5;
  }

  isPlaying() {
    return !!this._playing;
  }

  getVolume() {
    return this._volume * 100;
  }

  setVolume(perc) {
    if (typeof perc === 'number') {
      this._volume = perc / 100;
      if (this._audio) this._audio.volume = perc / 100;
    }
  }

  reset(streamUrl) {
    this.stop();
    this.play(streamUrl);
  }

  play(streamUrl) {
    if (this._audio) return;

    this._streamUrl = streamUrl || this._streamUrl;
    this._audio = new Audio();
    this._audio.src = this._streamUrl;
    this._audio.volume = this._volume;
    this._audio.play();
    this._playing = true;
    this._attachEvents();
  }

  stop() {
    this._playing = false;
    if (this._audio) {
      this._audio.pause();
      this._audio.src = '';
      this._removeEvents();
      this._audio = null;
    }
  }

  _attachEvents() {
    this._audio.addEventListener('error', this._onError.bind(this));
    this._audio.addEventListener('pause', this._onPause.bind(this));
    this._audio.addEventListener('playing', this._onPlaying.bind(this));
  }

  _removeEvents() {
    this._audio.removeEventListener('error', this._onError.bind(this));
    this._audio.removeEventListener('pause', this._onPause.bind(this));
    this._audio.removeEventListener('playing', this._onPlaying.bind(this));
  }

  _onError() {
    this._playing = false;
    try {
      console.error('Player error:', mediaErrors[this._audio.error.code]);
    } catch(e) {
      console.error('Player error: unknown');
    }

    this.stop();
  }

  _onPause() {
    this._playing = false;
  }

  _onPlaying() {
    this._playing = true;
  }

}

export default new Player();
