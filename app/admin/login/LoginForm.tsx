"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../admin.module.css";

export function LoginForm({ destination }: { destination: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) {
        setError(payload.error || "No se pudo iniciar sesión");
        return;
      }
      router.replace(destination);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.loginForm} onSubmit={submit}>
      <div className={styles.loginIcon}><LockKeyhole size={22} /></div>
      <span>Acceso privado</span>
      <h1>Industrial Remotos Control</h1>
      <p>Ingresa con las credenciales administrativas configuradas en el servidor.</p>
      <label>Correo electrónico<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
      <label>Contraseña<input name="password" type="password" autoComplete="current-password" required minLength={1} maxLength={128} /></label>
      {error && <div className={styles.loginError} role="alert">{error}</div>}
      <button type="submit" disabled={pending}>{pending ? "Verificando…" : "Ingresar"}<ArrowRight size={17} /></button>
      <small>No existe registro público ni credenciales predeterminadas.</small>
    </form>
  );
}
