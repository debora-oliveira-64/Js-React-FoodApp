import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../Home";
import useRestaurants from "../../components/hooks/useRestaurants";

jest.mock("../../components/hooks/useRestaurants");

const mockRestaurants = [
  {
    _id: "1",
    name: "Restaurant A",
    category: "Italian",
    valid: true,
    plates: [
      {
        _id: "p1",
        name: "Spaghetti",
        type: "Carne",
        dose: [
          { type: "small", price: 10 },
          { type: "large", price: 15 },
        ],
      },
    ],
  },
  {
    _id: "2",
    name: "Restaurant B",
    category: "Asian",
    valid: true,
    plates: [
      {
        _id: "p2",
        name: "Sushi",
        type: "Peixe",
        dose: [
          { type: "small", price: 20 },
          { type: "large", price: 30 },
        ],
      },
    ],
  },
];

describe("Home Component", () => {
  it("displays loading state initially", () => {
    useRestaurants.mockReturnValue({ restaurants: [], loading: true, error: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays an error message if fetching restaurants fails", () => {
    useRestaurants.mockReturnValue({ restaurants: [], loading: false, error: "Failed to fetch" });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("displays restaurants and filters by search query", async () => {
    useRestaurants.mockReturnValue({ restaurants: mockRestaurants, loading: false, error: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Restaurant A")).toBeInTheDocument();
    expect(screen.getByText("Restaurant B")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search for a restaurant..."), {
      target: { value: "Restaurant A" },
    });

    await waitFor(() => {
      expect(screen.getByText("Restaurant A")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.queryByText("Restaurant B")).not.toBeInTheDocument();
    });
  });

  it("filters restaurants by category", async () => {
    useRestaurants.mockReturnValue({ restaurants: mockRestaurants, loading: false, error: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Filter by Category:"), {
      target: { value: "Italian" },
    });

    await waitFor(() => {
      expect(screen.getByText("Restaurant A")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.queryByText("Restaurant B")).not.toBeInTheDocument();
    });
  });

  it("filters restaurants by plate type and price range", async () => {
    useRestaurants.mockReturnValue({ restaurants: mockRestaurants, loading: false, error: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Filter by Plate Type:"), {
      target: { value: "Peixe" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter minimum price"), {
      target: { value: "25" },
    });

    await waitFor(() => {
      expect(screen.getByText("Restaurant B")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.queryByText("Restaurant A")).not.toBeInTheDocument();
    });
  });

  it("displays a message when no restaurants match the filters", async () => {
    useRestaurants.mockReturnValue({ restaurants: mockRestaurants, loading: false, error: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Filter by Category:"), {
      target: { value: "French" },
    });

    await waitFor(() => {
      expect(screen.getByText("No restaurants match your search or filter criteria.")).toBeInTheDocument();
    });
  });
});
