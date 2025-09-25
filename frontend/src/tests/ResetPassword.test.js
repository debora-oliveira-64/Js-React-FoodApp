import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../ResetPassword";

global.fetch = jest.fn();

describe("ResetPassword Component", () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it("renders the reset password form", () => {
    render(<ResetPassword />);

    expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset email/i })).toBeInTheDocument();
  });

  it("shows a success message when the email is sent successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText("Email Address");
    const submitButton = screen.getByRole("button", { name: /send reset email/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    // Expect loading state
    expect(submitButton).toHaveTextContent("Sending...");
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Password reset email sent successfully!")).toBeInTheDocument();
    });

    expect(submitButton).toHaveTextContent("Send Reset Email");
    expect(submitButton).not.toBeDisabled();
  });

  it("shows an error message when the email is not found", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "User not found" }),
    });

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText("Email Address");
    const submitButton = screen.getByRole("button", { name: /send reset email/i });

    fireEvent.change(emailInput, { target: { value: "nonexistent@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument();
    });

    expect(submitButton).toHaveTextContent("Send Reset Email");
    expect(submitButton).not.toBeDisabled();
  });

  it("shows a generic error message when the fetch fails unexpectedly", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText("Email Address");
    const submitButton = screen.getByRole("button", { name: /send reset email/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred. Please try again.")).toBeInTheDocument();
    });

    expect(submitButton).toHaveTextContent("Send Reset Email");
    expect(submitButton).not.toBeDisabled();
  });

  it("disables the submit button while loading", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText("Email Address");
    const submitButton = screen.getByRole("button", { name: /send reset email/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Sending...");

    await waitFor(() => {
      expect(screen.getByText("Password reset email sent successfully!")).toBeInTheDocument();
    });

    expect(submitButton).not.toBeDisabled();
  });
});
