jest.mock("react-markdown", () => () => <div />);

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";


// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Projects link for non-admin and triggers navigation", () => {
    render(<Sidebar isAdmin={false} activeLink="projects" />);
    const projectsLink = screen.getByText("Projects");
    expect(projectsLink).toBeInTheDocument();
    expect(projectsLink).toHaveClass("active"); // active state

    fireEvent.click(projectsLink);
    expect(mockNavigate).toHaveBeenCalledWith("/projects");
  });

  it("does not render Projects link for admin", () => {
    render(<Sidebar isAdmin={true} activeLink="projects" />);
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });

  it("shows Manage Accounts for admin and triggers navigation", () => {
    render(<Sidebar isAdmin={true} activeLink="manage-accounts" />);
    const manageAccountsLink = screen.getByText("Manage Accounts");
    expect(manageAccountsLink).toBeInTheDocument();
    expect(manageAccountsLink).toHaveClass("active");

    fireEvent.click(manageAccountsLink);
    expect(mockNavigate).toHaveBeenCalledWith("/manage-accounts");
  });
});
