import React, { useState } from "react";
import { Asset } from "@/app/types/types";
import Image from "next/image";
import { createAsset } from "@/app/api/assets/assetAPI";
interface AddAssetFormProps {
    onClose: () => void;
    onAdd: (newAsset: Asset) => void;
    factoryId:string;
}

const AddAssetForm: React.FC<AddAssetFormProps> = ({ onClose, onAdd,factoryId}) => {
    const [formData, setFormData] = useState<Asset>({
        assetId: "",
        name: "",
        description: "",
        image: "",
        factoryId:factoryId,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddAsset = async () => {
         //next steps: adding input validation..maybe
        try{
            await createAsset(formData);
            onClose();
        }
        catch(error){   
            console.error("Failed to add asset", error);
        }
        

    };

   
       
  

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                    <Image
                        src="/icons/navbar/close.svg"
                        width={20}
                        height={20}
                        alt="Close icon"
                    />
                </button>
                <h1 className="text-3xl font-semibold mb-4 text-gray-900">
                    Create Asset Form
                </h1>
                <div className="mb-4">
                    <label htmlFor="name" className="block mb-1 text-gray-800">
                        Asset Name:
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        className="w-full px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-indigo-500 text-gray-900"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="description"
                        className="block mb-1 text-gray-800"
                    >
                        Description:
                    </label>
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        className="w-full px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-indigo-500 text-gray-900"
                        onChange={handleInputChange}
                    />
                </div>
                {/* <label htmlFor="name" className="block mb-1 text-gray-500">
                Image URL:
        </label>
        <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900"
            onChange={handleInputChange}
        /> */}
                <div>
                    <button
                        type="button"
                        onClick={handleAddAsset}
                        className="inline-flex items-center rounded-md m-2 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50  border border-gray-800"
                    >
                        Create Asset
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center rounded-md m-2 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50  border border-gray-800"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssetForm;
