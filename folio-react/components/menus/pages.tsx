import React from "react";
import classNames from "classnames";
import { BarsIcon, LockIcon, DotsIcon } from "@josemi-icons/react";
import { ACTIONS, EXPORT_PADDING } from "../../constants.js";
import { Dropdown } from "../ui/dropdown.tsx";
import { Island } from "../ui/island.jsx";
import { useActions } from "../../hooks/use-actions.js";
import { useEditor } from "../../contexts/editor.jsx";
import { exportToDataURL } from "../../lib/export.js";
import type { Page } from "../../lib/pages.ts";

const PAGES_ITEM_HEIGHT = 37;
const PAGES_PREVIEW_WIDTH = 140;
const PAGES_PREVIEW_HEIGHT = 80;

// Tiny hook to generate the preview of the page
const usePagePreview = (page: Page): string | null => {
    const editor = useEditor();
    const [ previewImage, setPreviewImage ] = React.useState<string | null>(null);
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
    }, [ page.id, page.id === editor.page.id ? editor.updatedAt : null ]);
    return previewImage;
};

// @private page in gallery mode
// const PageGalleryItem = ({page, active, onClick}) => {
//     const previewImage = usePagePreview(page);
//     const previewClass = classNames({
//         "shrink-0 rounded-md overflow-hidden cursor-pointer": true,
//         "border-2 border-gray-200": true,
//         "border-gray-950": active,
//     });
//     return (
//         <div className="p-1" onClick={onClick}>
//             <div className="text-2xs mb-1 text-gray-600 font-medium truncate w-40">
//                 {page.title}
//             </div>
//             <div className={previewClass}>
//                 <img src={previewImage} width="100%" height="100%" />
//             </div>
//         </div>
//     );
// };

// just a wrapper component for the page actions item
const PageActionsItem = ({ text, icon, onClick }: { text: string; icon: string; onClick: () => void }): React.JSX.Element => (
    <Dropdown.Item onClick={onClick}>
        <Dropdown.Icon icon={icon} />
        <span>{text}</span>
    </Dropdown.Item>
);

// @private page item component props type
type PageItemProps = {
    title: string;
    active: boolean;
    style?: React.CSSProperties;
    moving: boolean;
    readonly?: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onMove: (event: React.PointerEvent<HTMLDivElement>) => void;
};

// @private page item component
const PageItem = ({ title, active, style, onClick, ...props }: PageItemProps): React.JSX.Element => {
    const moveButtonStyle = React.useMemo(() => {
        return {
            cursor: props.moving ? "grabbing" : "grab",
            touchAction: "none",
        };
    }, [ props.moving ]);

    // page classname
    const pageClassName = classNames({
        "absolute group flex items-center rounded-md p-2 w-full": true,
        "hover:bg-gray-200": !active,
        "bg-gray-200": active,
        // "bg-gray-100": !active && actionsMenuOpen,
    });

    return (
        <div className={pageClassName} style={style}>
            <div className="flex items-center text-xs text-gray-400" style={moveButtonStyle} onPointerDown={props.onMove}>
                <BarsIcon />
            </div>
            <div className="cursor-pointer flex items-center gap-2 w-full p-0 ml-2" onClick={onClick}>
                <div className="font-medium text-sm w-content max-w-32 truncate" title={title}>
                    <span>{title}</span>
                </div>
                {props.readonly && (
                    <div className="flex items-center text-yellow-700 text-sm">
                        <LockIcon />
                    </div>
                )}
            </div>
            <Dropdown.Portal
                id="page:item:action"
                toggleClassName="cursor-pointer flex items-center px-1 text-gray-500 hover:text-gray-900"
                contentClassName="absolute z-50"
                toggleRender={() => (
                    <DotsIcon />
                )}
                contentRender={(closeDropdown) => (
                    <Dropdown>
                        <PageActionsItem
                            text="Edit"
                            icon="edit"
                            onClick={() => {
                                closeDropdown?.();
                                props.onEdit();
                            }}
                        />
                        <PageActionsItem
                            text="Duplicate"
                            icon="copy"
                            onClick={() => {
                                closeDropdown?.();
                                props.onDuplicate();
                            }}
                        />
                        <PageActionsItem
                            text="Delete"
                            icon="trash"
                            onClick={() => {
                                closeDropdown?.();
                                props.onDelete();
                            }}
                        />
                    </Dropdown>
                )}
            />
        </div>
    );
};

// @private initialize sorted pages list
const initializeSortedPages = (pages: Page[]) => {
    return Object.fromEntries(pages.map((page, index) => {
        return [
            page.id,
            { index: index, y: 0, selected: false },
        ];
    }));
};

// @description content of the pages menu component
export const PagesMenuContent = (): React.JSX.Element => {
    const editor = useEditor();
    const dispatchAction = useActions();
    const [ sortedPages, setSortedPages ] = React.useState(() => {
        return initializeSortedPages(editor.pages);
    });
    const activePage = editor.getActivePage();

    // Handle page move
    const handlePageMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>, page: Page) => {
        event.preventDefault();
        // Update the selected page
        sortedPages[page.id].selected = true;
        setSortedPages({...sortedPages});
        let currentIndex = sortedPages[page.id].index;

        // Handle pointer move
        const handlePointerMove = (e: PointerEvent) => {
            e.preventDefault();
            // pageMove.current.y = e.clientY - event.nativeEvent.clientY;
            const nextSortedPages = {...sortedPages};
            nextSortedPages[page.id].y = e.clientY - event.nativeEvent.clientY;
            // Fix position of all pages
            const currentY = (nextSortedPages[page.id].index * PAGES_ITEM_HEIGHT) + nextSortedPages[page.id].y;
            const nextIndex = Math.max(0, Math.min(Math.round(currentY / PAGES_ITEM_HEIGHT), editor.pages.length));
            editor.pages.forEach((item: Page) => {
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
        const handlePointerUp = (e: PointerEvent) => {
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
                editor.movePage(page, currentIndex);
                editor.dispatchChange();
            }
            setSortedPages(nextSortedPages);
        };

        // Register event listeners
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointerleave", handlePointerUp);
    }, [editor]);

    return (
        <React.Fragment>
            <Dropdown.Header>
                <div className="text-sm font-bold mr-auto">Pages</div>
                <Dropdown.HeaderButton
                    icon="plus"
                    onClick={() => {
                        dispatchAction(ACTIONS.CREATE_PAGE);
                    }}
                />
            </Dropdown.Header>
            <div className="p-0 scrollbar w-full overflow-y-auto" style={{maxHeight: "240px"}}>
                <div className="relative w-full" style={{height: editor.pages.length * PAGES_ITEM_HEIGHT}}>
                    {editor.pages.map((page: Page) => (
                        <PageItem
                            key={`page:${page.id}`}
                            title={page.title || "Untitled"}
                            readonly={page.readonly}
                            active={page.id === activePage.id}
                            moving={sortedPages[page.id].selected}
                            style={{
                                top: PAGES_ITEM_HEIGHT * (sortedPages[page.id].index),
                                transform: sortedPages[page.id].selected ? `translate(0px, ${sortedPages[page.id].y}px)` : undefined,
                                zIndex: sortedPages[page.id].selected ? 100 : 0,
                            }}
                            onClick={() => {
                                editor.setActivePage(page);
                                editor.update();
                            }}
                            onDelete={() => {
                                dispatchAction(ACTIONS.DELETE_PAGE, page);
                            }}
                            onDuplicate={() => {
                                dispatchAction(ACTIONS.DUPLICATE_PAGE, page);
                            }}
                            onEdit={() => {
                                dispatchAction(ACTIONS.EDIT_PAGE, page);
                            }}
                            onMove={(event: React.PointerEvent<HTMLDivElement>) => {
                                handlePageMove(event, page);
                            }}
                        />
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export type PagesMenuProps = {
    children?: React.ReactNode,
};

// @description pages menu wrapper
export const PagesMenu = (props: PagesMenuProps): React.JSX.Element => {
    const editor = useEditor();
    const activePage = editor.getActivePage();

    // note: using the pages ids as a key instead of the number of pages
    // this fixes a bug when clearing the editor data with only one page
    const pagesKey = (editor?.pages || []).map((page: any) => page.id).join("-");

    // get the content to display
    const content = props.children ?? <PagesMenuContent key={"pages:" + pagesKey} />;

    return (
        <div className="flex relative group" tabIndex={0}>
            <Island.Button
                text={(
                    <div className="flex items-center gap-1">
                        {activePage.readonly && (
                            <div className="flex items-center text-yellow-700 text-base">
                                <LockIcon />
                            </div>
                        )}
                        <div className="w-32 truncate">{activePage.title}</div>
                    </div>
                )}
                showChevron={true}
            />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-64 z-40">
                {content}
            </Dropdown>
        </div>
    );
};
