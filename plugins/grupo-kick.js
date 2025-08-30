var handler = async (m, { conn, args }) => {
   
    const groupMetadata = await conn.groupMetadata(m.chat);

    // Debug: mostrar participantes y sus roles en consola
    console.log('🔎 Participantes del grupo:');
    groupMetadata.participants.forEach(p => {
        console.log(`- ${p.id} admin: ${p.admin || 'miembro'}`);
    });

    // Buscar info del usuario que manda el comando
    const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);

    console.log('🔎 Info usuario que manda:', userParticipant);

    // Obtener usuario a expulsar
    let user;
    if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted) {
        user = m.quoted.sender;
    } else if (args[0]) {
        const number = args[0].replace(/[^0-9]/g, '');
        if (!number) return m.reply('⚠️ Número inválido.');
        user = number + '@s.whatsapp.net';
    } else {
        return m.reply('⚠️ Mencioná, respondé o escribí un número para expulsar.');
    }

    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    if (user === conn.user.jid) return m.reply(`❌ *No puedes expulsar al mismo bot.`);
    if (user === ownerGroup) return m.reply(`❌ *No puedo expulsar al _creador del grupo_*`);
    if (user === ownerBot) return m.reply(`❌ *No puedo expulsar a mi creador.*`);

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
        await m.reply(`🚷 *El usuario @${user.split("@")[0]} ha sido expulsado del grupo.*`);
    } catch (e) {
        await m.reply(`No pude expulsar al usuario.`);
    }
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.command = ['kick','echar','hechar','sacar'];

export default handler;
