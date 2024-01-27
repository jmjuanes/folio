import React from "react";
import {useMount} from "react-use";
import {DrawingIcon, FolderIcon, FileIcon} from "@josemi-icons/react";
import {Button, Centered} from "@josemi-ui/react";
import {useClient} from "@components/contexts/client.jsx";

const getRecentBoards = boards => {
    return boards
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 4);
};

export default props => {
    const client = useClient();
    const [boards, setBoars] = React.useState(null);

    // Import list of recent boards
    useMount(() => {
        client.list().then(setBoars);
    });

    return (
        <Centered className="min-h-full bg-white fixed">
            <div className="w-full max-w-lg p-8 bg-white border-none border-neutral-200 rounded-lg shadow-none">
                <div className="pt-4 pb-6 select-none">
                    <div className="font-black text-5xl mb-6 text-neutral-950 leading-none">folio.</div>
                    <div className="">
                        Welcome to Folio, our work-in-progress minimal digital whiteboard for sketching and prototyping.
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="w-full" onClick={props.onBoardCreate}>
                        <div className="flex items-center text-lg">
                            <DrawingIcon />
                        </div>
                        <div className="font-medium">Start drawing</div>
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={props.onBoardImport}>
                        <div className="flex items-center text-lg">
                            <FolderIcon />
                        </div>
                        <div className="font-medium">Import from file</div>
                    </Button>
                </div>
                {boards && boards.length > 0 && (
                    <div className="mt-8">
                        <div className="text-center text-neutral-600 text-sm mb-2">
                            <span>Or open a recent board:</span>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-2">
                            {getRecentBoards(boards).map(item => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-100 p-2 rounded-md border border-neutral-200"
                                >
                                    <div className="text-lg flex items-center">
                                        <FileIcon />
                                    </div>
                                    <div className="text-sm truncate">{item.title}</div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mt-8 text-neutral-400 text-center text-xs select-none">
                    Currently <b>v{process.env.VERSION}</b>. 
                </div>
            </div>
        </Centered>
    );
};

// Welcome.defaultProps = {
//     title: "folio.",
//     description: "Welcome to Folio, our work-in-progress minimal digital whiteboard for sketching and prototyping.",
//     onClose: null,
//     onLoad: null,
// };
