/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Blueprint from "../components/factorydashboard/floorplan/blueprint/Blueprint";
import { Asset } from "@/app/types/types";
import AssetMarker from "../components/factorydashboard/floorplan/blueprint/AssetMarker";

describe("Blueprint Component", () => {
    beforeEach(() => {
        global.URL.createObjectURL = jest.fn();
    });
    test("should render an image as a floorplan", () => {
        const mockAsset: Asset = {
            id: "1",
            name: "Asset 1",
            description: "Description 1",
            image: "/image1.jpg",
        };


        const mockFile = new File(["(⌐□_□)"], "floorplan.jpg", { type: "image/jpg" }); 

        const mockAssetMarkers: JSX.Element[] = [
            <AssetMarker asset={mockAsset} />
        ]

        render(<Blueprint imageFile={mockFile} assetMarkers={mockAssetMarkers} />);

        const floorplan = screen.getByAltText("floorplan") as HTMLImageElement;
        expect(floorplan).toBeInTheDocument();
        expect(floorplan.src).toBeDefined();
    });

    test("should render with the correct CSS classes", () => {
        const mockAsset: Asset = {
            id: "1",
            name: "Asset 1",
            description: "Description 1",
            image: "/image1.jpg",
        };

        const mockFile = new File(["(⌐□_□)"], "floorplan.jpg", { type: "image/jpg" }); 

        const mockAssetMarkers: JSX.Element[] = [
            <AssetMarker asset={mockAsset} />
        ]

        const { container } = render(<Blueprint imageFile={mockFile} assetMarkers={mockAssetMarkers} />);
        expect(container.firstChild).toHaveClass("sticky overflow-hidden h-min w-[55%]")

    });


});
