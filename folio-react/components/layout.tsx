import { Fragment } from "react";
import { Part, WorkbenchSlot } from "../contexts/workbench.tsx";
import type { PropsWithChildren, JSX } from "react";

export const Layout = (props: PropsWithChildren): JSX.Element => {
    return (
        <Fragment>
            {props.children}
            <div className="absolute top-0 left-0 flex flex-col items-stretch gap-2 w-full h-full min-h-0 min-w-0 p-4 pointer-events-none">
                <WorkbenchSlot part={Part.TITLEBAR} render={content => (
                    <div className="relative w-full">
                        {content}
                    </div>
                )} />
                <div className="flex items-stretch grow-1">
                    <WorkbenchSlot part={Part.SIDEBAR} render={content => (
                        <div className="relative h-full flex flex-col items-stretch gap-2">
                            {content}
                        </div>
                    )} />
                    <WorkbenchSlot part={Part.CANVAS} render={content => (
                        <div className="relative grow-1">
                            {content}
                        </div>
                    )} />
                    <WorkbenchSlot part={Part.AUXILIARYBAR} render={content => (
                        <div className="relative h-full flex flex-col items-stretch gap-2">
                            {content}
                        </div>
                    )} />
                </div>
                <WorkbenchSlot part={Part.STATUSBAR} render={content => (
                    <div className="relative w-full">
                        {content}
                    </div>
                )} />
            </div>
            <WorkbenchSlot part={Part.SURFACE} />
        </Fragment>
    );
};
