const React = require("react");
const {Container} = require("@josemi-ui/layout/cjs");
const {Navbar, NavbarBrand, NavbarLink, NavbarAction, NavbarCollapse} = require("@josemi-ui/layout/cjs");
const {Footer, FooterLink} = require("@josemi-ui/layout/cjs");

const Layout = props => {
    const handleRedirect = event => {
        if (typeof props.onRedirect === "function") {
            event.preventDefault();
            props.onRedirect(event.currentTarget.getAttribute("href"));
        }
    };
    return (
        <React.Fragment>
            <Navbar className="max-w-7xl">
                <NavbarBrand href="./" >folio.</NavbarBrand>
                <NavbarCollapse>
                    <NavbarLink href="./dashboard" onClick={handleRedirect}>
                        <strong>Dashboard</strong>
                    </NavbarLink>
                </NavbarCollapse>
                <NavbarAction onClick={props.onCreate}>
                    <div className="font-bold">Create Board</div>
                </NavbarAction>
            </Navbar>
            <Container className="max-w-6xl">
                {props.children}
            </Container>
            <Footer className="max-w-6xl mt-16">
                <div className="mb-2 text-neutral-800">
                    <span><b>Folio</b> v{props.version}</span>
                </div>
                <div className="text-xs">
                    Designed by <FooterLink href="https://www.josemi.xyz" target="_blank">Josemi</FooterLink> in Valencia, Spain.
                </div>
            </Footer>
        </React.Fragment>
    );
};

Layout.defaultProps = {
    version: "",
    onCreate: null,
    onRedirect: null,
};

module.exports = Layout;
