// @description check if the provided text is a link
export const isLink = str => {
    return str && str.startsWith("https://") && !str.includes(" ");
};

// @description get information for the provided link
export const getLinkMetadata = link => {
    return Promise.resolve({
        src: link,
        title: null,
        description: null,
        image: null,
    });
};

// @description allows to open the provided link
export const openLink = (link, target = "_blank") => {
    const linkElement = Object.assign(document.createElement("a"), {
        target: target,
        // rel: "noopener noreferrer",
        href: link,
        style: "cursor:pointer;display:none;",
    });
    linkElement.click();
};
