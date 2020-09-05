exports.run = (client, message, args) => {
  const serverQueue = message.client.queue.get(message.guild.id);
  if (!serverQueue) return message.channel.send("Nic nie gra.");
  return message.channel.send(`
__**Kolejka utworów:**__

${serverQueue.songs.map((song) => `**-** ${song.title}`).join("\n")}

**Teraz gra:** ${serverQueue.songs[0].title}
		`);
};
