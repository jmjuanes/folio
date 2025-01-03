import fs from "node:fs";
import * as marked from "marked";

// @description this method formats a date object and returns an string with the format 'YYYY-MM-DD'
// Source: https://stackoverflow.com/a/29774197
const formatDate = date => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000)).toISOString().split("T")[0];
};

// @description this method reads the CHANGELOG.md file and returns an array of objects with the changelog data
export const getChangelogData = changelogPath => {
    const items = [];
    let lastItem = null;
    fs.readFileSync(changelogPath, "utf8")
        .split("\n") // .slice(1)
        .filter(line => !!line.trim())
        .forEach(line => {
            // Check for heading 2 --> new changelog item
            if (line.startsWith("# ")) {
                const match = line.match(/#\s+(v[\d\.]+)\s+\(([\w\s,]+)\)\s+(.*)/);
                items.push({
                    version: match[1],
                    date: match[2],
                    url: formatDate(new Date(match[2])) + "-" + match[3].toLowerCase().trim().replaceAll(" ", "-"),
                    title: match[3].trim(),
                    content: [],
                });
                lastItem = items[items.length - 1];
            }
            // Check for item description
            else if (line.startsWith("> ") && lastItem.content.length === 0) {
                lastItem.description = line.slice(1).trim();
            }
            // Other case
            else {
                lastItem.content.push(line.trim());
            }
        });
    // Fix the content field of all items
    items.forEach(item => {
        item.content = marked.parse(item.content.join("\n"));
    });
    return items;
};
