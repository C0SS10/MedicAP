import { z } from "zod";

export const RegistroClienteSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Solo letras, números y guion bajo"),
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  telefono: z.string().regex(/^\d{10}$/, "Debe tener 10 dígitos"),
  direccion: z
    .string()
    .regex(
      /^(calle|cl|cll|carrera|cra|cr|diagonal|diag|dg|transversal|trans|tv|avenida|av)\.?\s+\d+[a-z]?\s*(bis)?\s*(sur|norte)?\s*#\s*\d+[a-z]?\s*-\s*\d+(\s*,?\s*.*)?$/i,
      "Formato esperado: Calle 72 # 10-34, Apto 101",
    ),
});

export type RegistroClienteInput = z.infer<typeof RegistroClienteSchema>;

export const LoginSchema = z.object({
  identificador: z.string().min(3, "Ingresa tu usuario o correo"),
  password: z.string().min(8, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
