import {
  entersState,
  joinVoiceChannel,
  createAudioPlayer,
  getVoiceConnection,
  createAudioResource,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';

export default {
  ping: {
    description: 'Ping the bot',
    acceptArgs: false,
    execute: async ({ message }) => {
      await message.reply('Pong!');
    },
  },
  join: {
    description: 'Join audio channel',
    acceptArgs: false,
    execute: async ({ message }) => {
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (message.member.voice.channel) {
        if (voiceConnection?.joinConfig.channelId === message.member.voice.channel.id) {
          await message.reply('Already in this voice channel');
          return;
        }
        if (voiceConnection && voiceConnection?.joinConfig.channelId !== message.member.voice.channel.id) {
          await message.reply('Already in a voice channel');
          return;
        }
        await message.reply(`Joining ${message.member.voice.channel.name}`);
        const connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            if (connection.state.status === VoiceConnectionStatus.Disconnected) {
              connection.destroy();
            }
          }
        });
        connection.on('error', () => {
          try {
            connection.destroy();
          } catch (error) {
            console.log(error);
          }
        });
      } else {
        await message.reply('You need to join a voice channel first!');
      }
    },
  },
  leave: {
    description: 'Leave audio channel',
    acceptArgs: false,
    execute: async ({ message, client }) => {
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (!voiceConnection) {
        await message.reply('Not in a voice channel');
        return;
      }
      if (message.member.voice.channel.id === voiceConnection?.joinConfig.channelId) {
        await message.reply(`Leaving ${message.member.voice.channel.name}`);
        voiceConnection.destroy();
      } else {
        await message.reply('You need to join the voice channel first!');
      }
    },
  },
  play: {
    description: 'Play a song',
    acceptArgs: true,
    execute: async ({ message, args }) => {
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (!voiceConnection) {
        await message.reply('Not in a voice channel');
        return;
      }
      if (message.member.voice.channel.id !== voiceConnection?.joinConfig.channelId) {
        await message.reply('You need to join the voice channel first!');
        return;
      }
      try {
        if (!ytdl.validateURL(args)) {
          await message.reply('Not a valid URL');
          return;
        }
        const audio = ytdl(args, { quality: 'highestaudio' });
        const player = createAudioPlayer();
        const resource = createAudioResource(audio, { inlineVolume: true });
        voiceConnection.subscribe(player);
        player.play(resource);
        player.on('error', (error) => {
          console.log(error);
          player.stop();
        });
      } catch (error) {
        console.log(error);
      }
      await message.reply(`Playing${args}`);
    },
  },
};
