import {STICKERS} from "./constants.js";
import smilingFaceWithHeartEyesImage from "../resources/stickers/smiling-face-with-heart-eyes.svg";
import faceWithTearsOfJoyImage from "../resources/stickers/face-with-tears-of-joy.svg";
import confusedFaceImage from "../resources/stickers/confused-face.svg";
import smilingFaceWithSunglasesImage from "../resources/stickers/smiling-face-with-sunglases.svg";
// import smilingFaceImage from "../resources/stickers/smiling-face.svg";
// import nerdFaceImage from "../resources/stickers/nerd-face.svg";
import anguishedFaceImage from "../resources/stickers/anguished-face.svg";
import heartImage from "../resources/stickers/heart.svg";
import thumbsUpImage from "../resources/stickers/thumbs-up.svg";
import thumbsDownImage from "../resources/stickers/thumbs-down.svg";

// Registry with all available stickers
export const stickers = {
    // [STICKERS.SMILING_FACE]: smilingFaceImage,
    [STICKERS.SMILING_FACE_WITH_SUNGLASES]: smilingFaceWithSunglasesImage,
    [STICKERS.SMILING_FACE_WITH_HEART_EYES]: smilingFaceWithHeartEyesImage,
    [STICKERS.FACE_WITH_TEARS_OF_JOY]: faceWithTearsOfJoyImage,
    [STICKERS.CONFUSED_FACE]: confusedFaceImage,
    [STICKERS.ANGUISHED_FACE]: anguishedFaceImage,
    [STICKERS.HEART]: heartImage,
    [STICKERS.THUMBS_UP]: thumbsUpImage,
    [STICKERS.THUMBS_DOWN]: thumbsDownImage,
};

// @description get the sticker image by id
export const getStickerImage = sticker => {
    return stickers[sticker] ?? "";
};