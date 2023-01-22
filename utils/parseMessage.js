import { config } from 'dotenv';

config();

export default (message) => {
  if (message.startsWith(process.env.COMMAND_PREFIX)) {
    const [command, args] = message.trim().substring(process.env.COMMAND_PREFIX.length).split(/(?<=^\S+)\s+/);
    return { command, args };
  }
  return null;
};
