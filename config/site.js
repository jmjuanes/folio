const pkg = require("../package.json");

module.exports = {
    title: "Folio",
    description: "Folio is a digital whiteboard for sketching and prototyping",
    url: "https://josemi.xyz/folio",
    version: pkg.version,
    license: pkg.license,
    repository: pkg.repository,
    readme: pkg.repository + "#readme",
    navLinks: [
        {url: "./#features", text: "Features"},
        {url: "https://github.com/jmjuanes/folio", target: "_blank", text: "GitHub"},
    ],
    footerLinks: [
        {url: "./privacy", target: "_self", text: "Privacy"},
        {url: "https://github.com/jmjuanes/folio/issues", target: "_blank", text: "Report a bug"},
    ],
    notFoundPageLinks: [
        {url: "./", text: "Home", icon: "home"},
        {url: pkg.repository, text: "Repository", target: "_blnak"},
        {url: pkg.bugs, text: "Report a bug", target: "_blank"},
    ],
};
