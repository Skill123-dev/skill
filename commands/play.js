const { Util } = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");

exports.run = async (client, message, args) => {
    const { channel } = message.member.voice;
    if (!channel)
      return message.channel.send(
        "Przepraszam, ale aby odtwarzać muzykę, musisz być na kanale głosowym!"
      );
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send(
        "Nie mogę połączyć się z Twoim kanałem głosowym, upewnij się, że mam odpowiednie uprawnienia!"
      );
    if (!permissions.has("SPEAK"))
      return message.channel.send(
        "Nie mogę mówić w tym kanale głosowym, upewnij się, że mam odpowiednie uprawnienia!"
      );
    const youtube = new YouTube(client.config.api);
    var searchString = args.join(" ");
    if (!searchString)
      return message.channel.send("Nie chciałeś, abym chciał grać");
    const serverQueue = message.client.queue.get(message.guild.id);
    var videos = await youtube.searchVideos(searchString).catch(console.log);
    var songInfo = await videos[0].fetch().catch(console.log);

    const song = {
      id: songInfo.video_id,
      title: Util.escapeMarkdown(songInfo.title),
      url: songInfo.url,
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      return message.channel.send(
        `✅ **${song.title}** został dodany do kolejki!`
      );
    }

    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 2,
      playing: true,
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
      if (!song) {
        queue.voiceChannel.leave();
        message.client.queue.delete(message.guild.id);
        return;
      }

      const dispatcher = queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          queue.songs.shift();
          play(queue.songs[0]);
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(queue.volume / 5);
      queue.textChannel.send(`🎶 Zacznij grać: **${song.title}**`);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`Nie mogłem dołączyć do kanału głosowego: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel.send(
        `Nie mogłem dołączyć do kanału głosowego: ${error}`
      );
    }
};
