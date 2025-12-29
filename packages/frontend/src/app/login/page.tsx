"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">MOJO Campus</h1>
          <p className="text-zinc-400 mt-2">
            Melde dich an, um auf deine Kurse zuzugreifen
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-zinc-900/50 border border-white/10 backdrop-blur-lg shadow-2xl",
            }
          }}
          routing="path"
          path="/login"
          signUpUrl="/register"
          forceRedirectUrl="/dashboard"
        />
      </motion.div>
    </div>
  );
}
