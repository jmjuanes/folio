import fs from "node:fs";
import path from "node:path";
import fm from "front-matter";

// get pages from input folder
export const getPages = (folder, type, parseContent) => {
    return fs.readdirSync(folder, "utf8")
        .filter(file => path.extname(file) === type)
        .map(file => path.join(folder, file))
        .map(file => {
            const content = fm(fs.readFileSync(file, "utf8"));
            return {
                name: path.basename(file, type),
                url: content.attributes?.permalink || (path.basename(file, type) + ".html"),
                data: content.attributes,
                content: parseContent(content.body),
                // content: content.body,
            };
        });
};
