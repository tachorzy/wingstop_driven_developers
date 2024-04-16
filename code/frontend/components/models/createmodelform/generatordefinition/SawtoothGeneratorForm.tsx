import React, { useState } from "react";
import Image from "next/image";
import { Property } from "@/app/api/_utils/types";

const SawtoothGeneratorForm = (props: {
    propertyIndex: number;
    property: Property;
}) => {
    const { propertyIndex, property } = props;
    const [frequency, setFrequency] = useState<number>(0.0);
    const [angularFrequency, setAngularFrequency] = useState<number>(0.0);
    const [amplitude, setAmplitude] = useState<number>(0.0);
    const [phase, setPhase] = useState<number>(0.0);
    const [maxValue, setMaxValue] = useState<number>(0.0);
    
    return (
        <div className="flex flex-col gap-y-3 max-h-72">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Property {propertyIndex} - {property.name}
                </h1>
                <div className="flex flex-row gap-x-1">
                    <Image
                        src="/icons/generation/sawtooth.svg"
                        width={20}
                        height={20}
                        alt="sawtooth wave"
                    />
                    <h2 className="text-sm font-medium text-DarkBlue">
                        Sawtooth wave function
                    </h2>
                </div>
            </div>
            <div className="flex flex-col gap-y-3">
                <div className="flex flex-row items-start">
                    <div className="flex flex-col gap-y-2">
                        <h2 className="text-sm font-medium text-[#494949]">
                            Frequency (ms)
                        </h2>
                        <input
                            className="bg-gray-200 p-3 rounded-lg placeholder-gray-400 text-[#494949] w-11/12"
                            placeholder="e.g. 60000"
                        />
                        <h2 className="text-sm font-medium text-[#494949]">
                            Angular frequency (ω)
                        </h2>
                        <input
                            className="bg-gray-200 p-3 rounded-lg placeholder-gray-400 text-[#494949] w-11/12"
                            placeholder="e.g. 1000"
                        />
                    </div>
                    <div className="flex flex-row">
                        <div className="flex flex-col gap-y-2 w-1/2">
                            <h2 className="text-sm font-medium text-[#494949]">
                                Amplitude
                            </h2>
                            <input
                                className="bg-gray-200 p-3 rounded-lg placeholder-gray-400 text-[#494949] w-11/12"
                                placeholder="e.g. 2"
                            />
                            <h2 className="text-sm font-medium text-[#494949]">
                                Phase
                            </h2>
                            <input
                                className="bg-gray-200 p-3 rounded-lg placeholder-gray-400 text-[#494949] w-11/12"
                                placeholder="e.g. 0.5"
                            />
                        </div>
                        <div className="flex flex-col gap-y-2 w-1/2">
                            <h2 className="text-sm font-medium text-[#494949]">
                                Maximum value
                            </h2>
                            <input
                                className="bg-gray-200 p-3 rounded-lg placeholder-gray-400 text-[#494949] w-11/12"
                                placeholder="e.g. 100"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SawtoothGeneratorForm;
