import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { registerClient } from "@/app/registro/Actions";

vi.mock("@/app/registro/Actions", () => ({
  registerClient: vi.fn(),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza todos los campos", () => {
    render(<RegisterForm />);

    expect(
      screen.getByLabelText("Nombre de usuario"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Correo electrónico"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Número de contacto"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Dirección"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Contraseña"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Crear cuenta",
      }),
    ).toBeInTheDocument();
  });

  it("renderiza ayuda accesible para la contraseña", () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole("button", {
        name: "Requisitos de la contraseña",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mínimo 8 caracteres."),
    ).toBeInTheDocument();
  });

  it("muestra errores con formulario vacío", async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.click(
      screen.getByRole("button", {
        name: "Crear cuenta",
      }),
    );

    expect(
      await screen.findByText("Mínimo 3 caracteres"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Correo inválido"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debe tener 10 dígitos"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mínimo 8 caracteres"),
    ).toBeInTheDocument();

    expect(registerClient).not.toHaveBeenCalled();
  });

  it("envía correctamente un formulario válido", async () => {
    const user = userEvent.setup();

    vi.mocked(registerClient).mockResolvedValue(
      { error: "undefined" }
    );

    render(<RegisterForm />);

    await user.type(
      screen.getByLabelText("Nombre de usuario"),
      "esteban",
    );

    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "esteban@example.com",
    );

    await user.type(
      screen.getByLabelText("Número de contacto"),
      "3001234567",
    );

    await user.type(
      screen.getByLabelText("Dirección"),
      "Calle 72 # 10-34",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "12345678",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Crear cuenta",
      }),
    );

    await waitFor(() => {
      expect(registerClient).toHaveBeenCalledWith({
        username: "esteban",
        email: "esteban@example.com",
        telefono: "3001234567",
        direccion: "Calle 72 # 10-34",
        password: "12345678",
      });
    });
  });

  it("muestra errores enviados por el servidor", async () => {
    const user = userEvent.setup();

    vi.mocked(registerClient).mockResolvedValue({
      error: "Ese correo ya está registrado.",
    });

    render(<RegisterForm />);

    await user.type(
      screen.getByLabelText("Nombre de usuario"),
      "esteban",
    );

    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "esteban@example.com",
    );

    await user.type(
      screen.getByLabelText("Número de contacto"),
      "3001234567",
    );

    await user.type(
      screen.getByLabelText("Dirección"),
      "Calle 72 # 10-34",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "12345678",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Crear cuenta",
      }),
    );

    expect(
      await screen.findByText(
        "Ese correo ya está registrado.",
      ),
    ).toBeInTheDocument();
  });
});