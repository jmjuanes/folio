import React from "react";
import classNames from "classnames";
import {
    TrashIcon,
    CheckIcon,
    PencilIcon,
    CopyIcon,
    BarsIcon,
    PlusIcon,
    LockIcon,
} from "@josemi-icons/react";
import {Dropdown} from "../ui/dropdown.jsx";
import {Island} from "../ui/island.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useConfirm} from "../../contexts/confirm.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {themed} from "../../contexts/theme.jsx";
import {exportToDataURL} from "../../export.js";
import {EXPORT_PADDING} from "../../constants.js";
import {clearFocus} from "../../utils/dom.js";

const PAGES_ITEM_HEIGHT = 37;
const PAGES_PREVIEW_WIDTH = 140;
const PAGES_PREVIEW_HEIGHT = 80;
// const PAGES_VIEW = {
//     LIST: "list",
//     GALLERY: "gallery",
// };

// Tiny hook to generate the preview of the page
const usePagePreview = page => {
    const editor = useEditor();
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        const previewOptions = {
            assets: editor.assets,
            width: PAGES_PREVIEW_WIDTH * 2,
            height: PAGES_PREVIEW_HEIGHT * 2,
            background: editor.background,
            padding: EXPORT_PADDING * 4,
        };
        exportToDataURL(page.elements, previewOptions).then(image => {
            return setPreviewImage(image);
        });
    }, [page.id, page.id === editor.page.id ? editor.updatedAt : null]);
    return previewImage;
};

// @private page in gallery mode
const PageGalleryItem = ({page, active, onClick}) => {
    const previewImage = usePagePreview(page);
    const previewClass = themed({
        "shrink-0 rounded-md overflow-hidden cursor-pointer": true,
        "pages.gallery.item": true,
        "pages.gallery.item.active": active,
    });
    return (
        <div className="p-1" onClick={onClick}>
            <div className="text-2xs mb-1 text-neutral-600 font-medium truncate w-40">
                {page.title}
            </div>
            <div className={previewClass}>
                <img src={previewImage} width="100%" height="100%" />
            </div>
        </div>
    );
};

// @private page action button
const PageActionButton = ({children, onClick}) => (
    <div className={themed("cursor-pointer flex items-center px-1", "pages.item.action")} onClick={onClick}>
        {children}
    </div>
);

// @private page item component
const Page = ({title, active, editable, style, onClick, ...props}) => {
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
            <div className="cursor-pointer flex items-center gap-2 w-full p-0 ml-6" onClick={onClick}>
                <div className="font-medium text-sm w-content max-w-32 truncate" title={title}>
                    <span>{title}</span>
                </div>
                {props.readonly && (
                    <div className="flex items-center text-yellow-700 text-sm">
                        <LockIcon />
                    </div>
                )}
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100">
                {editable && (
                    <PageActionButton onClick={props.onConfigure}>
                        <PencilIcon />
                    </PageActionButton>
                )}
                {editable && (
                    <PageActionButton onClick={props.onDuplicate}>
                        <CopyIcon />
                    </PageActionButton>
                )}
                {editable && !active && (
                    <PageActionButton onClick={props.onDelete}>
                        <TrashIcon />
                    </PageActionButton>
                )}
            </div>
        </div>
    );
};

// @private initialize sorted pages list
const initializeSortedPages = pages => {
    return Object.fromEntries(pages.map((page, index) => {
        return [page.id, {index: index, y: 0, selected: false}];
    }));
};

// @description pages menu component
export const PagesMenu = () => {
    const editor = useEditor();
    const {showConfirm} = useConfirm();
    const {showDialog} = useDialog();
    // const [preferences, setPreferences] = usePreferences();
    const [sortedPages, setSortedPages] = React.useState(() => {
        return initializeSortedPages(editor.pages);
    });
    const activePage = editor.getActivePage();
    // const view = preferences[PREFERENCES_FIELDS.PAGES_VIEW] || PAGES_VIEW.LIST;

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
            const nextIndex = Math.max(0, Math.min(Math.round(currentY / PAGES_ITEM_HEIGHT), editor.pages.length));
            editor.pages.forEach(item => {
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
                // dispatch page move
                // props?.onPageMove?.(page, currentIndex);
                editor.movePage(page, nextIndex);
                editor.dispatchChange();
                editor.update();
            }
            setSortedPages(nextSortedPages);
        };

        // Register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);
    }, [editor]);

    // handle change view mode
    // const handleViewModeChange = () => {
    //     setPreferences(Object.assign({}, preferences, {
    //         [PREFERENCES_FIELDS.PAGES_VIEW]: view === PAGES_VIEW.LIST ? PAGES_VIEW.GALLERY : PAGES_VIEW.LIST,
    //     }));
    // };

    // handle page delete callback
    const handlePageDelete = React.useCallback(page => {
        return showConfirm({
            title: "Delete page",
            message: `Do you want to delete '${page.title}'? This action can not be undone.`,
            callback: () => {
                editor.removePage(page);
                editor.dispatchChange();
                editor.update();
            },
        });
    }, [editor]);

    // handle page create
    const handlePageCreate = React.useCallback(() => {
        editor.addPage({});
        editor.dispatchChange();
        editor.update();
    }, [editor]);

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button
                icon="files"
                text={(
                    <div className="w-32 truncate">
                        <span>{activePage.title}</span>
                    </div>
                )}
                showChevron={true}
            />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-60 z-40">
                <div className="p-1 scrollbar w-full overflow-y-auto" style={{maxHeight: "50vh"}}>
                    <div className="relative w-full" style={{height: editor.pages.length * PAGES_ITEM_HEIGHT}}>
                        {editor.pages.map(page => (
                            <Page
                                key={`page:${page.id}`}
                                title={page.title}
                                readonly={page.readonly}
                                active={page.id === activePage.id}
                                editable={true}
                                moving={sortedPages[page.id].selected}
                                style={{
                                    top: PAGES_ITEM_HEIGHT * (sortedPages[page.id].index),
                                    transform: sortedPages[page.id].selected ? `translate(0px, ${sortedPages[page.id].y}px)` : null,
                                    zIndex: sortedPages[page.id].selected ? 100 : 0,
                                }}
                                onClick={() => {
                                    editor.setActivePage(page);
                                    editor.update();
                                }}
                                onDelete={() => {
                                    handlePageDelete(page);
                                }}
                                onDuplicate={() => {
                                    editor.duplicatePage(page);
                                    editor.dispatchChange();
                                    editor.update();
                                }}
                                onConfigure={() => {
                                    showDialog("page-edit", {page});
                                    clearFocus();
                                }}
                                onMove={event => {
                                    handlePageMove(event, page);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </Dropdown>
        </div>
    );
};
