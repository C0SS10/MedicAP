import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <h1 className="font-display mb-6 text-center text-3xl">Inicia sesión</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-ink-muted">
        ¿No tienes cuenta? <a href="/registro" className="underline">Regístrate</a>
      </p>
    </div>
  );
}