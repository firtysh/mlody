import { createAudioResource, StreamType } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import playdl from 'play-dl'

// export default function makeResource(url) {
//   if (!ytdl.validateURL(url)) {
//     return null;
//   }
//   const audio = ytdl(url, { quality: 'highestaudio' });
//   return createAudioResource(audio);
// }
export default function makeResource(stream) {
  return createAudioResource(stream,{
    inputType:StreamType.Opus
  });
}
