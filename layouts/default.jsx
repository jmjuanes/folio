const React = require("react");
const {Container} = require("@josemi-ui/components/cjs");
const {Navigation, NavigationMenu, NavigationCollapse} = require("@josemi-ui/components/cjs");
const {NavigationBrand, NavigationLink, NavigationAction} = require("@josemi-ui/components/cjs");

const FooterLink = props => (
    <a href={props.url} target={props.target} className="font-medium text-neutral-800">
        <span>{props.text}</span>
    </a>
);

const Layout = props => (
    <React.Fragment>
        <Navigation className="max-w-7xl">
            <NavigationBrand href="./" >folio.</NavigationBrand>
            <NavigationMenu>
                <NavigationCollapse>
                    <NavigationLink href="./#features">
                        <strong>Features</strong>
                    </NavigationLink>
                </NavigationCollapse>
                <NavigationAction href="./dashboard">
                    <div><b>Try Folio</b> - <i>for free!</i></div>
                </NavigationAction>
            </NavigationMenu>
        </Navigation>
        <Container className="max-w-6xl">
            {props.children}
        </Container>
        <Container className="max-w-6xl mt-16 mb-20 text-neutral-500">
            <div className="bg-neutral-200 h-px mb-8" />
            <div className="mb-1 text-neutral-500">
                <span><b className="text-neutral-950 font-black text-lg">folio.</b> <span className="text-xs">v{props.version}</span></span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-sm">
                {(props.footerLinks || []).map(link => (
                    <FooterLink key={link.url} {...link} />
                ))}
            </div>
            <div className="text-xs mb-1">
                Designed by <a href="https://www.josemi.xyz" className="text-neutral-800" target="_blank">Josemi</a> in Valencia, Spain. 
                Source code is available on <a href="https://github.com/jmjuanes/folio" className="text-neutral-800" target="_blank">GitHub</a>.
            </div>
            <div className="text-xs">
                <span>This site does not track you.</span>
            </div>
        </Container>
    </React.Fragment>
);

Layout.defaultProps = {
    version: "",
    footerLinks: [
        {url: "./privacy", target: "_self", text: "Privacy"},
        {url: "https://github.com/jmjuanes/folio/issues", target: "_blank", text: "Report a bug"},
    ],
};

module.exports = Layout;
