/**
 * @jest-environment jsdom
 */

/*
    TODO: 
            - Properly mock process.env.NEXT_PUBLIC_AWS_ENDPOINT within each function's test
            - Include errors in testing to make sure they fail properly
*/

import "@testing-library/jest-dom";
import { Factory } from "@/app/types/types";
import * as api from "../app/api/factories/factoryAPI";

const originalEnv = process.env;

describe("Factory API", () => {
    beforeEach(() => {    
        jest.resetModules()
        process.env = { 
            ...originalEnv,
            NEXT_PUBLIC_AWS_ENDPOINT: "https://example.com/api"
        };
        global.fetch = jest.fn();
    });
    
    afterEach(() => {
        process.env = originalEnv;
        (global.fetch as jest.Mock).mockClear();
    });

    const mockFactory = {
        factoryId: "1",
        name: "Factory 1",
        location: {
            latitude: 123.456,
            longitude: 456.789,
        },
        description: "none",
    };

    test("should return a factor using getFactory", async () => {
        const mockResponse = mockFactory;

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: () => mockResponse,
        } as unknown as Response);

        const result = await api.getFactory("1");

        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("should return a new factor using createFactory", async () => {
        const mockResponse = mockFactory;

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: () => mockResponse,
        } as unknown as Response);

        const result = await api.createFactory(mockFactory as Factory); // Using 'as Factory' to suppress TypeScript error

        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("should return all factories using getAllFactories", async () => {
        const mockResponse = [mockFactory];

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: () => mockResponse,
        } as unknown as Response);

        const result = await api.getAllFactories();

        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("should update a factory using updateFactory", async () => {
        const updatedFactory = {
            ...mockFactory,
            name: "Updated Factory",
        };
        const mockResponse = updatedFactory;

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: () => mockResponse,
        } as unknown as Response);

        const result = await api.updateFactory(updatedFactory as Factory); // Using 'as Factory' to suppress TypeScript error

        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
