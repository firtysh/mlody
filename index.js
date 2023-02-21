import { config } from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import legacyHandler from "./handlers/legacyHandler.js";
import slashHandler from "./handlers/slashHandler.js";
import parseMessage from "./utils/parseMessage.js";

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});
client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  try {
    if (message.author.bot) return;
    const cmd = parseMessage(message.content);
    legacyHandler({ cmd, message, client });
  } catch (error) {
    console.log("erroro from messageCreate", error);
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isCommand()) return;
  slashHandler(interaction);
});

client.login(process.env.DISCORD_TOKEN);
