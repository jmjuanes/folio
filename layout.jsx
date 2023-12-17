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
                    <NavigationCollapse>
                        <NavigationLink href="./dashboard" onClick={handleRedirect}>
                            <strong>Dashboard</strong>
                        </NavigationLink>
                    </NavigationCollapse>
                    <NavigationAction onClick={props.onCreate}>
                        <div className="font-bold">Create Board</div>
                    </NavigationAction>
                </NavigationMenu>
            </Navigation>
            <Container className="max-w-6xl">
                {props.children}
            </Container>
            <Container className="max-w-6xl mt-16 text-neutral-500">
                <div className="bg-neutral-200 h-px mb-8" />
                <div className="mb-2 text-neutral-800 text-sm">
                    <span><b>Folio</b> v{props.version}</span>
                </div>
                <div className="text-xs">
                    Designed by <a href="https://www.josemi.xyz" className="text-neutral-800" target="_blank">Josemi</a> in Valencia, Spain.
                </div>
            </Container>
        </React.Fragment>
    );
};

Layout.defaultProps = {
    version: "",
    onCreate: null,
    onRedirect: null,
};

module.exports = Layout;
