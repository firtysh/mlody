import legacyComands from '../commands/legacyCommands.js';

export default ({ cmd, message, client }) => {
  if (cmd) {
    const { command, args } = cmd;
    if (legacyComands[command]) {
      try {
        legacyComands[command].execute({ message, args, client });
      } catch (error) {
        console.log('error from', error);
      }
    } else {
      message.reply('Command not found');
    }
  }
};
