"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function syncProfile(defaultName: string) {
    await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: defaultName }),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await syncProfile(name.trim() || "New User");
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await syncProfile(name.trim() || data.user.email?.split("@")[0] || "User");
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="shell section-space" style={{ maxWidth: "560px" }}>
      <div className="panel stack">
        <h1 className="heading-h2">{mode === "login" ? "Login" : "Sign Up"}</h1>
        <p className="muted">
          {mode === "login"
            ? "Sign in with your Supabase credentials."
            : "Create your account and default viewer profile."}
        </p>
        <form className="stack" onSubmit={handleSubmit}>
          <label className="label" htmlFor="name">
            Name (used for profile sync)
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />

          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />

          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="Minimum 6 characters"
          />

          {error ? <p style={{ color: "#dc2626" }}>{error}</p> : null}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setMode((value) => (value === "login" ? "signup" : "login"))}
        >
          {mode === "login" ? "Need an account? Switch to signup" : "Already have an account? Switch to login"}
        </button>
      </div>
    </section>
  );
}
