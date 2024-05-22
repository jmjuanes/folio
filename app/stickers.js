import {STICKERS} from "./constants.js";
import heartImage from "./assets/stickers/heart.svg";
import hundredPointsImage from "./assets/stickers/hundred-points.svg";
import partyPopperImage from "./assets/stickers/party-popper.svg";
import smilingFaceWithHeartEyesImage from "./assets/stickers/smiling-face-with-heart-eyes.svg";
import thumbsUpImage from "./assets/stickers/thumbs-up.svg";
import thumbsDownImage from "./assets/stickers/thumbs-down.svg";
import clappingHandsImage from "./assets/stickers/clapping-hands.svg";
import starImage from "./assets/stickers/star.svg";
import winkingFaceImage from "./assets/stickers/winking-face.svg";
import grinningFaceWithSmilingEyesImage from "./assets/stickers/grinning-face-with-smiling-eyes.svg";
import confusedFaceImage from "./assets/stickers/confused-face.svg";
import faceWithTearsOfJoyImage from "./assets/stickers/face-with-tears-of-joy.svg";
import partyingFaceImage from "./assets/stickers/partying-face.svg";
import topImage from "./assets/stickers/top.svg";
import eyesImage from "./assets/stickers/eyes.svg";
import smilingFaceWithSunglassesImage from "./assets/stickers/smiling-face-with-sunglasses.svg";
import magicWandImage from "./assets/stickers/magic-wand.svg";
import questionMarkImage from "./assets/stickers/question-mark.svg";
import zanyFaceImage from "./assets/stickers/zany-face.svg";
import medalImage from "./assets/stickers/medal.svg";
import nerdFaceImage from "./assets/stickers/nerd-face.svg";
import thinkingFaceImage from "./assets/stickers/thinking-face.svg";
import pileOfPooImage from "./assets/stickers/pile-of-poo.svg";
import hushedFaceImage from "./assets/stickers/hushed-face.svg";
import okHandImage from "./assets/stickers/ok-hand.svg";
import raisingHandsImage from "./assets/stickers/raising-hands.svg";
import checkMarkImage from "./assets/stickers/check-mark.svg";
import crossMarkImage from "./assets/stickers/cross-mark.svg";
import faceWithPeekingEyeImage from "./assets/stickers/face-with-peeking-eye.svg";
import raccoonImage from "./assets/stickers/raccoon.svg";
import trophyImage from "./assets/stickers/trophy.svg";
import catFaceImage from "./assets/stickers/cat-face.svg";
import dogFaceImage from "./assets/stickers/dog-face.svg";
import mouseFaceImage from "./assets/stickers/mouse-face.svg";
import exclamationMarkImage from "./assets/stickers/exclamation-mark.svg";

// Registry with all available stickers
export const stickers = {
    [STICKERS.SMILING_FACE_WITH_HEART_EYES]: smilingFaceWithHeartEyesImage,
    [STICKERS.HEART]: heartImage,
    [STICKERS.HUNDRED_POINTS]: hundredPointsImage,
    [STICKERS.THUMBS_UP]: thumbsUpImage,
    [STICKERS.THUMBS_DOWN]: thumbsDownImage,
    [STICKERS.PARTY_POPPER]: partyPopperImage,
    [STICKERS.CLAPPING_HANDS]: clappingHandsImage,
    [STICKERS.STAR]: starImage,
    [STICKERS.WINKING_FACE]: winkingFaceImage,
    [STICKERS.GRINNING_FACE_WITH_SMILING_EYES]: grinningFaceWithSmilingEyesImage,
    [STICKERS.CONFUSED_FACE]: confusedFaceImage,
    [STICKERS.FACE_WITH_TEARS_OF_JOY]: faceWithTearsOfJoyImage,
    [STICKERS.PARTYING_FACE]: partyingFaceImage,
    [STICKERS.TOP]: topImage,
    [STICKERS.EYES]: eyesImage,
    [STICKERS.SMILING_FACE_WITH_SUNGLASSES]: smilingFaceWithSunglassesImage,
    [STICKERS.MAGIC_WAND]: magicWandImage,
    [STICKERS.QUESTION_MARK]: questionMarkImage,
    [STICKERS.ZANY_FACE]: zanyFaceImage,
    [STICKERS.MEDAL]: medalImage,
    [STICKERS.NERD_FACE]: nerdFaceImage,
    [STICKERS.THINKING_FACE]: thinkingFaceImage,
    [STICKERS.PILE_OF_POO]: pileOfPooImage,
    [STICKERS.HUSHED_FACE]: hushedFaceImage,
    [STICKERS.OK_HAND]: okHandImage,
    [STICKERS.RAISING_HANDS]: raisingHandsImage,
    [STICKERS.CHECK_MARK]: checkMarkImage,
    [STICKERS.CROSS_MARK]: crossMarkImage,
    [STICKERS.FACE_WITH_PEEKING_EYE]: faceWithPeekingEyeImage,
    [STICKERS.RACCOON]: raccoonImage,
    [STICKERS.TROPHY]: trophyImage,
    [STICKERS.CAT_FACE]: catFaceImage,
    [STICKERS.DOG_FACE]: dogFaceImage,
    [STICKERS.MOUSE_FACE]: mouseFaceImage,
    [STICKERS.EXCLAMATION_MARK]: exclamationMarkImage,
};

// @description get the sticker image by id
export const getStickerPath = sticker => {
    return stickers[sticker] ?? "";
};
