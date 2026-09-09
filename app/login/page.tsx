"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    if (error) {
      console.error("ERROR LOGIN:", error);

      setError("Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* TARJETA */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* ENCABEZADO */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🦶</div>

            <h1 className="text-3xl font-bold text-gray-800">
              Panel de administración
            </h1>

            <p className="text-gray-500 mt-2">
              Inicia sesión para administrar tu página.
            </p>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={iniciarSesion} className="space-y-5">
            {/* CORREO */}
            <div>
              <label
                htmlFor="correo"
                className="block font-semibold text-gray-700 mb-2"
              >
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Ingresa tu correo"
                autoComplete="email"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label
                htmlFor="contrasena"
                className="block font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>

              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando
                ? "⏳ Iniciando sesión..."
                : "🔐 Iniciar sesión"}
            </button>
          </form>
        </div>

        {/* VOLVER */}
        <a
          href="/"
          className="block w-full text-center text-gray-500 hover:text-pink-600 mt-5 transition"
        >
          ← Volver al sitio
        </a>
      </div>
    </main>
  );
}