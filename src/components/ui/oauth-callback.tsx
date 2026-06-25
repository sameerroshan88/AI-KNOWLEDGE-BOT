"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if this is an OAuth callback URL (has access_token or error params)
        const accessToken = searchParams.get("access_token");
        const errorCode = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorCode) {
          // OAuth error occurred
          console.error("OAuth error:", errorDescription);
          return;
        }

        if (accessToken) {
          // OAuth success - Supabase will have already set the session
          // Just wait a moment and redirect to dashboard
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push("/dashboard");
          return;
        }

        // Check if we have an active session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session && session.user) {
          // User is authenticated via Supabase
          const userObj = {
            email: session.user.email || "",
            name: (session.user.user_metadata && (session.user.user_metadata.full_name || session.user.user_metadata.name)) || session.user.email || "User"
          };

          try {
            localStorage.setItem("user", JSON.stringify(userObj));
          } catch (e) {
            // localStorage not available
          }
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return null;
}
