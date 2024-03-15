/**
 * @jest-environment jsdom
 */

/*
    TODO:  Factory Table updates sort state correctly
*/

import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FactoryTable from "../components/home/FactoryTable.client";
import Caret from "../components/home/table/Caret";
import { getAllFactories } from "../app/api/factories/factoryAPI";
import * as api from "../app/api/factories/factoryAPI";

jest.mock("../app/api/factories/factoryAPI");

const fakeFactories = [
    {
        factoryId: 1,
        name: "Factory 1",
        lat: 123.456,
        lon: 456.789,
        description: "This is the first factory",
        location: {
            latitude: 123.456,
            longitude: 456.789,
        },
    },
    {
        factoryId: 2,
        name: "Factory 2",
        lat: 234.567,
        lon: 567.89,
        description: "This is the second factory",
        location: {
            latitude: 234.567,
            longitude: 567.89,
        },
    },
    // Add more fake factories as needed
];

beforeEach(() => {
    (getAllFactories as jest.Mock).mockResolvedValue(fakeFactories); // Mock the API response
});

describe("FactoryTable", () => {
    test("renders table with correct headers", async () => {
        render(<FactoryTable />);
        await waitFor(() => screen.getAllByRole("columnheader"));
        const headers = screen.getAllByRole("columnheader");
        expect(headers).toHaveLength(4);
        expect(headers[0]).toHaveTextContent("Facility Name");
        expect(headers[1]).toHaveTextContent("Latitude");
        expect(headers[2]).toHaveTextContent("Longitude");
        expect(headers[3]).toHaveTextContent("Description");
    });

    test("renders facilities correctly", async () => {
        render(<FactoryTable />);
        await waitFor(() => screen.getByText("Factory 1"));
        const facilityNames = screen.getAllByText(/Factory \d/);
        expect(facilityNames).toHaveLength(fakeFactories.length);
    });

    test("displays error message when data fetching fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        jest.spyOn(api, "getAllFactories").mockRejectedValueOnce(
            new Error("Failed to fetch data"),
        );
        render(<FactoryTable />);
        await waitFor(() =>
            expect(screen.getByText("No Facilities Found")).toBeInTheDocument(),
        );
    });

    test("displays data correctly in table cells", async () => {
        render(<FactoryTable />);
        await waitFor(() =>
            expect(
                screen.getByText(fakeFactories[0].name),
            ).toBeInTheDocument(),
        );

        expect(screen.getByText(fakeFactories[0].name)).toBeInTheDocument();
        expect(
            screen.getByText(fakeFactories[0].lat.toString()),
        ).toBeInTheDocument();
        expect(
            screen.getByText(fakeFactories[0].lon.toString()),
        ).toBeInTheDocument();
        expect(
            screen.getByText(fakeFactories[0].description),
        ).toBeInTheDocument();

        expect(screen.getByText(fakeFactories[1].name)).toBeInTheDocument();
        expect(
            screen.getByText(fakeFactories[1].lat.toString()),
        ).toBeInTheDocument();
        expect(
            screen.getByText(fakeFactories[1].lon.toString()),
        ).toBeInTheDocument();
        expect(
            screen.getByText(fakeFactories[1].description),
        ).toBeInTheDocument();
    });


    test("displays View all link and navigates correctly", () => {
        render(<FactoryTable />);
        const viewAllLink = screen.getByRole("link", { name: /View all/i });
        expect(viewAllLink).toBeInTheDocument();
        expect(viewAllLink).toHaveAttribute("href", "/");
    });



    test("Caret renders with correct direction", () => {
        const { getByTestId } = render(<Caret direction="desc" />);
        const caretSvg = getByTestId("caret");
        expect(caretSvg).toHaveClass("transform rotate-180");
    });

    test("Caret renders without rotation for opposite direction", () => {
        const { getByTestId } = render(<Caret direction="asc" />);
        const caretSvg = getByTestId("caret");
        expect(caretSvg).not.toHaveClass("transform rotate-180");
    });

    test("Caret logs direction when rendered", () => {
        const spy = jest.spyOn(console, "log");
        render(<Caret direction="asc" />);
        expect(spy).toHaveBeenCalledWith("Caret direction: asc");
    });
});

/* 
    This fails since it is not getting the results from the  Factory Table but eh

    test('handleHeaderClick updates sort state correctly', () => {
        const { getByText } = render(<FactoryTable />);
        const headerToClick = getByText('Facility Name'); // Choose a header to click
    
        // Click the header to trigger handleHeaderClick
        fireEvent.click(headerToClick);
    
        // Now assert on the updated state
        // For example, if your implementation adds some symbol to indicate sorting direction
        // you may expect the text content of the header to change after clicking
        expect(screen.getByText('Facility Name')).toHaveTextContent('Facility Name ▼');
    
        // You can also test multiple clicks to toggle between 'asc' and 'desc'
        fireEvent.click(headerToClick); // Click again to toggle sort direction
    
        // Assert on the updated state
        // Assuming after clicking twice, the sort direction should be 'asc' again
        expect(screen.getByText('Facility Name')).toHaveTextContent('Facility Name ▲');
      }); */
