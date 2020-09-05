exports.run = (client, message, args) => {
  const { channel } = message.member.voice;
  if (!channel)
    return message.channel.send(
      "Przepraszam, ale aby odtwarzać muzykę, musisz być na kanale głosowym!"
    );
  const serverQueue = message.client.queue.get(message.guild.id);
  if (!serverQueue) return message.channel.send("Nic nie gra.");
  if (!args[0])
    return message.channel.send(
      `Bieżąca głośność to: **${serverQueue.volume}**`
    );
  serverQueue.volume = args[0]; 
  serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 5);
  return message.channel.send(`Ustawiłem głośność na: **${args[0]}**`);
};
