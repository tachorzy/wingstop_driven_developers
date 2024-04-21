import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Asset } from "@/app/api/_utils/types";
import Link from "next/link";

interface AssetBioProps {
    asset?: Asset | undefined;
}


export interface AssetContext { 
    factoryId: string;
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const AssetBio: React.FC<AssetBioProps> = (props: { factoryId: string, asset: Asset }) => {
    const { factoryId, asset } = props;
    
    const [imageSrc, setImageSrc] = useState("");

    useEffect(() => {
        const loadImageData = async () => {
            if (asset && asset.imageData) {
                const response = await fetch(asset.imageData);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setImageSrc(url);
            } else {
                setImageSrc("/icons/floorplan/placeholder-asset.svg");
            }
        };

        loadImageData();
    }, [asset]);

    return (
        <div className="self-start mt-4">
            {asset && (
                <div className="flex flex-row gap-x-4">
                    <Image
                        src={imageSrc}
                        width={90}
                        height={90}
                        alt="Asset Image"
                        className="self-center"
                    />
                    <div className="flex flex-col gap-y-1">
                        <p className="text-DarkBlue font-semibold break-words">
                            {asset.name}
                        </p>
                        <p className="text-[#494949] text-xs break-words">
                            Description: {asset.description}
                        </p>
                    </div>
                    <button onClick={() => { contextValue.setAssets(prevAssets => [...prevAssets, asset])}}>
                        <Link href={`/factorydashboard/${factoryId}/${asset.assetId}`} className="text-MainBlue font-medium ">
                        Inspect 
                        </Link>
                    </button>

                </div>
            )}
        </div>
    );
};

export default AssetBio;
