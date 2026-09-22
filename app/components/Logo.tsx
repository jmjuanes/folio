import classNames from "classnames";
import { logo } from "../styles/components.css";
import type { CSSProperties, JSX } from "react";

export type LogoProps = {
    className?: string;
    style?: CSSProperties;
};

export const Logo = (props: LogoProps): JSX.Element => (
    <div className={classNames(logo, props.className)} style={props.style}>
        <span>Folio</span>
    </div>
);
