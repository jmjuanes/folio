import React from "react";
import { ELEMENTS } from "../../constants.js";
import { AssetsProvider } from "../../contexts/assets.jsx";
import { ArrowElement } from "./arrow.jsx";
import { DrawElement } from "./draw.tsx";
import { TextElement } from "./text.tsx";
import { ShapeElement } from "./shape.jsx";
import { ImageElement } from "./image.jsx";
import { NoteElement } from "./note.tsx";
import { BookmarkElement } from "./bookmark.jsx";
import { StickerElement } from "./sticker.tsx";

const ElementContainer = props => (
    <g data-role="element" data-element={props.id}>
        {props.children}
    </g>
);

// Map each element with its renderer function
const elementsRenderer = {
    [ELEMENTS.SHAPE]: props => (
        <ElementContainer id={props.id}>
            <ShapeElement {...props} />
            <TextElement
                {...props}
                embedded={true}
            />
        </ElementContainer>
    ),
    [ELEMENTS.ARROW]: props => (
        <ElementContainer id={props.id}>
            <ArrowElement {...props} />
        </ElementContainer>
    ),
    [ELEMENTS.TEXT]: props => (
        <ElementContainer id={props.id}>
            <TextElement {...props} />
        </ElementContainer>
    ),
    [ELEMENTS.DRAW]: props => (
        <ElementContainer id={props.id}>
            <DrawElement {...props} />
        </ElementContainer>    
    ),
    [ELEMENTS.IMAGE]: props => (
        <ElementContainer id={props.id}>
            <ImageElement {...props} />
        </ElementContainer>
    ),
    [ELEMENTS.NOTE]: props => (
        <ElementContainer id={props.id}>
            <NoteElement {...props} />
        </ElementContainer>
    ),
    [ELEMENTS.BOOKMARK]: props => (
        <ElementContainer id={props.id}>
            <BookmarkElement {...props} />
        </ElementContainer>
    ),
    [ELEMENTS.STICKER]: props => (
        <ElementContainer id={props.id}>
            <StickerElement {...props} />
        </ElementContainer>
    ),
};

export const renderElement = (element, props) => {
    return elementsRenderer[element.type](props);
};

export const renderStaticElement = (element, assets = {}) => (
    <AssetsProvider value={assets}>
        {renderElement(element, element)}
    </AssetsProvider>
);
