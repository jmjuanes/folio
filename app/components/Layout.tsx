import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar.tsx";
import * as styles from "../styles/components.css";

import type { JSX } from "react";

export const Layout = (): JSX.Element => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.layoutContent}>
                <Outlet />
            </div>
        </div>
    );
};
