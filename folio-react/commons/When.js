// When wrapper
export const When = props => {
    if (!!props.condition) {
        return typeof props.render === "function" ? props.render() : props.children;
    }
    // No condition satisfied
    return null;
};
