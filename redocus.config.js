const fs = require("node:fs/promises");
const path = require("node:path");
const React = require("react");
const {renderIcon} = require("@josemi-icons/react/cjs");
const {Button, Container} = require("@josemi-ui/react/cjs");

const site = require("./config/site.js");

const r = relativePath => path.resolve(process.cwd(), relativePath);

const PageWrapper = props => {
    if (props.page.data.layout === "empty") {
        return props.element;
    }
    return (
        <React.Fragment>
            <div className="w-full border-b border-neutral-200">
                <Container className="max-w-6xl h-16 flex items-center">
                    <a href="./" className="flex items-center no-underline">
                        <span className="text-neutral-950 font-black text-xl">folio.</span>
                    </a>
                    <div className="ml-6 flex items-center gap-2 text-sm">
                        {site.navLinks.map(nav => (
                            <a key={nav.url} href={nav.url} target={nav.target} className="flex">
                                <span className="text-neutral-700 font-medium px-2 py-1 rounded-md hover:bg-neutral-100">
                                    <span>{nav.text}</span>
                                </span>
                            </a>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center justify-end">
                        <Button as="a" href="./app" variant="primary" className="pt-2 pb-2">
                            <span><b>Try folio</b> - <i>it's free!</i></span>
                        </Button>
                    </div>
                </Container>
            </div>
            {props.page.data.layout === "default" && (
                <Container className="max-w-6xl py-16">
                    {props.element}
                </Container>
            )}
            {props.page.data.layout === "page" && (
                <Container className="max-w-4xl py-16">
                    <h1 className="font-black text-4xl leading-none mb-2 text-neutral-950">
                        <span>{props.page.data.title}</span>
                    </h1>
                    <div className="mb-8 text-neutral-700 text-sm">
                        <span><b>Last updated:</b> {props.page.data.date}</span>
                    </div>
                    {props.element}
                </Container>
            )}
            <div className="w-full border-t border-neutral-200">
                <Container className="max-w-6xl pt-8 pb-16 text-neutral-500">
                    <div className="text-xs mb-1">
                        Designed and built by <a href="https://www.josemi.xyz" className="text-neutral-800" target="_blank">Josemi</a> in Valencia, Spain. 
                        Source code is available on <a href="https://github.com/jmjuanes/folio" className="text-neutral-800" target="_blank">GitHub</a>.
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        {(props.site.footerLinks || []).map(link => (
                            <a key={link.url} href={link.url} className="font-medium text-neutral-800 hover:underline">
                                <span>{link.text}</span>
                            </a>
                        ))}
                    </div>
                </Container>
            </div>
        </React.Fragment>
    );
};

module.exports = {
    input: "pages",
    output: "www",
    siteMetadata: site,
    pageComponents: {
        Button: Button,
        Icon: props => renderIcon(props.icon),
        h3: props => <h3 className="mb-4 text-xl font-bold leading-none mt-8 text-neutral-950">{props.children}</h3>,
        ul: props => <ul className="mb-4">{props.children}</ul>,
        li: props => <li className="list-inside mb-1">{props.children}</li>,
        p: props => <p className="mb-4 text-justify">{props.children}</p>,
    },
    pageWrapper: PageWrapper,
    onRender: ({page, ...actions}) => {
        actions.setHtmlAttributes({lang: "en"});
        actions.setHeadComponents([
            <meta key="charset" charSet="utf-8" />,
            <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no" />,
            <meta key="site:title" name="title" content={site.title} />,
            <meta key="site:descr" name="description" content={site.description} />,
            <link key="style:font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" />,
            <link key="style:css" rel="stylesheet" href="./low.css" />,
            <title key="title">{`${page.data.title} - Folio`}</title>,
        ]);
        actions.setBodyAttributes({
            className: "bg-white m-0 p-0 font-inter text-neutral-800 leading-normal",
        });
    },
    onPostBuild: async () => {
        await fs.copyFile(r("./assets/folio-app-cover.png"), r("./www/cover.png"));
        await fs.copyFile(r("./node_modules/lowcss/dist/low.css"), r("./www/low.css"));
    },
};
