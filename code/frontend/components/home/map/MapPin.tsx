"use client";

import React, { useState } from 'react';
import { Marker, Popup } from "react-leaflet";
import Link from "next/link";
import Image from "next/image";
import { Factory } from "@/app/types/types";


interface PinProps {
    key: number;
    position: { lat: number; lng: number };
    factoriesAtLocation: Factory[];
    icon: L.Icon;
}

const MapPin: React.FC<PinProps> = ({
    key,
    position,
    factoriesAtLocation,
    icon,
}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const currentFactory = factoriesAtLocation[currentPageIndex];
    const link = `/factorydashboard/${currentFactory.factoryId}`

    return (
        <Marker key={key} position={position} icon={icon}>
            <Popup className="w-56">
                <div className="w-full">
                    <h3 className="font-bold text-base text-slate-600">{currentFactory.name}</h3>
                    <div className="flex flex-col gap-y-1">
                        <div className="flex flex-row gap-x-1 border-b-2 border-slate-300 py-0">
                            <Image
                                src="/icons/map/popup/location.svg"
                                width={17}
                                height={17}
                                className="select-none"
                                alt="error pin"
                            />
                            <p className="font-thin	text-slate-500 my-0 text-xs">{`${Number(position.lat).toFixed(2)}°, ${Number(position.lng).toFixed(2)}°`}</p>
                        </div>
                    </div>

                    {currentFactory.description ? (
                        <p className="font-text-xs text-pretty">{currentFactory.description}</p>
                    )
                    : (
                        <p className="font-text-xs text-pretty text-slate-400">{"No description."}</p>
                    )
                        
                    }
                    <div className="w-fit">
                        {link && (
                            <Link
                                href={link}
                                className="text-sm hover:text-MainBlue group"
                            >
                                View Factory
                                <span className="text-lg font-bold pt-0.5 pl-0.5 group-hover:pl-1.5 duration-500">
                                    ›
                                </span>
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-rows-1 grid-cols-3 gap-x-[20%] mt-2 ">
                        <button type="button" onClick={() => setCurrentPageIndex(currentPageIndex-1)} className="text-xs text-slate-400 hover:text-MainBlue group">
                            <span className="font-semibold text-base font-bold pt-1 pr-0.5 group-hover:pr-1.5 duration-500">
                            ‹
                            </span>
                            Previous
                        </button>
                        <p className="text-center justify-center content-center text-xs font-bold">{currentPageIndex}</p>
                        <button type="button" onClick={() => setCurrentPageIndex(currentPageIndex+1)} className="text-xs text-slate-400 hover:text-MainBlue group">
                            Next
                            <span className="font-semibold text-base font-bold pt-1 pl-0.5 group-hover:pl-1.5 duration-500">
                            ›
                            </span>
                        </button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
export default MapPin;
