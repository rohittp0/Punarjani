/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  SANU MUHAMMED C
 * 
 *  This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>. 
 */

import Discord from "discord.js";
import { BOT_AVATAR } from "../consts";

/**
  * This function handle the !info command and send corresponding embed
  * 
  * @author SANU MUHAMMED C
  * @param {{channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel}} message The message that initiated this command.
  * @returns {Promise<Boolean>} Indicates operation success or failure.
  */
export default async function info ({channel}) 
{
	
	return channel.send(new Discord.MessageEmbed()
		.setColor("#f9cf03")
		.setTitle("Hello awesome human 👋\nI am Punarjani 😇")
		.setDescription(`I am here to help you get CoWin slot ASAP 🤩 !!!\n

🛎️ My services:\n
👉 I can give you hourly updates on slots available in COWIN site.
👉 You will be able to register early so that you never miss a chance to take vaccine
👉 You can even manually check the slots in any districts
👉 I can can Navigate you to COWIN site if slot available
And lot more .....\n\n`
		)
		.addFields({ name:"I was created as a part of 'build from home' event conducted by tinker hub🤖", value: "\0" })
		.addFields({ name:"Creators❤️ \nRohit TP\nSunith VS\nSanu Muhammed C\n", value: "\0" })
		.addFields({ name:"To add me to your server visit 👉 https://discord.com/oauth2/authorize?client_id=843422427185807380&scope=bot&permissions=445504", value: "\0" })
		.setFooter("Use me 👽 be well 👍")
		.setThumbnail(BOT_AVATAR))
		.then(() => true);
}
 
