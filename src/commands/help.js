/**
 * Punarjani is a discord bot that notifies you about slot availability at
 * CoWin vaccination centers.
 * Copyright (C) 2021  Rohit TP, Sunith VS, Sanu Muhammed C
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

/**
 * This function handle the !help command and send corresponding embed
 * 
 * @author Sunith V S
 * @param {{channel: {send: Function}}} message The message that initiated this command.
 * @returns {Promise<Boolean>} Indicates operation success or failure.
 */
export default function help ({channel}) 
{
	return channel.send({files: ["images/help.png"]}).then(() => true);	
}
