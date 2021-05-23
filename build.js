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
