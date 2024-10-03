import React from "react";
import {FileIcon, FillIcon} from "@josemi-icons/react";
import {
    BLACK,
    CURSORS,
    HANDLERS,
    NONE,
    SCREENSHOT_STROKE_COLOR,
    SCREENSHOT_STROKE_WIDTH,
    TRANSPARENT,
} from "../constants.js";
import {Handlers} from "./handlers.jsx";
import {SvgContainer} from "./svg.jsx";
import {ObjectDimensions} from "./object-dimensions.jsx";
import {Island} from "./island.jsx";
import {Dropdown} from "./ui/dropdown.jsx";

const getScreenshotCommand = r => {
    return `M0,0 H${r.width} V${r.height} H0 Z M${r.x1},${r.y1} V${r.y2} H${r.x2} V${r.y1} Z`;
};

// generate handlers for the specified region
const getHandlers = region => {
    return [
        {type: HANDLERS.CORNER_TOP_LEFT, x: region.x1, y: region.y1},
        {type: HANDLERS.CORNER_TOP_RIGHT, x: region.x2, y: region.y1},
        {type: HANDLERS.CORNER_BOTTOM_LEFT, x: region.x1, y: region.y2},
        {type: HANDLERS.CORNER_BOTTOM_RIGHT, x: region.x2, y: region.y2},
        {type: HANDLERS.EDGE_TOP, x: (region.x1 + region.x2) / 2, y: region.y1},
        {type: HANDLERS.EDGE_BOTTOM, x: (region.x1 + region.x2) / 2, y: region.y2},
        {type: HANDLERS.EDGE_LEFT, x: region.x1, y: (region.y1 + region.y2) / 2},
        {type: HANDLERS.EDGE_RIGHT, x: region.x2, y: (region.y1 + region.y2) / 2},
    ];
};

export const Screenshot = props => {
    const [region, setRegion] = React.useState(null);
    const [options, setOptions] = React.useReducer((p, s) => ({...p, ...s}), {
        background: true,
    });
    const parent = React.useRef();
    const handlePointerDown = (event, isHandler, isMoving) => {
        event.preventDefault();
        event.stopPropagation();
        const {top, left, width, height} = parent.current.getBoundingClientRect();
        const originalX = event.nativeEvent.clientX - left;
        const originalY = event.nativeEvent.clientY - top;
        const handlerType = isHandler ? event.currentTarget.dataset.handler : null; // get handler type
        // handle pointer move
        const handlePointerMove = event => {
            event.preventDefault();
            const dx = event.clientX - left - originalX;
            const dy = event.clientY - top - originalY;
            // 1. initial click or we a re selecting a new region
            if (!region || (!isHandler && !isMoving)) {
                return setRegion({
                    width: width,
                    height: height,
                    x1: Math.min(originalX, event.clientX - left),
                    y1: Math.min(originalY, event.clientY - top),
                    x2: Math.max(originalX, event.clientX - left),
                    y2: Math.max(originalY, event.clientY - top),
                });
            }
            // 2. user is moving the region
            if (region && isMoving) {
                return setRegion(Object.assign({}, region, {
                    x1: region.x1 + dx,
                    x2: region.x2 + dx,
                    y1: region.y1 + dy,
                    y2: region.y2 + dy,
                }));
            }
            // 3. user clicked on a handler
            const newRegion = Object.assign({}, region); // clone current region
            if (handlerType === HANDLERS.EDGE_TOP) {
                newRegion.y1 = Math.min(region.y1 + dy, region.y2);
            }
            else if (handlerType === HANDLERS.EDGE_BOTTOM) {
                newRegion.y2 = Math.max(region.y1, region.y2 + dy);
            }
            else if (handlerType === HANDLERS.EDGE_LEFT) {
                newRegion.x1 = Math.min(region.x1 + dx, region.x2);
            }
            else if (handlerType === HANDLERS.EDGE_RIGHT) {
                newRegion.x2 = Math.max(region.x1, region.x2 + dx);
            }
            else if (handlerType === HANDLERS.CORNER_TOP_LEFT) {
                newRegion.x1 = Math.min(region.x1 + dx, region.x2);
                newRegion.y1 = Math.min(region.y1 + dy, region.y2);
            }
            else if (handlerType === HANDLERS.CORNER_TOP_RIGHT) {
                newRegion.x2 = Math.max(region.x1, region.x2 + dx);
                newRegion.y1 = Math.min(region.y1 + dy, region.y2);
            }
            else if (handlerType === HANDLERS.CORNER_BOTTOM_LEFT) {
                newRegion.x1 = Math.min(region.x1 + dx, region.x2);
                newRegion.y2 = Math.max(region.y1, region.y2 + dy);
            }
            else if (handlerType === HANDLERS.CORNER_BOTTOM_RIGHT) {
                newRegion.x2 = Math.max(region.x1, region.x2 + dx);
                newRegion.y2 = Math.max(region.y1, region.y2 + dy);
            }
            // update region
            setRegion(newRegion);
        };
        // handle pointer up
        const handlePointerUp = event => {
            event.preventDefault();
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("pointerleave", handlePointerUp);
        };
        // register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);
    };
    return (
        <React.Fragment>
            <div
                ref={parent}
                className="absolute top-0 left-0 w-full h-full z-50"
                style={{
                    backgroundColor: region ? TRANSPARENT : BLACK,
                    opacity: "0.5",
                }}
                onPointerDown={event => handlePointerDown(event, false, false)}
            />
            {region && (
                <div className="absolute z-50 top-0 left-0">
                    <SvgContainer>
                        <path
                            d={getScreenshotCommand(region)}
                            fill={BLACK}
                            fillOpacity="0.5"
                            stroke={NONE}
                            onPointerDown={event => handlePointerDown(event, false, false)}
                        />
                        <path
                            d={`M${region.x1},${region.y1} H${region.x2} V${region.y2} H${region.x1} Z`}
                            fill={TRANSPARENT}
                            stroke={SCREENSHOT_STROKE_COLOR}
                            strokeWidth={SCREENSHOT_STROKE_WIDTH}
                            style={{
                                cursor: CURSORS.MOVE
                            }}
                            onPointerDown={event => handlePointerDown(event, false, true)}
                        />
                        <Handlers
                            handlers={getHandlers(region)}
                            strokeColor={SCREENSHOT_STROKE_COLOR}
                            onPointerDown={event => handlePointerDown(event, true, false)}
                        />
                    </SvgContainer>
                </div>
            )}
            {region && (
                <ObjectDimensions
                    className="z-50"
                    value={[Math.floor(region.x2 - region.x1), Math.floor(region.y2 - region.y1)].join(" x ")}
                    x={Math.max(region.x1, region.x2)}
                    y={Math.max(region.y1, region.y2)}
                />
            )}
            <div className="absolute left-half top-0 mt-4 translate-x-half-n z-50">
                <Island>
                    <Island.Button
                        icon="download"
                        text="Download"
                        disabled={!region}
                        onClick={() => props.onDownload(region, options)}
                    />
                    <Island.Button
                        icon="clipboard"
                        text="Copy to Clipboard"
                        disabled={!region}
                        onClick={() => props.onCopyToClipboard(region, options)}
                    />
                    <Island.Separator />
                    <div className="flex relative group" tabIndex="0">
                        <Island.Button icon="cog" />
                        <Dropdown className="hidden group-focus-within:block top-full right-0 mt-2 w-56 z-50">
                            <Dropdown.Item disabled={true}>
                                <Dropdown.Icon>
                                    <FileIcon />
                                </Dropdown.Icon>
                                <span>Format</span>
                                <span className="ml-auto opacity-60">PNG</span>
                            </Dropdown.Item>
                            <Dropdown.CheckItem checked={options.background} onClick={() => setOptions({background: !options.background})}>
                                <Dropdown.Icon>
                                    <FillIcon />
                                </Dropdown.Icon>
                                <span>Solid Background</span>
                            </Dropdown.CheckItem>
                        </Dropdown>
                    </div>
                    <Island.Separator />
                    <Island.Button
                        icon="x"
                        text="Cancel"
                        onClick={props.onCancel}
                    />
                </Island>
            </div>
        </React.Fragment>
    );
};
