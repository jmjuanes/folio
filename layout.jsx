const React = require("react");

const Logo = () => (
    <div className="inline-flex items-center gap-1 text-neutral-900">
        <span className="leading-none font-black">folio.</span>
    </div>
);

const Layout = props => (
    <React.Fragment>
        <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center">
            <div className="flex items-center">
                <a href="./" className="flex items-center gap-2 text-neutral-900 no-underline select-none">
                    <div className="flex items-center text-2xl">
                        <Logo />
                    </div>
                </a>
            </div>
        </div>
        <div className="w-full max-w-6xl mx-auto px-6">
            {props.children}
        </div>
        {/* Footer section */}
        <div className="w-full max-w-6xl mx-auto px-6 py-20">
            <div className="w-full h-px bg-neutral-100 mb-8" />
            <div className="flex flex-col">
                <div className="text-sm mb-2">
                    <span><b>Folio</b> v{props.version}</span>
                </div>
                <div className="text-xs text-neutral-500 mb-1">
                    Designed by <a href="https://www.josemi.xyz" target="_blank" className="font-bold hover:underline text-neutral-700">Josemi</a> in Valencia, Spain.
                </div>
            </div>
        </div>
    </React.Fragment>
);

Layout.defaultProps = {
    version: "",
};

module.exports = Layout;
