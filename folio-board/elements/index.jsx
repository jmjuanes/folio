import React from "react";
import {ELEMENTS} from "../constants";
import {RectangleElement} from "./RectangleElement.jsx";

export const elements = {
    [ELEMENTS.RECTANGLE]: RectangleElement,
};

export const getElementConfig = element => {
    return elements[element.type];
};

export const getElementSvg = element => {
    return null;
};

export const renderElement = element => {
    const {Component} = getElementConfig(element);
    return (
        <Component key={element.id} {...element} />
    );
};

export const hasResizeHandlersEnabled = element => {
    return !!element?.resizeHandlers;
};

export const hasNodeHandlersEnabled = element => {
    return !!element?.nodeHandlers;
};

