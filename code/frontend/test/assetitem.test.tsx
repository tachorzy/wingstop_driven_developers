/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Asset } from "@/app/api/_utils/types";
import AssetItem from "../components/factorydashboard/floormanager/inventory/AssetItem";

global.URL.createObjectURL = jest
    .fn()
    .mockReturnValue("http://test.com/test.png");

jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, ...props }: { src: string }) => {
        const MockNextImage = ({ imageSrc }: { imageSrc: string }) => (
            <div data-testid="mock-next-image" data-src={imageSrc} />
        );

        return <MockNextImage imageSrc={src} {...props} />;
    },
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
        blob: () => Promise.resolve("mocked blob"),
    }),
) as jest.Mock;

describe("AssetItem", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockAsset: Asset = {
        assetId: "1",
        name: "Asset 1",
        description: "Description",
        imageData: "image1.png",
        factoryId: "1",
    };

    const props = {
        asset: mockAsset,
        setSelectedAsset: jest.fn(),
        selectedAsset: null,
    };

    test("should render correctly with valid asset", async () => {
        const { getByTestId } = render(<AssetItem {...props} />);

        await waitFor(() => {
            expect(getByTestId("mock-next-image")).toBeInTheDocument();
        });
    });

    test("should render with placeholder image", async () => {
        const noImageDataAssetProp = {
            ...props,
            asset: {
                ...mockAsset,
                imageData: undefined,
            },
        };

        const { getByTestId } = render(<AssetItem {...noImageDataAssetProp} />);

        await waitFor(() => {
            expect(getByTestId("mock-next-image")).toBeInTheDocument();
            expect(getByTestId("mock-next-image")).toHaveAttribute(
                "data-src",
                "/icons/floorplan/placeholder-asset.svg",
            );
        });
    });

    test("should display 'No Asset data avaible' when the asset is undefinded", () => {
        const noAssetProp = {
            ...props,
            asset: undefined,
        };
        const { getByText } = render(<AssetItem {...noAssetProp} />);

        expect(getByText("No asset data available")).toBeInTheDocument();
    });

    test("should select asset when clicked", async () => {
        const { getByRole } = render(<AssetItem {...props} />);

        fireEvent.click(getByRole("button"));

        await waitFor(() => {
            expect(props.setSelectedAsset).toHaveBeenCalledWith(mockAsset);
        });
    });

    test("should have border-blue-200 when selected", async () => {
        const selectedAssetProp = {
            ...props,
            selectedAsset: mockAsset,
        };

        const { getByRole } = render(<AssetItem {...selectedAssetProp} />);

        await waitFor(() => {
            expect(getByRole("button")).toHaveClass("border-blue-200");
        });
    });
});
