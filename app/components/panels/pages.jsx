import React from "react";
import classNames from "classnames";
import {
    TrashIcon,
    CheckIcon,
    PencilIcon,
    CopyIcon,
    BarsIcon,
    PlusIcon,
    ListIcon,
    GalleryVerticalIcon,
} from "@josemi-icons/react";
import {Panel} from "../ui/panel.jsx";
import {useScene} from "../../contexts/scene.jsx";
import {usePreferences} from "../../contexts/preferences.jsx";
import {themed} from "../../contexts/theme.jsx";
import {exportToDataURL} from "../../export.js";
import {EXPORT_PADDING, PREFERENCES_FIELDS} from "../../constants.js";

const PAGES_ITEM_HEIGHT = 37;
const PAGES_PREVIEW_WIDTH = 140;
const PAGES_PREVIEW_HEIGHT = 80;
const PAGES_VIEW = {
    LIST: "list",
    GALLERY: "gallery",
};

// Tiny hook to generate the preview of the page
const usePagePreview = page => {
    const scene = useScene();
    const [previewImage, setPreviewImage] = React.useState(null);
    React.useEffect(() => {
        const previewOptions = {
            assets: scene.assets,
            width: PAGES_PREVIEW_WIDTH * 2,
            height: PAGES_PREVIEW_HEIGHT * 2,
            background: scene.background,
            padding: EXPORT_PADDING * 4,
        };
        exportToDataURL(page.elements, previewOptions).then(image => {
            return setPreviewImage(image);
        });
    }, [page.id, page.id === scene.page.id ? scene.updatedAt : null]);
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
                <div className="font-medium text-sm w-32 truncate" title={title}>
                    <span>{title}</span>
                </div>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100">
                {editable && (
                    <PageActionButton onClick={props.onRename}>
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
    const [preferences, setPreferences] = usePreferences();
    const [sortedPages, setSortedPages] = React.useState(() => {
        return initializeSortedPages(scene.pages);
    });
    const activePage = scene.getActivePage();
    const view = preferences[PREFERENCES_FIELDS.PAGES_VIEW] || PAGES_VIEW.LIST;
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
    }, [props.onPagesUpdate]);
    // handle change view mode
    const handleViewModeChange = () => {
        setPreferences(Object.assign({}, preferences, {
            [PREFERENCES_FIELDS.PAGES_VIEW]: view === PAGES_VIEW.LIST ? PAGES_VIEW.GALLERY : PAGES_VIEW.LIST,
        }));
    };
    const panelClassName = classNames({
        "w-48": view === PAGES_VIEW.GALLERY,
        "w-64": view === PAGES_VIEW.LIST,
    });
    return (
        <Panel className={panelClassName}>
            <Panel.Header className="sticky top-0">
                <Panel.HeaderTitle>Pages</Panel.HeaderTitle>
                <div className="flex items-center gap-0">
                    {props.editable && (
                        <Panel.HeaderButton onClick={props.onPageCreate}>
                            <PlusIcon />
                        </Panel.HeaderButton>
                    )}
                    <Panel.HeaderButton onClick={handleViewModeChange}>
                        {view === PAGES_VIEW.GALLERY ? <ListIcon /> : <GalleryVerticalIcon />}
                    </Panel.HeaderButton>
                </div>
            </Panel.Header>
            <div className="p-1 scrollbar w-full overflow-y-auto" style={{maxHeight: "50vh"}}>
                {view === PAGES_VIEW.LIST && (
                    <div className="relative w-full" style={{height: scene.pages.length * PAGES_ITEM_HEIGHT}}>
                        {scene.pages.map(page => (
                            <Page
                                key={`page:${page.id}`}
                                title={page.title}
                                active={page.id === activePage.id}
                                editable={props.editable}
                                moving={sortedPages[page.id].selected}
                                style={{
                                    top: PAGES_ITEM_HEIGHT * (sortedPages[page.id].index),
                                    transform: sortedPages[page.id].selected ? `translate(0px, ${sortedPages[page.id].y}px)` : null,
                                    zIndex: sortedPages[page.id].selected ? 100 : 0,
                                }}
                                onClick={() => {
                                    props.onChangeActivePage(page);
                                }}
                                onDelete={() => {
                                    props.onPageDelete(page);
                                }}
                                onDuplicate={() => {
                                    props?.onPageDuplicate?.(page);
                                }}
                                onRename={() => {
                                    props?.onPageRename?.(page);
                                }}
                                onMove={event => {
                                    handlePageMove(event, page);
                                }}
                            />
                        ))}
                    </div>
                )}
                {view === PAGES_VIEW.GALLERY && (
                    <div className="grid grid-cols-1 gap-1">
                        {scene.pages.map(page => (
                            <PageGalleryItem
                                key={`page:${page.id}`}
                                page={page}
                                active={page.id === activePage.id}
                                onClick={() => {
                                    props.onChangeActivePage(page);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Panel>
    );
};
