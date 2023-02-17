import {
  entersState,
  joinVoiceChannel,
  createAudioPlayer,
  getVoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import ytsr from "ytsr";
import makeResource from "../utils/makeResource.js";
import { addSong, nextSong, getQueue } from "../utils/musicQueue.js";
export default {
  currentSong: {
    description: "to display the song name",
    acceptArgs: false,
    execute: async ({ message }) => {
      if (getQueue({ guild: message.guild.id })) {
        return await message.reply(
          getQueue({ guild: message.guild.id }).songs[
            getQueue({ guild: message.guild.id }).currentSong
          ].title
        );
      }
      await message.reply(
        "no songs currently playing in queue kindly play the song first"
      );
    },
  },
  ping: {
    description: "Ping the bot",
    acceptArgs: false,
    execute: async ({ message }) => {
      // Send a message to the channel
      message.channel.send("Pinging...").then((msg) => {
        // Calculate the bot latency
        const botLatency = Math.round(
          msg.createdTimestamp - message.createdTimestamp
        );

        // Calculate the API latency
        const apiLatency = Math.round(message.client.ws.ping);
        //again send the reply to the bot after calculating ..
        msg.reply(
          `Bot latency is :${botLatency}ms | API latency is ${apiLatency}ms`
        );
      });
    },
  },
  join: {
    description: "Join audio channel",
    acceptArgs: false,
    execute: async ({ message }) => {
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (message.member.voice.channel) {
        if (
          voiceConnection?.joinConfig.channelId ===
          message.member.voice.channel.id
        ) {
          await message.reply("Already in this voice channel");
          return;
        }
        if (
          voiceConnection &&
          voiceConnection?.joinConfig.channelId !==
            message.member.voice.channel.id
        ) {
          await message.reply("Already in a voice channel");
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
            if (
              connection.state.status === VoiceConnectionStatus.Disconnected
            ) {
              connection.destroy();
            }
          }
        });
        connection.on("error", () => {
          try {
            connection.destroy();
          } catch (error) {
            console.log(error);
          }
        });
      } else {
        await message.reply("You need to join a voice channel first!");
      }
    },
  },
  leave: {
    description: "Leave audio channel",
    acceptArgs: false,
    execute: async ({ message }) => {
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (!voiceConnection) {
        await message.reply("Not in a voice channel");
        return;
      }
      if (
        message.member.voice.channel.id ===
        voiceConnection?.joinConfig.channelId
      ) {
        await message.reply(`Leaving ${message.member.voice.channel.name}`);
        voiceConnection.destroy();
      } else {
        await message.reply("You need to join the voice channel first!");
      }
    },
  },
  play: {
    description: "Play a song",
    acceptArgs: true,
    execute: async ({ message, args }) => {
      // get voice connection by guild id
      const voiceConnection = getVoiceConnection(message.guild.id);
      if (!voiceConnection) {
        // if bot is not in a voice channel
        await message.reply("Not in a voice channel");
        return;
      }
      if (
        message.member.voice.channel.id !==
        voiceConnection?.joinConfig.channelId
      ) {
        // if user is not in the same voice channel as the bot
        await message.reply("You need to join the voice channel first!");
        return;
      }
      try {
        // get first result from youtube search
        const { url, title, duration } = (await ytsr(args, { limit: 1 }))
          .items[0];

        // generate song object
        const song = {
          title,
          url,
          duration,
          requestedBy: message.author.username,
        };
        if (!getQueue({ guild: message.guild.id })) {
          const player = createAudioPlayer();
          player.on("stateChange", async (oldState, newState) => {
            console.log(
              "state chnged from",
              oldState.status,
              "to",
              newState.status
            );
            if (newState.status === "idle") {
              const next = nextSong({ guild: message.guild.id });
              if (next) {
                player.play(makeResource(next.url));
                await message.reply(`Playing ${next.title}`);
              } else {
                await message.reply("No more songs in queue");
              }
            }
          });
          addSong({ guild: message.guild.id, song, player });
          voiceConnection.subscribe(
            getQueue({ guild: message.guild.id }).player
          );
          await message.reply(`Playing ${title}`);
          player.play(makeResource(url));
        } else {
          addSong({ guild: message.guild.id, song });
          message.reply("Song added to queue");
        }
      } catch (error) {
        console.log(error);
        await message.reply("Could not play song");
      }
    },
  },
  // this command displays the song that is currently playing
};
