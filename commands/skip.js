exports.run = (client, message, args) => {
  const { channel } = message.member.voice;
  if (!channel)
    return message.channel.send(
      "Przepraszam, ale aby odtwarzać muzykę, musisz być na kanale głosowym!"
    );
  const serverQueue = message.client.queue.get(message.guild.id);
  if (!serverQueue)
    return message.channel.send(
      "Nie ma nic, co mógłbym dla ciebie pominąć."
    );
  serverQueue.connection.dispatcher.end("Pomiń polecenie zostało użyte!");
};
