import lzString from "lz-string";

export const compress = str => lzString.compressToBase64(str);
export const decompress = str => lzString.decompressFromBase64(str);

// Generate an ID
// Source: https://michalzalecki.com/generate-unique-id-in-the-browser-without-a-library/ 
export const generateID = () => {
    return (window.crypto.getRandomValues(new Uint32Array(1))[0]).toString(16);
};

// Generate hash from specified string content
export const hash = str => {
    const encoder = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", encoder).then(hashBuffer => {
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    });
};

// Create a commit ID
export const createCommit = data => {
    const date = Date.now();
    const patchesStr = compress(JSON.stringify(data.patches || []));
    return hash(`${date}-${data.author}-'${data.message}'-${patchesStr}`).then(id => ({
        id: id,
        date: date,
        author: data.author,
        message: data.message,
        patches: patchesStr,
    }));
};

// Decode a commit
export const decodeCommit = data => {
    return Object.assign({}, data, {
        patches: JSON.parse(decompress(data.patches)),
    });
};

// Create a new empty board
export const createEmptyBoard = options => {
    const board = {
        version: "0",
        id: generateID(),
        name: options.name || "Untitled",
        thumbnail: "",
        commits: [],
    };
    return createCommit("test", "Initial commit", []).then(commit => {
        board.commits.push(commit);
        return board;
    });
};

// Encode board
export const encodeBoard = board => {
    return compress(JSON.stringify(board));
};

// Decode a board
export const decodeBoard = boardStr => {
    return JSON.parse(decompress(boardStr));
};
