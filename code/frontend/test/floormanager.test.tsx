/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { BackendConnector } from "@/app/api/_utils/connector";
import FloorManager from "../components/factorydashboard/floormanager/FloorManager";
import AddAssetForm from "../components/factorydashboard/floormanager/assetform/AddAssetForm";

jest.mock("@/app/api/_utils/connector", () => ({
    BackendConnector: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe("FloorManager", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        BackendConnector.get.mockResolvedValue([
            {
                assetId: "mockAssetId1",
                name: "Mock Asset 1",
                description: "Mock Description 1",
                imageData: "mockImage1.jpg",
                factoryId: "1",
            },
        ]);

        BackendConnector.post.mockImplementation(() =>
            Promise.resolve({
                assetId: "mockGeneratedAssetId",
                message: "Asset mockGeneratedAssetId created successfully",
            }),
        );
    });

    test("should open AddAssetForm when 'Create Asset' button is clicked", async () => {
        const { getByText, findByPlaceholderText } = render(
            <FloorManager setAssetMarkers={jest.fn()} factoryId="1" />,
        );

        const addButton = getByText("Add Asset");
        fireEvent.click(addButton);

        const nameInput = await findByPlaceholderText("Name");
        const descriptionInput = await findByPlaceholderText("Description");

        expect(nameInput).toBeInTheDocument();
        expect(descriptionInput).toBeInTheDocument();
    });

    test("should add new asset to FloorManager when AddAssetForm is filled out and submitted", async () => {
        const handleAdd = jest.fn();

        const { getByText, getByPlaceholderText } = render(
            <AddAssetForm
                onAdd={handleAdd}
                onClose={jest.fn()}
                factoryId="1"
            />,
        );

        const nameInput = getByPlaceholderText("Name");
        const descriptionInput = getByPlaceholderText("Description");
        const createAssetButton = getByText("Create Asset");

        fireEvent.change(nameInput, { target: { value: "New Asset" } });
        fireEvent.change(descriptionInput, {
            target: { value: "New Asset Description" },
        });

        fireEvent.click(createAssetButton);

        await waitFor(() => {
            expect(BackendConnector.post).toHaveBeenCalledWith({
                resource: "assets",
                payload: {
                    name: "New Asset",
                    description: "New Asset Description",
                    factoryId: "1",
                },
            });
            expect(handleAdd).toHaveBeenCalled();
        });
    });
});
