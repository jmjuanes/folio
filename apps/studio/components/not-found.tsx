import React from "react";
import { Centered } from "folio-react/components/ui/centered.jsx";

// @description not found component
export const NotFound = (): React.JSX.Element => {
    return (
        <Centered className="h-full">
            <div className="text-center max-w-md mx-auto w-full p-8">
                <div className="text-lg font-bold mb-2 text-gray-950">
                    <span>Sorry, this page was not found.</span>
                </div>
                <div className="text-sm text-gray-700 mb-4">
                    <span>The page you are looking for does not exist or has been moved. </span>
                    <span>Please check the URL or return to the home page.</span>
                </div>
                <div className="flex justify-center">
                    <a href="#" className="flex border-1 border-gray-200 rounded-md px-3 py-1 text-gray-950 hover:bg-gray-100 text-sm font-medium">
                        <span>Go to Home</span>
                    </a>
                </div>
            </div>
        </Centered>
    );
};
