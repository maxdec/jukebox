'use strict';

function Player(streamUrl) {
  // Is the local speaker playing?
  this._audio = new Audio(streamUrl);
  this._audio.volume = 0.5;
  this.playing = false;
  this.play();
}

Player.prototype.play = function () {
  this._audio.play();
  this.playing = true;

  return true;
};

Player.prototype.pause = function () {
  this._audio.pause();
  this.playing = false;

  return false;
};

/**
 * Getter/Setter for the (remote or local) volume level.
 * perc - between 0 and 100.
 * Returns a promise.
 */
Player.prototype.volume = function (perc) {
  if (typeof perc === 'number') this._audio.volume = perc / 100;

  return this._audio.volume * 100;
};
