/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import { Asset } from "@/app/api/_utils/types";
import AssetInventory from "../components/factorydashboard/floormanager/inventory/AssetInventory";

const mockCreateObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;

interface AssetItemProps {
    asset: Asset;
}
const mockAssetItem = jest.fn();
jest.mock(
    "../components/factorydashboard/floormanager/inventory/AssetItem",
    () => {
        const MockAssetItem = (props: AssetItemProps) => {
            mockAssetItem(props);

            const { asset } = props;

            return <div>{asset.name}</div>;
        };
        MockAssetItem.displayName = "AssetItem";
        return MockAssetItem;
    },
);

describe("AssetInventory", () => {
    beforeEach(() => {
        mockCreateObjectURL.mockClear();
    });

    test("should render list of assets by model", () => {
        const mockAssets: Asset[] = [
            {
                assetId: "1",
                name: "Asset 1",
                description: "Description 1",
                imageData: "image1.jpg",
                factoryId: "1",
                modelId: "1",
            },
            {
                assetId: "2",
                name: "Asset 2",
                description: "Description 2",
                imageData: "image2.jpg",
                factoryId: "1",
                modelId: "2",
            },
            {
                assetId: "2",
                name: "Asset 2",
                description: "Description 2",
                imageData: "image2.jpg",
                factoryId: "1",
                modelId: "1",
            },
        ];

        const { getByText } = render(
            <AssetInventory
                assets={mockAssets}
                setSelectedAsset={jest.fn()}
                selectedAsset={null}
                activeNavItem="1"
            />,
        );

        mockAssets
            .filter((asset) => asset.modelId === "1")
            .forEach((asset) => {
                expect(getByText(asset.name)).toBeInTheDocument();
            });
    });

    test("should render No assets available when assets array is empty", () => {
        const assets: Asset[] = [];

        const { getByText } = render(
            <AssetInventory
                assets={assets}
                setSelectedAsset={jest.fn()}
                selectedAsset={null}
                activeNavItem="CNC"
            />,
        );

        expect(getByText("No assets found.")).toBeInTheDocument();
    });

    test("should render No assets available when assets array is null", () => {
        const { getByText } = render(
            <AssetInventory
                assets={undefined}
                setSelectedAsset={jest.fn()}
                selectedAsset={null}
                activeNavItem="CNC"
            />,
        );

        expect(getByText("No assets found.")).toBeInTheDocument();
    });
});
