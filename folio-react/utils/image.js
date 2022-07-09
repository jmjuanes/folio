// Create an image element
// https://stackoverflow.com/a/4776378
export const createImage = content => {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = content; // Set image source
    });
};
