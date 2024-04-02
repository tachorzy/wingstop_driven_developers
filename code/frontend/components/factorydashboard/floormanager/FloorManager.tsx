import React, { useState } from "react";
import { Asset } from "@/app/types/types";
import Image from "next/image";
import AssetInventory from "./AssetInventory";
import AddAssetForm from "./AddAssetForm";

const FloorManager: React.FC = () => {
    // State to manage list of assets
    const [assets, setAssets] = useState<Asset[]>([]);
    const [showAddAssetForm, setShowAddAssetForm] = useState(false);
    // Function to add new asset to the list
    const handleAddAsset = (newAsset: Asset) => {
        setAssets((prevAssets) => [...prevAssets, newAsset]);
    };

    return (
        <div className="floor-manager  w-full h-full flex flex-col gap-y-10 text-black bg-white rounded-xl  w-[37rem] h-[30rem] p-4 m-2 shadow-sm ring-2 ring-inset ring-gray-300">
            <div className="flex items-center justify-center gap-x-3">
                <Image
                    src="/branding/Tensor-Cube.svg"
                    width={50}
                    height={50}
                    alt="brand"
                    className=""
                />
                <h2 className="text-3xl font-bold">Floor Manager</h2>
            </div>

            <button
                type="button"
                className="w-[10rem] h-[4rem] flex-row items-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={() => setShowAddAssetForm(true)}
            >
                Add Asset
            </button>
            {!showAddAssetForm && <AssetInventory assets={assets} />}

            {showAddAssetForm && (
                <AddAssetForm
                    onAdd={handleAddAsset}
                    onClose={() => setShowAddAssetForm(false)}
                />
            )}
        </div>
    );
};

export default FloorManager;
