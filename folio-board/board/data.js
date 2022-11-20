// Get pasted items
export const getDataFromClipboard = event => {
    return new Promise(resolve => {
        const items = event?.clipboardData?.items || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i]; // Get current item
            if (item.type.indexOf("image") !== -1) {
                // return resolve({type: "image", blob: item.getAsFile()});
                return resolve({
                    type: "image",
                    content: item.getAsFile(),
                });
            }
            else if (item.type.indexOf("text") !== -1) {
                return item.getAsString(data => {
                    return resolve({
                        type: "text",
                        content: data.trim(),
                    });
                });
            }
        }
    });
};
