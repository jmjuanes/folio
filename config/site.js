const pkg = require("../package.json");

module.exports = {
    name: "folio.",
    repository: pkg.repository,
    version: pkg.version,
    navbar: {
        links: [
            {link: "./#features", text: "Features"},
            {link: "./#pricing", text: "Pricing"},
            {link: "./changelog", text: "Changelog"},
        ],
    },
    footer: {
        links: [
            {link: "./privacy", target: "_self", text: "Privacy"},
            {link: "https://github.com/jmjuanes/folio/issues", target: "_blank", text: "Report a bug"},
        ],
    },
};
