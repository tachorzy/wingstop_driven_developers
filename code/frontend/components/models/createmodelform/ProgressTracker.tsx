import React, { useContext } from "react";
// import Image from "next/image";
import { Context } from "./CreateModelForm";

interface ProgressTrackerContext {
    factoryId: string;
    modelId: string;
    attributes: { attribute: string; value: string }[];
    setAttributes: React.Dispatch<
        React.SetStateAction<{ attribute: string; value: string }[]>
    >;
    properties: { property: string; unit: string }[];
    setProperties: React.Dispatch<
        React.SetStateAction<{ property: string; unit: string }[]>
    >;
}

const ProgressTracker = () => {
    const contextValue = useContext(Context) as ProgressTrackerContext;

    return (
        <div className="flex flex-row items-center justify-center gap-x-2 my-3 gap-y-2 scale-[85%]">
            <div className="rounded-full w-12 h-12 p-2.5 bg-gradient-to-br from-MainBlue to-DarkBlue items-center justify-center text-center font-semibold text-xl">
                1
            </div>
            
            <h1 className="text-sm font-medium text-MainBlue">Model attribute definition</h1>
            <div className="bg-gray-300 w-32 h-0.5 rounded-lg"></div>


            <div className="rounded-full w-12 h-12 p-2.5 bg-gray-400 items-center justify-center text-center font-semibold text-xl">
                2
            </div>

            <h1 className="text-sm font-medium text-gray-400">Model property definition</h1>
            <div className="bg-gray-300 w-32 h-0.5 rounded-lg"></div>

            <div className="rounded-full w-12 h-12 p-2.5 bg-gray-400 items-center justify-center text-center font-semibold text-xl">
                3
            </div>
            <h1 className="text-sm font-medium text-gray-400">Generator function definition</h1>
        </div>
    );
};
export default ProgressTracker;
