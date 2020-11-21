import fs from "fs";
import path from "path";

const {readFileSync} = fs;
const {resolve} = path;

export default function load_html(file) {
  const data = readFileSync(resolve(__dirname, file), "utf-8");
  const parser = new DOMParser;
  const doc = parser.parseFromString(data, "text/html");
  return doc.body.firstElementChild;
}