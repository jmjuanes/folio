const React = require("react");
const {Container} = require("@josemi-ui/components/cjs");
const {Navigation, NavigationMenu, NavigationCollapse} = require("@josemi-ui/components/cjs");
const {NavigationBrand, NavigationLink, NavigationAction} = require("@josemi-ui/components/cjs");

const Layout = props => {
    const handleRedirect = event => {
        if (typeof props.onRedirect === "function") {
            event.preventDefault();
            props.onRedirect(event.currentTarget.getAttribute("href"));
        }
    };
    return (
        <React.Fragment>
            <Navigation className="max-w-7xl">
                <NavigationBrand href="./" >folio.</NavigationBrand>
                <NavigationMenu>
                    {props.logged && (
                        <React.Fragment>
                            <NavigationCollapse>
                                <NavigationLink href="./dashboard" onClick={handleRedirect}>
                                    <strong>Dashboard</strong>
                                </NavigationLink>
                            </NavigationCollapse>
                            <NavigationAction onClick={props.onCreate}>
                                <div className="font-bold">Create Board</div>
                            </NavigationAction>
                        </React.Fragment>
                    )}
                    {!props.logged && (
                        <React.Fragment>
                            <NavigationCollapse>
                                <NavigationLink href="./#features">
                                    <strong>Features</strong>
                                </NavigationLink>
                            </NavigationCollapse>
                            <NavigationAction href="./dashboard">
                                <div className="font-bold">Try Folio</div>
                            </NavigationAction>
                        </React.Fragment>
                    )}
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
                    {props.footerLinks.map(link => (
                        <a key={link.url} href={link.url} target={link.target} className="text-neutral-800">
                            <strong>{link.text}</strong>
                        </a>
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
};

Layout.defaultProps = {
    logged: false,
    version: "",
    onCreate: null,
    onRedirect: null,
    footerLinks: [
        {url: "./privacy", target: "_self", text: "Privacy"},
        {url: "https://github.com/jmjuanes/folio/issues", target: "_blank", text: "Report a bug"},
    ],
};

module.exports = Layout;
