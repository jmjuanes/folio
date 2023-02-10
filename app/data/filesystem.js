import {fileOpen, fileSave} from "browser-fs-access";
import {VERSION, MIME_TYPES, FILE_EXTENSIONS} from "folio-core";

export const saveToFilesystem = data => {
    console.log(data);
    // First stringify data object
    const content = JSON.stringify({
        ...data,
        version: VERSION,
    });

    // Create blob
    const blob = new Blob([content], {
        type: MIME_TYPES.FOLIO,
    });

    // Save to the file system
    return fileSave(blob, {
        description: "Folio board",
        fileName: `untitled${FILE_EXTENSIONS.FOLIO}`,
        extensions: [
            FILE_EXTENSIONS.FOLIO,
        ],
    });
};

export const loadFromFileSystem = async () => {
    const blob = await fileOpen({
        description: "Folio Board",
        extensions: [
            FILE_EXTENSIONS.FOLIO,
        ],
        multiple: false,
    });

    // Check if we were not able to read the file
    if (!blob) {
        return null;
    }

    // Read blob as text
    return new Promise(resolve => {
        const file = new FileReader();
        file.onload = event => {
            return resolve(JSON.parse(event.target.result));
        };
        return file.readAsText(blob, "utf8");
    });
};
