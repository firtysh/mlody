import { createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core';

export default function makeResource(url) {
  if (!ytdl.validateURL(url)) {
    return null;
  }
  const audio = ytdl(url, {
    dlChunkSize: 32768,
    liveBuffer: 50000,
    highWaterMark: 32768,
    quality: 'highestaudio',
  });
  return createAudioResource(audio);
}
