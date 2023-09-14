// List of available versions of Folio to launch
const folioVersions = {
    folio: {
        name: "Folio",
        buttonLink: "./app",
        buttonText: "Open Folio",
        features: [
            `Suitable for detailed artwork and projects.`,
            `Full suite of drawing tools.`,
            `Supports <b>multiple boards</b>, allowing you to create and manage various projects simultaneously.`,
            `Data is stored locally, ensuring your privacy and control.`,
        ],
    },
    folioLite: {
        name: `Folio<span class="o-70">Lite</span>`,
        buttonLink: "./lite",
        buttonText: "Open Folio Lite",
        features: [
            `Ideal for single-focused tasks.`,
            `Comprehensive set of drawing tools.`,
            `Limited to <b>a single board</b>.`,
            `Data is stored locally, ensuring your privacy and control.`,
        ],
    },
};

// Get launcher template
const getLauncherTemplate = () => {
    const template = document.createElement("template");
    template.innerHTML = `
        <div data-role="launcher-modal" class="hidden">
            <div class="fixed w-full h-full bg-gray-900 o-50 z-9 top-0 left-0"></div>
            <div class="fixed w-full h-full flex items-center justify-center z-10 top-0 left-0">
                <div class="border-4 border-gray-900 bg-white w-full maxw-md p-8" style="border-radius:2rem;">
                    <div data-role="close" class="flex justify-center text-gray-900 hover:text-gray-700 cursor-pointer text-4xl mb-4">
                        <svg width="1em" height="1em"><use xlink:href="sprite.svg#close"></use></svg>
                    </div>
                    <div class="flex flex-col items-center mb-8 selec-none">
                        <div class="text-center font-crimson tracking-tight leading-none text-6xl mb-2">Get Started</div>
                        <div class="">Select the version of <b>Folio</b> you want to open:</div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl border-4 border-gray-900 p-2">
                        ${Object.keys(folioVersions).map(key => (`
                        <div data-role="tab" data-id="${key}" class="">
                            <span>${folioVersions[key].name}</span>
                        </div>
                        `)).join("")}
                    </div>
                    ${Object.keys(folioVersions).map(key => (`
                    <div data-role="features" data-id="${key}" class="hidden">
                        <div class="my-6 h-48">
                            ${folioVersions[key].features.map(feature => (`
                            <div class="flex gap-2 mb-2">
                                <div class="flex text-xl">
                                    <svg width="1em" height="1em"><use xlink:href="sprite.svg#check"></use></svg>
                                </div>
                                <div class="text-md">${feature}</div>
                            </div>
                            `)).join("")}
                        </div>
                        <div class="mt-6">
                            <a href="${folioVersions[key].buttonLink}" class="no-underline group text-gray-900">
                                <div class="flex items-center justify-center gap-2 border-4 border-gray-900 group-hover:bg-gray-900 group-hover:text-white px-3 py-2 rounded-xl">
                                    <div class="font-bold">${folioVersions[key].buttonText}</div>
                                    <div class="flex text-xl">
                                        <svg width="1em" height="1em"><use xlink:href="sprite.svg#arrow-right"></use></svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    `)).join("")}
                </div>          
            </div>
        </div>
    `.trim();
    return template.content.firstChild;
};

// Change tab in the provided launcher element
const handleTabChange = (template, tab) => {
    const activeTabClass = "font-crimson tracking-tight leading-none text-4xl text-center p-4 rounded-lg bg-gray-900 text-white";
    const inactiveTabClass = "font-crimson tracking-tight leading-none text-4xl text-center p-4 rounded-lg hover:bg-gray-300 cursor-pointer";
    // Change the style of the current active class
    Array.from(template.querySelectorAll(`div[data-role="tab"]`)).forEach(element => {
        element.className = element.dataset.id === tab ? activeTabClass : inactiveTabClass;
    });
    // Display features of the current tab
    Array.from(template.querySelectorAll(`div[data-role="features"]`)).forEach(element => {
        element.className = element.dataset.id === tab ? "block" : "hidden";
    });
};

window.addEventListener("DOMContentLoaded", () => {
    const launcher = getLauncherTemplate();
    launcher.querySelector(`div[data-role="close"]`).addEventListener("click", () => {
        // document.body.removeChild(launcher);
        launcher.className = "hidden";
    });
    // Register listener to change tab
    Array.from(launcher.querySelectorAll(`div[data-role="tab"]`)).forEach(tabElement => {
        tabElement.addEventListener("click", () => handleTabChange(launcher, tabElement.dataset.id));
    });
    // Append launcher code
    document.body.appendChild(launcher);

    // Register listeners for all buttons that should open the launcher
    Array.from(document.querySelectorAll(`[data-role="launcher-btn"]`)).forEach(element => {
        element.addEventListener("click", event => {
            event.preventDefault();
            handleTabChange(launcher, Object.keys(folioVersions)[0]);
            launcher.className = "block";
        });
    });
});
