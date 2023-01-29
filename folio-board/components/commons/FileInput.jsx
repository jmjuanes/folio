import React from "react";
import {blobToDataUrl} from "../../utils/blob.js";

export const FileInput = React.forwardRef((props, ref) => (
    <input
        ref={ref}    
        type="file"
        accept={props.accept}
        style={props.style || {}}
        onChange={event => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) {
                blobToDataUrl(selectedFile).then(data => {
                    event.target.value = "";
                    props.onFile?.(data);
                });
            }
        }}
    />
));

FileInput.defaultProps = {
    accept: "image/*",
    onFile: null,
    style: {
        display: "none",
        visibility: "hidden",
    },
};
