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

const BOT_AVATAR = "https://raw.githubusercontent.com/rohittp0/Punarjani/main/bot-avatar.png";
 

 
/**
  * This function generate a embed for !help 
  * @author SANU MUHAMMED C
  * 
  * 
  * @returns {Discord.MessageEmbed} 
  */
function infoEmbed()
{ 
	const embedObject = new Discord.MessageEmbed()
		.setColor("#f9cf03")
		.setTitle("Hello awesome human 👋\nIam PUNARJANI 😇")
		.setDescription("Iam here to help you ease the process of messaging on DISCORD in the this worse scenario of COVID 19 pandemic, to avail the facility of Covid vaccination ASAP 🤩 !!!\n\n❎ My services:\n\n👉I can give you hourly updates on slots available in COWIN site.\n👉You will be able to register early so that you never miss a chance to take vaccine\n👉you can even manually check the slots in any districts\n👉I can can Navigate you to COWIN site if slot available\nAnd lot more .....\n\n")
		.setThumbnail(BOT_AVATAR)
		.addFields({ name:"I can help you to book vaccine slots and thus protect you from Covid-19, thank me later 🤭", value: "\0" })
		.addFields({ name:"I was created as a part of 'build from home' event conducted by tinker hub🤖", value: "\0" })
		.addFields({ name:"Creators❤️:\nRohit TP\nSunith VS\nSanuMuhammed C\n", value: "\0" })
		.addFields({ name:"You can add me to your server so that I can work for you😎\nTo add me in your server visit 👉 https://discord.com/oauth2/authorize?client_id=843422427185807380&scope=bot&permissions=445504🌐", value: "\0" })
		.setTimestamp()
		.setFooter("Use me 👽 and get well👍");
 
     
	return embedObject;
}
 

 
 
/**
  * This function handle the !info command and send corresponding embed
  * 
  * @author SANU MUHAMMED C
  * @param {Discord.Message} message The message that initiated this command.
  * @param {Array<string>} args Array containing district, age and user id.
  * @returns {Promise<Boolean>} Indicates operation success or failure.
  */
// eslint-disable-next-line no-unused-vars
export default async function info (message, args) 
{
	
	await message.channel.send(infoEmbed()).catch();
     
	return true;
}
 
