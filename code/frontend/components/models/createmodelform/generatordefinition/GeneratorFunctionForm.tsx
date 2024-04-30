import React, { useContext } from "react";
import {
    Attribute,
    Property,
    Measurement,
    Model,
} from "@/app/api/_utils/types";
import Link from "next/link";
import { PostConfig, BackendConnector } from "@/app/api/_utils/connector";
import RandomGeneratorForm from "./RandomGeneratorForm";
import SineWaveGeneratorForm from "./SineWaveGeneratorForm";
import SawtoothGeneratorForm from "./SawtoothGeneratorForm";
import ReplayGeneratorForm from "./ReplayGeneratorForm";
import { Context } from "../CreateModelForm";

export interface GeneratorFunctionFormContext {
    factoryId: string;
    modelId: string;
    models: Model[];
    setModels: React.Dispatch<React.SetStateAction<Model[]>>;
    attributes: Attribute[];
    setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
    properties: Property[];
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    measurements: Measurement[];
    setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
    nextPage: () => void;
}

const GeneratorFunctionForm = () => {
    const contextValue = useContext(Context) as GeneratorFunctionFormContext;
    const uniqueNames: Record<string, boolean> = {};

    const uniqueProperties = contextValue.properties.filter((property) => {
        if (!uniqueNames[property.name]) {
            uniqueNames[property.name] = true;
            return true;
        }
        return false;
    });

    const handleModelSubmission = async (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        const newModel: Model = {
            factoryId: contextValue.factoryId,
            modelId: contextValue.modelId,
            attributes: contextValue.attributes,
            properties: contextValue.properties,
            measurements: contextValue.measurements,
        };

        try {
            const config: PostConfig<Model> = {
                resource: "models",
                payload: newModel,
            };
            const model = await BackendConnector.post<Model>(config);
            contextValue.setModels([...contextValue.models, model]);
        } catch (error) {
            console.error("Failed to add model", error);
        }
    };

    return (
        <div
            className="flex flex-col gap-y-3 max-h-72"
            data-testid="generator-function-form"
        >
            <div className="flex flex-col max-h-[28rem] overflow-y-scroll gap-y-1 gap-x-16">
                {uniqueProperties.map((property, index) => (
                    <div key={index}>
                        {property.generatorType === "Random" && (
                            <RandomGeneratorForm
                                propertyIndex={index}
                                property={property}
                                measurements={contextValue?.measurements}
                                setMeasurements={contextValue?.setMeasurements}
                            />
                        )}
                        {property.generatorType === "Sine wave" && (
                            <SineWaveGeneratorForm
                                propertyIndex={index}
                                property={property}
                                measurements={contextValue?.measurements}
                                setMeasurements={contextValue?.setMeasurements}
                            />
                        )}
                        {property.generatorType === "Sawtooth" && (
                            <SawtoothGeneratorForm
                                propertyIndex={index}
                                property={property}
                                measurements={contextValue?.measurements}
                                setMeasurements={contextValue?.setMeasurements}
                            />
                        )}
                        {property.generatorType === "Replay" && (
                            <ReplayGeneratorForm
                                propertyIndex={index}
                                property={property}
                                measurements={contextValue?.measurements}
                                setMeasurements={contextValue?.setMeasurements}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                type="submit"
                onClick={handleModelSubmission}
                className="bg-black p-2 w-24 rounded-full font-semibold text-lg right-0 bottom-0 absolute mb-4 mr-8"
            >
                <Link href={`/factorydashboard/${contextValue?.factoryId}`}>
                    Submit ›
                </Link>
            </button>
        </div>
    );
};

export default GeneratorFunctionForm;
