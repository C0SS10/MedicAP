import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegistroPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <h1 className="font-display mb-6 text-center text-3xl">Crea tu cuenta</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta? <a href="/iniciar-sesion" className="underline">Inicia sesión</a>
      </p>
    </div>
  );
}