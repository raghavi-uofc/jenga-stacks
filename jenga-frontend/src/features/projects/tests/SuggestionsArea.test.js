// Ensure global functions exist in Jest/JSDOM before test
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = jest.fn(() => "blob-url");
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = jest.fn();
}

// Mock react-markdown (to avoid ESM error in Jest)
jest.mock("react-markdown", () => ({ children }) => (
  <div data-testid="markdown-render">{children}</div>
));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SuggestionsArea from "../SuggestionsArea";

describe("SuggestionsArea", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows default message if no suggestions", () => {
    render(<SuggestionsArea projectName="AI Project" />);
    expect(
      screen.getByText(/submit your project to generate/i)
    ).toBeInTheDocument();
  });

  test("shows loading message when loading (not draft)", () => {
    render(<SuggestionsArea loading={true} status="submitted" />);
    expect(
      screen.getByText(/generating suggestions/i)
    ).toBeInTheDocument();
  });

  test("renders suggestions via markdown", () => {
    render(<SuggestionsArea llmSuggestions={"# Title\nDetails here"} />);
    expect(screen.getByTestId("markdown-render").textContent).toContain("Title");
  });
});
