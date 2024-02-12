import React from "react";
import classNames from "classnames";
import {renderIcon, TrashIcon, CheckIcon, PencilIcon, CloseIcon} from "@josemi-icons/react";
import {useScene} from "@contexts/scene.jsx";

const ActionButton = ({icon, onClick}) => (
    <div className="flex items-center rounded-md hover:bg-neutral-100 cursor-pointer" onClick={onClick}>
        <div className="flex p-2 text-base">
            {renderIcon(icon)}
        </div>
    </div>
);

// @private page action button
const PageActionButton = ({className = "", children, onClick}) => (
    <div className={classNames(className, "cursor-pointer items-center o-60 hover:o-100")} onClick={onClick}>
        <div className="flex items-center text-lg px-1">
            {children}
        </div>
    </div>
);

// @private page item component
const Page = ({title, active, editable, editing, onClick, ...props}) => {
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        if (editable && editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    return (
        <div className="relative group flex items-center hover:bg-neutral-100 rounded-md p-2">
            {active && (
                <div className="absolute flex text-sm pl-0">
                    <CheckIcon />
                </div>
            )}
            {!editing && (
                <React.Fragment>
                    <div className="cursor-pointer flex items-center gap-2 w-full p-0 ml-6" onClick={onClick}>
                        <div className="font-medium text-sm w-32 truncate" title={title}>
                            <span>{title}</span>
                        </div>
                    </div>
                    {editable && (
                        <PageActionButton className="hidden group-hover:flex" onClick={props.onEdit}>
                            <PencilIcon />
                        </PageActionButton>
                    )}
                    {editable && !active  && (
                        <PageActionButton className="hidden group-hover:flex" onClick={props.onDelete}>
                            <TrashIcon />
                        </PageActionButton>
                    )}
                </React.Fragment>
            )}
            {editing && (
                <React.Fragment>
                    <input
                        ref={inputRef}
                        className="w-full bg-transparent border-none outline-none p-0 text-sm ml-6"
                        defaultValue={title}
                        onKeyUp={event => {
                            // Check for enter key --> submit new page title
                            if (event.key === "Enter") {
                                return props.onEditSubmit(inputRef.current.value);
                            }
                            // Check for ESC key --> Cancel editing page
                            else if (event.key === "Escape") {
                                return props.onEditCancel();
                            }
                        }}
                    />
                    <PageActionButton onClick={() => props.onEditSubmit(inputRef.current.value || "")}>
                        <CheckIcon />
                    </PageActionButton>
                    <PageActionButton onClick={() => props.onEditCancel()}>
                        <CloseIcon />
                    </PageActionButton>
                </React.Fragment>
            )}
        </div>
    );
};

export const PagesPanel = props => {
    const [editingPage, setEditingPage] = React.useState("");
    const scene = useScene();
    const activePage = scene.getActivePage();

    // Handle creating a new page: cancel current edition and call 'onPageCreate'.
    const handlePageCreate = React.useCallback(() => {
        setEditingPage("");
        props.onPageCreate();
    }, [editingPage, props.onPageCreate]);

    return (
        <div className="w-64 border border-neutral-200 rounded-lg shadow-md bg-white p-0 relative">
            <div className="flex items-center justify-between sticky top-0 p-2 border-b border-neutral-200 h-12">
                <div className="font-medium text-sm">Pages</div>
                {props.editable && (
                    <div className="flex items-center gap-0">
                        <ActionButton icon="plus" onClick={handlePageCreate} />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 p-1 scrollbar overflow-y-auto" style={{maxHeight: "50vh"}}>
                {scene.pages.map((page, index) => (
                    <Page
                        key={`page:${index}:${page?.id || ""}`}
                        title={page.title}
                        active={page.id === activePage.id}
                        editable={props.editable}
                        editing={editingPage === page.id}
                        onClick={() => {
                            setEditingPage("");
                            props.onChangeActivePage(page);
                        }}
                        onDelete={() => {
                            setEditingPage("");
                            props.onPageDelete(page);
                        }}
                        onEdit={() => setEditingPage(page.id)}
                        onEditSubmit={title => {
                            page.title = title || page.title;
                            setEditingPage("");
                            props.onPageEdit(page);
                        }}
                        onEditCancel={() => setEditingPage("")}
                    />
                ))}
            </div>
        </div>
    );
};
