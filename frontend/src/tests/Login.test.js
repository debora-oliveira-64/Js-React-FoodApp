import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/authContext";
import Login from "../pages/Login";

jest.mock("../components/contexts/authContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../components/QrCode/QrcodeCreate", () => () => <div>QR Code Component</div>);
jest.mock("../components/QrCode/QrcodeRead", () => ({ setDataLogin }) => (
  <button onClick={() => setDataLogin({ name: "testQR", password: "passwordQR" })}>
    Scan QR Code
  </button>
));

describe("Login Page", () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("QR Code Component")).toBeInTheDocument();
  });

  it("logs in successfully with valid credentials", async () => {
    mockLogin.mockResolvedValueOnce(true);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Entrar"));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("testuser", "password123"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays an error message for invalid credentials", async () => {
    mockLogin.mockResolvedValueOnce(false);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "invaliduser" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "wrongpassword" } });
    fireEvent.click(screen.getByText("Entrar"));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("invaliduser", "wrongpassword"));
    expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
  });

  it("displays an error message when login fails", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Login failed"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Entrar"));

    await screen.findByText("Algo deu errado. Tente novamente.");
  });

  it("toggles QR Code scanning", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Scan QR Code"));
    expect(screen.getByText("Scan QR Code")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancelar Scan"));
    expect(screen.getByText("QR Code Component")).toBeInTheDocument();
  });

  it("logs in successfully using QR code data", async () => {
    mockLogin.mockResolvedValueOnce(true);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Scan QR Code"));

    fireEvent.click(screen.getByText("Scan QR Code"));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("testQR", "passwordQR"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays an error for invalid QR code data", async () => {
    mockLogin.mockResolvedValueOnce(false);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Scan QR Code"));
    fireEvent.click(screen.getByText("Scan QR Code"));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("testQR", "passwordQR"));
    expect(screen.getByText("QR Code inválido")).toBeInTheDocument();
  });
});
