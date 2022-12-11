export const loadImage = src => {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", error => reject(error));
        img.src = src;
    });
};
