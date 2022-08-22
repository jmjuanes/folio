export const readFile = type => {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = type || ".folio";
        input.addEventListener("change", event => {
            if (!event.target.files[0]) {
                return reject(new Error("Invalid file"));
            }
            return resolve(event.target.files[0]);
        });
        input.click();
    });
};

export const downloadFile = file => {
    return new Promise(resolve => {
        const link = document.createElement("a");
        const url = window.URL.createObjectURL(file);
        link.href = url; // Set the link url as the generated url
        link.download = file.name; // Set the filename
        link.click(); // Download the file
        window.URL.revokeObjectURL(url); // Revoke url
        return resolve(true);
    });
};
