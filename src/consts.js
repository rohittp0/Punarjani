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
 * @author Rohit T P
 * The time intervale in milliseconds after which to send updates to users
 */
export const UPDATE_FREQUENCY = 3600000; // One hour

/**
 * @author Rohit T P
 * The texts used in various UI elements.
 */
export const TEXTS = 
{
	helpInfo: "Don't worry you can always ask for !help 😉",
	tryAgain: "Don't worry you can try again later 🤘",
	generalError: "Oops something went wrong 😵‍💫",
	infoCollected: "That's all I need to know 👍 I will write it in my 📖 and let you know.",
	regSuccess: "Your registration has been completed 🎊 Welcome to Punarjani 🙋",
	regFailed: "Sorry your registration failed 😞 Looks like I forgot how to write 😵",
	profileDesc: "I found this written in my 📖 about you.",
	ageQuestion: "Hmm you look soo young, tell me your real age?",
	confirmDele: "Are you sure you want to delete your account? 😨",
	noDelete: "Oof that was close 😌, I was really scared.",
	cantTalk: "Some one told my developers that I am too noisy 😡 now I am banned from talking here 😭 ",
	goToDM: "We can still chat in DM 😉,But you have to swear you won't complain on me 🤫",
	hourlyUpdate: "Do you want to get hourly update for CoWin slots ?",
	existingUser: "Hmm you look familiar... Aah I know you have registered a while back, no need to do it again.",
	gotShot: "Did you get your first vaccine shot?",
	phoneError: "That doesn't look like a valid phone number. I need your 10 digit mobile number. ",
	slotsDescription: "Click ☝️ to go to CoWin site. Only showing slots for your age and dose type available on",
	stateQuery: 
	[ 
		"Select The Sate", 
		"Select the state from where you want to get vaccinated. Don't worry you can change it latter." 
	],
	districtQuery:
	[
		"Select The District",
		"Select your preferred district. Only showing districts from the state you selected."
	],
	embedFields: 
	{
		title: "Edit Info",
		description: "Hmm so you have decided to edit your personal details. You can do the following:",
		footer: "To see currently saved details use !profile"
	},
	ageError: "Did you really forget your age, or are you trolling me 🤔",
	stateError: "Registration has been canceled due to invalid state selection 😭",
	districtError: "Registration has been canceled due to invalid district selection 😭",
	notRegistered: "Looks like you haven't registered yet. Use !register to get yourself registered.",
	runningError: "You asked me to do something else complete it first."
};

/**
 * @author Rohit T P
 * The URL to the bot avatar hosted in github.
 */
export const BOT_AVATAR = "https://raw.githubusercontent.com/rohittp0/Punarjani/main/bot-avatar.png";
