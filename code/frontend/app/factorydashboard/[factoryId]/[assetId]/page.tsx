"use client";

import { useEffect, useState } from "react";
import FactoryPageNavbar from "@/components/Navbar/FactoryPageNavbar";
import Bento from "@/components/assetdashboard/Bento";
import { BackendConnector, GetConfig } from "@/app/api/_utils/connector";
import { Asset } from "@/app/types/types";

export default function Page({
    params,
}: {
    params: { factoryId: string; assetId: string };
}) {
    const { factoryId, assetId } = params;

    const [assets, setAssets] = useState<Asset[]>([]);
    
    console.log(`assetId: ${assetId}`)

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const config: GetConfig = {
                    resource: "assets",
                    params: { factoryId },
                };
                const newAssets = await BackendConnector.get<Asset[]>(config);
                setAssets(newAssets);
            } catch (error) {
                console.error("Failed to fetch assets:", error);
            }
        };

        if (factoryId) {
            fetchAssets();
        }
    }, [factoryId]);

    const asset = assets.find((asset) => asset.assetId === assetId);
    console.log(`asset: ${asset}`)

    return (
        <main className="flex flex-col bg-[#FAFAFA] min-h-screen mx-auto smooth-scroll">
            <div className="flex flex-col bg-[url('/background/Grid.svg')] min-h-screen rounded-3xl bg-opacity-[15%]">
                <FactoryPageNavbar pageId="Dashboard" factoryId={factoryId} />
            </div>
            <div className="px-32 -mt-[35rem]">
                <Bento factoryId={factoryId} asset={asset as Asset}></Bento>
            </div>
        </main>
    );
}