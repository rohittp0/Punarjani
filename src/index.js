/* <one line to give the program's name and a brief idea of what it does.>
    Copyright (C) <year>  <name of author>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.*/
import express from "express";
// eslint-disable-next-line no-unused-vars
import { app } from "./common.js";


// Get the port number to be used for hosting defined in .env file.
const PORT = process.env.PORT || 5000;

// Use express to handle get and post requests.
express() // Set ./public as static folder.
	.get("/", (_req,res) => res.end("Ok")) 
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));
