const queue = new Map();
function addSong({ guild, song, player }) {
  /**
   * Add song to queue.
   * @param {object} song - song object
   * @param {string} guild - guild id
   * @param {string} song.title - song title
   * @param {string} song.url - song url
   * @param {string} song.requestedBy - song requested by
   * @param {string} song.duration - song duration
   * @returns {void}
   */

  // Add song to queue
  if (!queue.get(guild)) {
    // If queue does not exist, create it
    queue.set(guild, {
      songs: [{
        title: song.title,
        url: song.url,
        requestedBy: song.requestedBy,
        duration: song.duration,
      }],
      player,
      currentSong: 0,
    });
  } else {
    // If queue exists, add song to it
    queue.get(guild).songs.push({
      title: song.title,
      url: song.url,
      requestedBy: song.requestedBy,
      duration: song.duration,
    });
  }
}
function getQueue({ guild }) {
  return queue.get(guild);
}
function nextSong({ guild }) {
  // Increment currentSong
  queue.get(guild).currentSong += 1;
  // Get next song
  return queue.get(guild).songs[queue.get(guild).currentSong];
}

export {
  addSong, nextSong, getQueue,
};
