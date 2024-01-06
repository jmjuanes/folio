import React from "react";
import {Container} from "@josemi-ui/components/cjs";
import {Navigation, NavigationMenu, NavigationCollapse} from "@josemi-ui/components/cjs";
import {NavigationBrand, NavigationLink, NavigationAction} from "@josemi-ui/components/cjs";

const AppNavigation = props => {
    const handleRedirect = event => {
        if (typeof props.onRedirect === "function") {
            event.preventDefault();
            props.onRedirect(event.currentTarget.getAttribute("href"));
        }
    };
    return (
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
    );
};

const Layout = props => (
    <React.Fragment>
        <Navigation className="max-w-7xl">
            <NavigationBrand href="./" >folio.</NavigationBrand>
            <NavigationMenu>
                <AppNavigation
                    onRedirect={props.onRedirect}
                    onCreate={props.onCreate}
                />
            </NavigationMenu>
        </Navigation>
        <Container className="max-w-6xl">
            {props.children}
        </Container>
        <Container className="max-w-6xl mt-16 mb-20 text-neutral-500">
            <div className="text-xs">
                <span><b className="font-black text-sm">folio.</b> v{props.version}</span>
            </div>
        </Container>
    </React.Fragment>
);

Layout.defaultProps = {
    version: "",
    onCreate: null,
    onRedirect: null,
};

export default Layout;
