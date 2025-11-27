import { Events, Message } from 'discord.js';

export default {
    name: Events.MessageCreate,
    async execute(message:Message ){
        // ignore self client
        if (message.author.bot)
            return;
        // use Regex idk if this will work
        const urlRegex = /(https?:\/\/[^\s]+)/gi;

        // check all the messages
        const found = message.content.match(urlRegex);
        if (urlRegex.test(message.content)) {
            // if actualy found the pattern
            if (found) {
                if (!message.channel.isSendable())return;
                await message.delete().catch(() => {});
                await message.channel.send({
                    content: `URL detected!!!\n <@${message.author.id}> sending url is not allowed here!`
                })
            }
    }
    }
}