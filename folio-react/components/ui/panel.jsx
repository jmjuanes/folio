import React from "react";
import classNames from "classnames";

// @description main panel component
export const Panel = ({className, children}) => (
    <div className={classNames("rounded-xl relative border-1 border-gray-200 shadow-sm bg-white", className)}>
        {children}
    </div>
);

// separator for buttons
Panel.Separator = () => (
    <div className="w-full h-px shrink-0 bg-gray-200" />
);

// panel tabs container
Panel.Tabs = ({className, children}) => (
    <div className={classNames("flex items-center gap-1 flex-nowrap p-1 rounded-lg bg-gray-100 m-2", className)}>
        {children}
    </div>
);

// @description tab item for the panel header
// @param {object} props React props object
// @param {string} props.className custom class string
// @param {object} props.style custom style for the tab item
// @param {boolean} props.active to display the tab as active
// @param {function} props.onClick click listener
Panel.TabsItem = props => {
    const classList = classNames({
        "rounded-lg flex justify-center items-center flex p-1 w-full text-lg": true,
        "text-gray-600 hover:text-gray-900 cursor-pointer": !props.active,
        "bg-white text-gray-950 shadow-sm border-1 border-gray-200": props.active,
    }, props.className);
    
    return (
        <div className={classList} style={props.style} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

// // panel header
// Panel.Header = props => (
//     <div className={themed("flex items-center justify-between p-2 h-12", "panel.header", props.className)}>
//         {props.children}
//     </div>
// );
// 
// // panel header title
// Panel.HeaderTitle = props => (
//     <div className={themed("text-sm select-none", "panel.header.title", props.className)}>
//         {props.children}
//     </div>
// );
// 
// // panel header button
// Panel.HeaderButton = ({active, disabled = false, className, children, onClick}) => {
//     const classList = themed({
//         "flex items-center rounded-md cursor-pointer p-2": true,
//         "panel.header.button": true,
//         "panel.header.button.active": active,
//         "panel.header.button.inactive": !active,
//         "opacity-50 pointer-events-none": disabled,
//     }, className);
//     return (
//         <div className={classList} onClick={onClick}>
//             {children}
//         </div>
//     );
// };

// @description panel body content
Panel.Body = ({className, ...props}) => (
    <div className={classNames("p-2", className)} {...props} />
);
