import React from "react";
import {ELEMENTS, SHAPE_PADDING} from "@lib/constants.js";
import {SvgContainer} from "@components/commons/svg.jsx";
import {ArrowElement} from "@components/elements/arrow.jsx";
import {DrawElement} from "@components/elements/draw.jsx";
import {TextElement} from "@components/elements/text.jsx";
import {ShapeElement} from "@components/elements/shape.jsx";
import {ImageElement} from "@components/elements/image.jsx";
import {NoteElement} from "@components/elements/note.jsx";

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
};

export const renderElement = (element, props) => {
    return elementsRenderer[element.type](props);
};
