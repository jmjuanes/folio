import React from "react";
import classNames from "classnames";
import {renderIcon, TrashIcon, CheckIcon, PencilIcon, CloseIcon, BarsIcon} from "@josemi-icons/react";
import {useScene} from "@contexts/scene.jsx";

const PAGES_ITEM_HEIGHT = 37;

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
        <div className="absolute group flex items-center hover:bg-neutral-100 rounded-md p-2 w-full" style={style}>
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
        <div className="w-64 border border-neutral-200 rounded-lg shadow-md bg-white p-0 relative">
            <div className="flex items-center justify-between sticky top-0 p-2 border-b border-neutral-200 h-12">
                <div className="font-medium text-sm">Pages</div>
                {props.editable && (
                    <div className="flex items-center gap-0">
                        <ActionButton icon="plus" onClick={handlePageCreate} />
                    </div>
                )}
            </div>
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
        </div>
    );
};
