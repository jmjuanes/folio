import React from "react";
import classNames from "classnames";
import {
    TrashIcon,
    CheckIcon,
    PencilIcon,
    CloseIcon,
    CopyIcon,
    BarsIcon,
    PlusIcon,
} from "@josemi-icons/react";
import {Panel} from "../ui/panel.jsx";
import {useScene} from "../../contexts/scene.jsx";
import {themed} from "../../contexts/theme.jsx";

const PAGES_ITEM_HEIGHT = 37;

// @private page action button
const PageActionButton = ({children, onClick}) => (
    <div className={themed("cursor-pointer flex items-center px-1", "pages.item.action")} onClick={onClick}>
        {children}
    </div>
);

// @private page item component
const Page = ({title, active, editable, editing, style, onClick, ...props}) => {
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        if (editable && editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);
    const moveButtonStyle = {
        cursor: props.moving ? "grabbing" : "grab",
        touchAction: "none",
    };
    return (
        <div className={themed("absolute group flex items-center rounded-md p-2 w-full", "pages.item")} style={style}>
            {active && (
                <div className="absolute flex text-sm" style={{left:"1.5rem"}}>
                    <CheckIcon />
                </div>
            )}
            <div className="flex items-center text-xs text-neutral-400" style={moveButtonStyle} onPointerDown={props.onMove}>
                <BarsIcon />
            </div>
            {!editing && (
                <React.Fragment>
                    <div className="cursor-pointer flex items-center gap-2 w-full p-0 ml-6" onClick={onClick}>
                        <div className="font-medium text-sm w-32 truncate" title={title}>
                            <span>{title}</span>
                        </div>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100">
                        {editable && (
                            <PageActionButton onClick={props.onEdit}>
                                <PencilIcon />
                            </PageActionButton>
                        )}
                        {editable && (
                            <PageActionButton onClick={props.onDuplicate}>
                                <CopyIcon />
                            </PageActionButton>
                        )}
                        {editable && !active  && (
                            <PageActionButton onClick={props.onDelete}>
                                <TrashIcon />
                            </PageActionButton>
                        )}
                    </div>
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

// @private initialize sorted pages list
const initializeSortedPages = pages => {
    return Object.fromEntries(pages.map((page, index) => {
        return [page.id, {index: index, y: 0, selected: false}];
    }));
};

// @public pages panel component
export const PagesPanel = props => {
    const scene = useScene();
    const [editingPage, setEditingPage] = React.useState("");
    const [sortedPages, setSortedPages] = React.useState(() => {
        return initializeSortedPages(scene.pages);
    });
    const activePage = scene.getActivePage();

    // Handle creating a new page: cancel current edition and call 'onPageCreate'.
    const handlePageCreate = React.useCallback(() => {
        setEditingPage("");
        props.onPageCreate();
    }, [editingPage, props.onPageCreate]);

    // Handle page move
    const handlePageMove = React.useCallback((event, page) => {
        event.preventDefault();
        // Update the selected page
        sortedPages[page.id].selected = true;
        setSortedPages({...sortedPages});
        let currentIndex = sortedPages[page.id].index;

        // Handle pointer move
        const handlePointerMove = e => {
            e.preventDefault();
            // pageMove.current.y = e.clientY - event.nativeEvent.clientY;
            const nextSortedPages = {...sortedPages};
            nextSortedPages[page.id].y = e.clientY - event.nativeEvent.clientY;
            // Fix position of all pages
            const currentY = (nextSortedPages[page.id].index * PAGES_ITEM_HEIGHT) + nextSortedPages[page.id].y;
            const nextIndex = Math.max(0, Math.min(Math.round(currentY / PAGES_ITEM_HEIGHT), scene.pages.length));
            scene.pages.forEach(item => {
                if (item.id !== page.id) {
                    const index = nextSortedPages[item.id].index;
                    if (nextIndex === index) {
                        nextSortedPages[item.id].index = currentIndex;
                        currentIndex = nextIndex;
                    }
                }
            });
            setSortedPages(nextSortedPages);
        };

        // Handle pointer up
        const handlePointerUp = e => {
            e.preventDefault();
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("pointerleave", handlePointerUp);
            // Reset sorted pages
            const nextSortedPages = {...sortedPages};
            nextSortedPages[page.id].y = 0;
            nextSortedPages[page.id].selected = false;
            // Check if we need to update indexes
            if (nextSortedPages[page.id].index !== currentIndex) {
                nextSortedPages[page.id].index = currentIndex;
                props?.onPageMove?.(page, currentIndex);
            }
            setSortedPages(nextSortedPages);
        };
        // Register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);
        // Check to reset the current editing page
        if (editingPage) {
            setEditingPage("");
        }
    }, [props.onPagesUpdate, editingPage]);

    return (
        <Panel className="w-72">
            <Panel.Header className="sticky top-0">
                <Panel.HeaderTitle>Pages</Panel.HeaderTitle>
                {props.editable && (
                    <div className="flex items-center gap-0">
                        <Panel.HeaderButton onClick={handlePageCreate}>
                            <PlusIcon />
                        </Panel.HeaderButton>
                    </div>
                )}
            </Panel.Header>
            <div className="p-1 scrollbar w-full overflow-y-auto" style={{maxHeight: "50vh"}}>
                <div className="relative w-full" style={{height: scene.pages.length * PAGES_ITEM_HEIGHT}}>
                    {scene.pages.map(page => (
                        <Page
                            key={`page:${page.id}`}
                            title={page.title}
                            active={page.id === activePage.id}
                            editable={props.editable}
                            editing={editingPage === page.id}
                            moving={sortedPages[page.id].selected}
                            style={{
                                top: PAGES_ITEM_HEIGHT * (sortedPages[page.id].index),
                                transform: sortedPages[page.id].selected ? `translate(0px, ${sortedPages[page.id].y}px)` : null,
                                zIndex: sortedPages[page.id].selected ? 100 : 0,
                            }}
                            onClick={() => {
                                setEditingPage("");
                                props.onChangeActivePage(page);
                            }}
                            onDelete={() => {
                                setEditingPage("");
                                props.onPageDelete(page);
                            }}
                            onDuplicate={() => {
                                setEditingPage("");
                                props?.onPageDuplicate?.(page);
                            }}
                            onEdit={() => setEditingPage(page.id)}
                            onEditSubmit={title => {
                                page.title = title || page.title;
                                setEditingPage("");
                                props.onPageEdit(page);
                            }}
                            onEditCancel={() => setEditingPage("")}
                            onMove={event => handlePageMove(event, page)}
                        />
                    ))}
                </div>
            </div>
        </Panel>
    );
};
