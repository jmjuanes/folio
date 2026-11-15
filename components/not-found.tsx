import { Centered } from "folio-react/components/ui/centered.tsx";
import type { JSX } from "react";

// not found component
export const NotFound = (): JSX.Element => (
    <Centered className="h-full">
        <div className="text-center max-w-md mx-auto w-full p-8">
            <div className="text-lg font-bold mb-2 text-gray-950">
                <span>Sorry, this page was not found.</span>
            </div>
            <div className="text-sm text-gray-700 mb-4">
                <span>The page you are looking for does not exist or has been moved. </span>
                <span>Please check the URL or return to the home page.</span>
            </div>
        </div>
    </Centered>
);