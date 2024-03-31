import React from "react";
import {ELEMENTS, SHAPE_PADDING} from "../../lib/constants.js";
import {SvgContainer} from "../commons/svg.jsx";
import {ArrowElement} from "./arrow.jsx";
import {DrawElement} from "./draw.jsx";
import {TextElement} from "./text.jsx";
import {ShapeElement} from "./shape.jsx";
import {ImageElement} from "./image.jsx";
import {NoteElement} from "./note.jsx";
import {BookmarkElement} from "./bookmark.jsx";

const ElementContainer = props => (
    <SvgContainer>
        <g data-role="element" data-element={props.id}>
            {props.children}
        </g>
    </SvgContainer>
);

// Map each element with its renderer function
const elementsRenderer = {
    [ELEMENTS.SHAPE]: props => (
        <ElementContainer id={props.id}>
            <ShapeElement {...props} />
            <TextElement
                {...props}
                embedded={true}
                padding={SHAPE_PADDING}
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
};

export const renderElement = (element, props) => {
    return elementsRenderer[element.type](props);
};
