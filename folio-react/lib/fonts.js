import {blobToDataUrl} from "../utils/blob.js";

// we keep a cache of the imported fonts to avoid fetching them multiple times
const fontsCache = {};

const loadFontFromUrl = async fontUrl => {
    if (!fontsCache[fontUrl]) {
        const response = await fetch(fontUrl)
        const cssText = await response.text()
        fontsCache[fontUrl] = await importFontsFromCss(cssText)
    }
    return fontsCache[fontUrl];
};

const importFontsFromCss = cssText => {
    const output = {
        css: cssText,
    };
    const fontFilesToImport = cssText.match(/https:\/\/[^)]+/g);
    const fontFilesPromises = fontFilesToImport.map(fileUrl => {
        return fetch(fileUrl)
            .then(response => response.blob())
            .then(blob => blobToDataUrl(blob))
            .then(data => {
                output.css = output.css.replace(fileUrl, data);
                return true;
            });
    });
    return Promise.all(fontFilesPromises).then(() => output.css);
};

// get CSS to embed fonts as <style> tag
export const getFontsCss = (fonts, embedFonts = true) => {
    if (!embedFonts) {
        const fontsImports = fonts.map(font => `@import url('${font}');`);
        return Promise.resolve(fontsImports.join("\n"))
    }
    const fontsPromises = fonts.map(fontUrl => {
        return loadFontFromUrl(fontUrl);
    });
    return Promise.all(fontsPromises).then(result => {
        return result.join("\n");
    });
};
