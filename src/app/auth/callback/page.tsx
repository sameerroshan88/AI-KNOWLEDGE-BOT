"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase puts tokens there)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/?error=auth_failed");
          return;
        }

        if (session && session.user) {
          // User successfully authenticated
          const userObj = {
            email: session.user.email || "",
            name: (session.user.user_metadata && (session.user.user_metadata.full_name || session.user.user_metadata.name)) || session.user.email?.split("@")[0] || "User"
          };

          try {
            localStorage.setItem("user", JSON.stringify(userObj));
          } catch (e) {
            console.error("localStorage error:", e);
          }

          // Redirect to dashboard
          router.push("/dashboard");
        } else {
          // No session found
          router.push("/?error=no_session");
        }
      } catch (err) {
        console.error("Callback error:", err);
        router.push("/?error=callback_error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing sign in...</h1>
        <p className="text-gray-400">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
