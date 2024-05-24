import {STICKERS} from "./constants.js";

// Registry with all available stickers
export const stickers = {
};

// @description get the sticker image by id
export const getStickerImage = sticker => {
    return stickers[sticker] ?? "";
};