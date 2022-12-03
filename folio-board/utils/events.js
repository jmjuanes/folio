// Check if the provided event.target is related to an input element
export const isInputTarget = e => {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
};

// Stop event propagation
export const stopEventPropagation = event => {
    event?.stopPropagation?.();
    // event?.preventDefault?.();
};
