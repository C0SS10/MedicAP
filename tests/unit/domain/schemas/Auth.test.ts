import { describe, expect, it } from "vitest";

import { LoginSchema, RegistroClienteSchema } from "@/domain/schemas/Auth";

describe("RegistroClienteSchema", () => {
  const validData = {
    username: "esteban_123",
    email: "esteban@example.com",
    password: "password123",
    telefono: "3001234567",
    direccion: "Calle 72 # 10-34, Apto 101",
  };

  describe("username", () => {
    it("acepta un username válido", () => {
      const result = RegistroClienteSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("rechaza usernames con menos de 3 caracteres", () => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        username: "ab",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Mínimo 3 caracteres");
      }
    });

    it("rechaza usernames con más de 20 caracteres", () => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        username: "a".repeat(21),
      });

      expect(result.success).toBe(false);
    });

    it.each(["esteban!", "esteban@123", "esteban 123", "esteban#"])(
      "rechaza el username inválido %s",
      (username) => {
        const result = RegistroClienteSchema.safeParse({
          ...validData,
          username,
        });

        expect(result.success).toBe(false);
      },
    );

    it.each(["esteban", "esteban_123", "esteban-123", "esteban.test"])(
      "acepta el username %s",
      (username) => {
        const result = RegistroClienteSchema.safeParse({
          ...validData,
          username,
        });

        expect(result.success).toBe(true);
      },
    );
  });

  describe("email", () => {
    it("acepta un correo válido", () => {
      const result = RegistroClienteSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it.each(["correo", "correo@", "@dominio.com", "correo@dominio"])(
      "rechaza el correo inválido %s",
      (email) => {
        const result = RegistroClienteSchema.safeParse({
          ...validData,
          email,
        });

        expect(result.success).toBe(false);
      },
    );
  });

  describe("password", () => {
    it("acepta una contraseña de 8 caracteres", () => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        password: "12345678",
      });

      expect(result.success).toBe(true);
    });

    it("rechaza una contraseña con menos de 8 caracteres", () => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        password: "1234567",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(
          "Mínimo 8 caracteres",
        );
      }
    });
  });

  describe("telefono", () => {
    it("acepta exactamente 10 dígitos", () => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        telefono: "3001234567",
      });

      expect(result.success).toBe(true);
    });

    it.each([
      "300123456",
      "30012345678",
      "300ABC4567",
      "+573001234567",
      "300 123 4567",
    ])("rechaza el teléfono inválido %s", (telefono) => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        telefono,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("direccion", () => {
    it.each([
      "Calle 72 # 10-34",
      "Calle 72 # 10-34, Apto 101",
      "Carrera 10 # 20-30",
      "Cra 10 # 20-30",
      "CL 10 # 20-30",
      "Avenida 10 # 20-30",
      "Diagonal 10 # 20-30",
      "Transversal 10 # 20-30",
      "Calle 10 bis # 20-30",
      "Calle 10 sur # 20-30",
    ])("acepta la dirección %s", (direccion) => {
      const result = RegistroClienteSchema.safeParse({
        ...validData,
        direccion,
      });

      expect(result.success).toBe(true);
    });

    it.each(["mi casa", "Calle 10", "10 # 20-30", "Carrera abc", ""])(
      "rechaza la dirección %s",
      (direccion) => {
        const result = RegistroClienteSchema.safeParse({
          ...validData,
          direccion,
        });

        expect(result.success).toBe(false);
      },
    );
  });
});

describe("LoginSchema", () => {
  it("acepta login mediante username", () => {
    const result = LoginSchema.safeParse({
      identificador: "esteban",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("acepta login mediante email", () => {
    const result = LoginSchema.safeParse({
      identificador: "esteban@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza identificadores demasiado cortos", () => {
    const result = LoginSchema.safeParse({
      identificador: "ab",
      password: "12345678",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.identificador).toContain(
        "Ingresa tu usuario o correo",
      );
    }
  });

  it("rechaza contraseñas menores a 8 caracteres", () => {
    const result = LoginSchema.safeParse({
      identificador: "esteban",
      password: "1234567",
    });

    expect(result.success).toBe(false);
  });
});
