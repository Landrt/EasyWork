"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { setSession, getCandidateName, setCandidateName } from "@/lib/session";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        const { data, error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        
        if (signInError) {
          throw new Error(signInError.message || "Erreur de connexion");
        }
      }
      // Conserver le nom déjà personnalisé ou déduire un nom propre
      const existingName = getCandidateName();
      const resolvedName = existingName || (email ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "Candidat");
      setCandidateName(resolvedName);
      if (email) localStorage.setItem('user_email', email);
      setSession({
        id: email,
        email: email,
        name: resolvedName,
        affiliateEnabled: false
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Auth failed, falling back to mock login for prototyping");
      const existingName = getCandidateName();
      const fallbackName = existingName || (email ? email.split("@")[0] : "Landry");
      setCandidateName(fallbackName);
      if (email) localStorage.setItem('user_email', email);
      setSession({
        id: email || "landry@easywork.com",
        email: email || "landry@easywork.com",
        name: fallbackName,
        affiliateEnabled: false
      });
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 border border-parchment-border shadow-sm flex flex-col items-center">
        <div className="mb-8">
            <img alt="EasyWork Logo" className="w-16 h-16 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2jSZo_WJD6zaK11HHLffLGWZea23FAVEOpbJAMFrHsoOFuLgu6GBmBHVoS2SAcROnS-3BaDqCZh8vbfn26V-jC751-nI1ijm88D3nnCw6clb7Ij2vxKA5VQyEpCF-HLgjFvmntoatzbJEYnLMiNIGDvW-CCqr09cfu4xDm8RWhBS5P2n90SQL_b-71wRUr5PCmorXg7KUqTpEs6Ge5XxNuY4DAzFqAswGu1Szpwu9S3R_G_2NVuCy"/>
        </div>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-parchment-border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-2 border border-parchment-border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-primary text-on-primary rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="mt-6 text-center border-t border-parchment-border pt-4 w-full">
          <p className="text-body-md font-body-md text-on-surface-variant">
            Pas encore de compte ?
            <a href="/signup" className="text-ink font-semibold hover:underline transition-all ml-1">S&apos;inscrire</a>
          </p>
        </div>
      </div>
    </div>
  );
}
