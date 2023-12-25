const React = require("react");
const {renderIcon} = require("@josemi-icons/react/cjs");
const {Layout} = require("./layout.jsx");
const pkg = require("./package.json");

const PageWrapper = props => (
    <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no" />
            <meta name="title" content={props.site.title} />
            <meta name="description" content={props.site.description} />
            <meta property="og:site_name" content={props.site.title} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={props.site.url} />
            <meta property="og:image" content={props.site.url + "/og.png"}/>
            <meta property="og:description" content={props.site.description} />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&display=swap" />
            <link rel="stylesheet" href="./low.css" />
            <title>{`${props.page.data.title} - ${props.site.title}`}</title>
            <style>{`.font-plex {font-family: IBM Plex Serif, serif;}`}</style>
        </head>
        <body className="bg-white m-0 p-0 font-inter text-neutral-800 leading-normal">
            <Layout version={pkg.version}>
                {props.page.data.layout === "default" && (
                    <React.Fragment>
                        {props.element}
                    </React.Fragment>
                )}
            </Layout>
        </body>
    </html>
);

module.exports = {
    input: "pages",
    output: "www",
    siteMetadata: {
        title: "Folio",
        description: "Folio is a digital whiteboard for sketching and prototyping",
        url: "https://",
    },
    pageComponents: {
        Icon: props => renderIcon(props.icon),
    },
    pageWrapper: PageWrapper,
};
