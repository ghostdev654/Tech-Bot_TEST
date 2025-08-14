let handler = async (m, { conn }) => {
    // Si cita un mensaje, revisa ese usuario, si no, al que ejecuta el comando
    let targetJid = m.quoted ? m.quoted.sender : m.sender
    const nombre = await conn.getName(targetJid)

    let isBusiness = null // null = no verificado, true = business, false = normal

    try {
        // 1️⃣ Intentar método oficial
        try {
            const profile = await conn.fetchBusinessProfile(targetJid)
            if (profile && (profile.verifiedName || profile.description || profile.wid)) {
                isBusiness = true
            } else {
                isBusiness = false
            }
        } catch {
            // ignorar error y pasar al siguiente método
        }

        // 2️⃣ Si no se pudo determinar, intentar con onWhatsApp
        if (isBusiness === null) {
            try {
                const waInfo = await conn.onWhatsApp(targetJid)
                if (waInfo?.[0]?.verifiedName) {
                    isBusiness = true
                } else if (waInfo?.length) {
                    isBusiness = false
                }
            } catch {}
        }

        // 3️⃣ Resultado final
        let respuesta
        if (isBusiness === true) {
            respuesta = `✅ *${nombre}* usa *WhatsApp Business*.`
        } else if (isBusiness === false) {
            respuesta = `❌ *${nombre}* usa *WhatsApp normal*.`
        } else {
            respuesta = `⚠️ No se pudo determinar si *${nombre}* usa WhatsApp Business.`
        }

        await conn.reply(m.chat, respuesta, m)

    } catch (err) {
        console.error(err)
        await conn.reply(m.chat, '⚠️ Error al verificar el tipo de cuenta.', m)
    }
}

handler.command = ["isbsn"]
export default handler
