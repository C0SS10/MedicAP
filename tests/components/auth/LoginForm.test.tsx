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

import { LoginForm } from "@/components/auth/LoginForm";
import { login } from "@/app/iniciar-sesion/Actions";

vi.mock("@/app/iniciar-sesion/Actions", () => ({
  login: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los campos del formulario", () => {
    render(<LoginForm />);

    expect(
      screen.getByLabelText("Usuario o correo"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Contraseña"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Iniciar sesión",
      }),
    ).toBeInTheDocument();
  });

  it("el campo password es de tipo password", () => {
    render(<LoginForm />);

    expect(
      screen.getByLabelText("Contraseña"),
    ).toHaveAttribute("type", "password");
  });

  it("muestra errores cuando los datos son inválidos", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("Usuario o correo"),
      "ab",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "123",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Iniciar sesión",
      }),
    );

    expect(
      await screen.findByText(
        "Ingresa tu usuario o correo",
      ),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Ingresa tu contraseña",
      ),
    ).toBeInTheDocument();

    expect(login).not.toHaveBeenCalled();
  });

  it("envía los datos válidos al Server Action", async () => {
    const user = userEvent.setup();

    vi.mocked(login).mockResolvedValue({ error: "undefined" });

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("Usuario o correo"),
      "esteban@example.com",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "12345678",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Iniciar sesión",
      }),
    );

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        identificador: "esteban@example.com",
        password: "12345678",
      });
    });
  });

  it("muestra el error devuelto por el servidor", async () => {
    const user = userEvent.setup();

    vi.mocked(login).mockResolvedValue({
      error: "Usuario o contraseña incorrectos.",
    });

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("Usuario o correo"),
      "esteban@example.com",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "passwordIncorrecta",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Iniciar sesión",
      }),
    );

    expect(
      await screen.findByText(
        "Usuario o contraseña incorrectos.",
      ),
    ).toBeInTheDocument();
  });

  it("limpia un error anterior antes de realizar otro submit", async () => {
    const user = userEvent.setup();

    vi.mocked(login)
      .mockResolvedValueOnce({
        error: "Usuario o contraseña incorrectos.",
      })
      .mockResolvedValueOnce({ error: "undefined" });

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("Usuario o correo"),
      "esteban@example.com",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "12345678",
    );

    const button = screen.getByRole("button", {
      name: "Iniciar sesión",
    });

    await user.click(button);

    expect(
      await screen.findByText(
        "Usuario o contraseña incorrectos.",
      ),
    ).toBeInTheDocument();

    await user.click(button);

    await waitFor(() => {
      expect(
        screen.queryByText(
          "Usuario o contraseña incorrectos.",
        ),
      ).not.toBeInTheDocument();
    });
  });
});