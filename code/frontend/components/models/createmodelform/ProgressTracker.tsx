import React from "react";

const ProgressTracker = (props: { progress: number }) => {
    const { progress } = props;

    return (
        <div
            className="flex flex-row items-center justify-center gap-x-2 mb-3 gap-y-2 scale-[85%]"
            data-testid="progress-tracker"
        >
            <div className="rounded-full w-12 h-12 p-2.5 bg-gradient-to-br from-MainBlue to-DarkBlue items-center justify-center text-center font-semibold text-xl">
                1
            </div>

            <h1 className="text-sm font-medium text-MainBlue">
                Model attribute definition
            </h1>
            <div
                className={`${progress > 1 ? "bg-MainBlue" : "bg-gray-300"} w-32 h-0.5 rounded-lg`}
            />

            <div
                className={`rounded-full w-12 h-12 p-2.5 ${progress > 1 ? "bg-gradient-to-br from-MainBlue to-DarkBlue" : "bg-gray-400"} items-center justify-center text-center font-semibold text-xl`}
            >
                2
            </div>

            <h1
                className={`text-sm font-medium ${progress > 1 ? "text-MainBlue" : "text-gray-400"}`}
            >
                Model property definition
            </h1>
            <div
                className={`${progress > 2 ? "bg-MainBlue" : "bg-gray-300"} w-32 h-0.5 rounded-lg`}
            />

            <div
                className={`rounded-full w-12 h-12 p-2.5 ${progress > 2 ? "bg-gradient-to-br from-MainBlue to-DarkBlue" : "bg-gray-400"} items-center justify-center text-center font-semibold text-xl`}
            >
                3
            </div>
            <h1
                className={`text-sm font-medium ${progress > 2 ? "text-MainBlue" : "text-gray-400"}`}
            >
                Generator function definition
            </h1>
        </div>
    );
};
export default ProgressTracker;
