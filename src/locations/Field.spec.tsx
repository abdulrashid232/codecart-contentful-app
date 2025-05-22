import Field from "./Field";
import { render, screen } from "@testing-library/react";
import { mockCma, mockSdk } from "../../test/mocks";
import { vi } from "vitest";

// Mock the Commerce Layer hook
vi.mock("../services/commerce-layer.service", () => ({
  useCommerceLayer: () => ({
    getProducts: vi.fn().mockResolvedValue({
      data: [
        {
          id: "sku_123",
          type: "skus",
          attributes: {
            code: "TEST-001",
            name: "Test Product",
          },
        },
      ],
    }),
    loading: false,
    error: null,
  }),
}));

// Mock SDK
vi.mock("@contentful/react-apps-toolkit", () => ({
  useSDK: () => ({
    ...mockSdk,
    field: {
      getValue: vi.fn().mockReturnValue(""),
      setValue: vi.fn(),
    },
    window: {
      startAutoResizer: vi.fn(),
      stopAutoResizer: vi.fn(),
    },
  }),
  useCMA: () => mockCma,
}));

describe("Field component", () => {
  it("renders the product selection dropdown", async () => {
    render(<Field />);

    // Check if the component renders the select input
    expect(screen.getByLabelText(/select a product/i)).toBeInTheDocument();

    // Wait for products to load
    const selectOption = await screen.findByText("-- Select a product --");
    expect(selectOption).toBeInTheDocument();
  });
});
