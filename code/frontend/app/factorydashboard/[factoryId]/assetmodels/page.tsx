"use client";

import React from "react";
import FactoryPageNavbar from "@/components/Navbar/FactoryPageNavbar";
import CreateModelForm from "@/components/models/createmodelform/CreateModelForm";
import ModelTable from "@/components/factorydashboard/ModelTable";

export default function Page({ params }: { params: { factoryId: string } }) {
    const { factoryId } = params;

    return (
        <main className="flex flex-col bg-[#FAFAFA] min-h-screen mx-auto smooth-scroll">
            <div className="flex flex-col bg-[url('/background/Grid.svg')] min-h-screen rounded-3xl bg-opacity-[15%]">
                <FactoryPageNavbar
                    pageId="Asset Models"
                    factoryId={factoryId}
                />
                <div className="flex flex-col gap-y-16">
                    <CreateModelForm factoryId={factoryId} />
                    <ModelTable factoryId={factoryId} />
                </div>
            </div>
        </main>
    );
}
