"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Zap, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  
  // Nach Registrierung zum Onboarding weiterleiten
  const signInUrl = useMemo(() => {
    const redirectUrl = searchParams.get("redirect_url") ?? searchParams.get("redirectUrl");
    return redirectUrl
      ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
      : "/login";
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#66dd99]/20 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-[#66dd99]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MOJO Campus</h1>
          <p className="text-slate-500 mt-2">
            Erstelle dein Konto und entdecke deine LEBENSENERGIE
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6 space-y-2">
          {[
            "3-Minuten Check-in – sofort Klarheit",
            "Personalisierte Empfehlungen",
            "100% kostenlos starten",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-[#66dd99] shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        
        {/* Clerk SignUp */}
        <SignUp 
          appearance={{
            variables: {
              colorPrimary: "#66dd99",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#0a0a0a",
              colorText: "#0a0a0a",
              colorTextSecondary: "#6b7280",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-white border border-slate-200 shadow-xl rounded-2xl",
              headerTitle: "text-slate-900 font-bold",
              headerSubtitle: "text-slate-500",
              socialButtonsBlockButton: "bg-white hover:bg-slate-50 border-slate-200 text-slate-700",
              formFieldInput: "bg-white border-slate-200 focus:ring-[#66dd99] focus:border-[#66dd99]",
              formButtonPrimary: "bg-[#66dd99] hover:bg-[#44cc88] text-black font-semibold",
              footerActionLink: "text-[#66dd99] hover:text-[#44cc88]",
              dividerLine: "bg-slate-200",
              dividerText: "text-slate-400",
            }
          }}
          routing="path"
          path="/register"
          signInUrl={signInUrl}
          forceRedirectUrl="/onboarding/welcome"
        />

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Mit der Registrierung akzeptierst du unsere{" "}
          <a href="#" className="text-[#66dd99] hover:underline">AGB</a>
          {" "}und{" "}
          <a href="#" className="text-[#66dd99] hover:underline">Datenschutzerklärung</a>
        </p>
      </motion.div>
    </div>
  );
}
