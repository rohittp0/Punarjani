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

import htmlToImage from "node-html-to-image";
import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "html-templates/");
const IMAGES_DIR = path.join(process.cwd(), "images/");

const htmlFiles = fs.readdirSync(TEMPLATES_DIR).filter((file) => file.endsWith(".html"));

console.log(htmlFiles);

if (!fs.existsSync(IMAGES_DIR))
	fs.mkdirSync(IMAGES_DIR);


htmlFiles.forEach((file) => 
	htmlToImage(
		{
			html: fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8"),
			output: path.join(IMAGES_DIR, file.replace(".html", ".png"))
		}));
