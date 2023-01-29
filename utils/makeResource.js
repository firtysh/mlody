import { createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core';

export default function makeResource(url) {
  if (!ytdl.validateURL(url)) {
    return null;
  }
  const audio = ytdl(url, { quality: 'highestaudio' });
  return createAudioResource(audio);
}
