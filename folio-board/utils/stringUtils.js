// Generate a random identifier
// Source: https://michalzalecki.com/generate-unique-id-in-the-browser-without-a-library/ 
export const generateRandomId = () => {
    return (window.crypto.getRandomValues(new Uint32Array(1))[0]).toString(16);
};
