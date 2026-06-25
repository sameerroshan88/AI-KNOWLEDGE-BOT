"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { BackgroundPaths } from "@/components/ui/background-paths";


interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    // If forced look direction is provided, use that instead of mouse tracking
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};



interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    // If forced look direction is provided, use that instead of mouse tracking
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};





function LoginPage({ initialSignUp = false }: { initialSignUp?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const [isInGoogleFlow, setIsInGoogleFlow] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle browser back button for login flow
  useEffect(() => {
    const handlePopState = () => {
      if (isInGoogleFlow) {
        setIsInGoogleFlow(false);
      } else {
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isInGoogleFlow]);

  // Push history when entering Google login flow
  const handleGoogleLoginFlow = () => {
    setIsInGoogleFlow(true);
    window.history.pushState({ googleLoginFlow: true }, "", window.location.href);
    handleGoogleLogin();
  };

  async function handleSignUp() {
    setError("");
    setIsLoading(true);

    try {
      const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Signup will use local fallback.');
      } else {
        const res = await supabase.auth.signUp({
          email,
          password,
        });

        if (res?.error) {
          setError(res.error.message || 'Signup failed');
          setIsLoading(false);
          return;
        }

        alert('Signup successful! Check your email if confirmation is enabled.');
        console.log(res);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    // After signup (or fallback), navigate to dashboard
    localStorage.setItem('user', JSON.stringify({ email, name: name || email.split('@')[0] }));
    router.push('/dashboard');
  }

  async function handleLogin() {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || String(err));
      setIsLoading(false);
    }
  }

  // Note: do not auto-redirect logged-in users from the homepage.
  // Redirect to `/dashboard` happens after explicit login/signup actions only.

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effect for purple character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000; // Random between 3-7 seconds

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150); // Blink duration 150ms
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effect for black character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000; // Random between 3-7 seconds

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150); // Blink duration 150ms
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Looking at each other animation when typing starts
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800); // Look at each other for 1.5 seconds, then back to tracking mouse
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Purple sneaky peeking animation when typing password and it's visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800); // Peek for 800ms
        }, Math.random() * 3000 + 2000); // Random peek every 2-5 seconds
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3; // Focus on head area

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // Face movement (limited range)
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));

    // Body lean (skew for lean while keeping bottom straight) - negative to lean towards mouse
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignUp) {
      await handleLogin();
      return;
    }

    // Validation checks BEFORE setting loading state
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (isSignUp && !name) {
      setError("Full name is required for signup");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      if (isSupabaseConfigured) {
        if (isSignUp) {
          // Signup with Supabase
          const res = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              }
            }
          });

          if (res?.error) {
            setError(res.error.message || 'Signup failed');
            setIsLoading(false);
            return;
          }

          // Success - reset form and switch to login mode
          setError(""); // Clear any errors
          setName("");
          setEmail("");
          setPassword("");
          setIsSignUp(false);
          setIsLoading(false);
          return;
        } else {
          // Login with Supabase
          const res = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (res?.error) {
            const msg = res.error.message || 'Login failed';
            if (/invalid login credentials|invalid email or password|invalid password/i.test(msg)) {
              setError('Invalid email or password. If you signed up with Google, use the "Sign in with Google" button.');
            } else {
              setError(msg);
            }
            setIsLoading(false);
            return;
          }

          if (res?.data?.user) {
            // Successfully logged in
            const displayName = res.data.user.user_metadata?.full_name || name || email.split("@")[0];
            localStorage.setItem("user", JSON.stringify({
              email: res.data.user.email,
              name: displayName,
              id: res.data.user.id
            }));

            await new Promise(resolve => setTimeout(resolve, 800));
            router.push("/dashboard");
            return;
          }
        }
      } else {
        // Local fallback for development
        if (isSignUp) {
          // Local signup
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          if (users.some((u: any) => u.email === email)) {
            setError("Email already registered");
            setIsLoading(false);
            return;
          }
          users.push({ email, password, name, id: Date.now().toString() });
          localStorage.setItem("users", JSON.stringify(users));
          setName("");
          setEmail("");
          setPassword("");
          setIsSignUp(false);
          setIsLoading(false);
          return;
        } else {
          // Local login
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const user = users.find((u: any) => u.email === email && u.password === password);
          if (!user) {
            setError("Invalid email or password");
            setIsLoading(false);
            return;
          }
          localStorage.setItem("user", JSON.stringify({ email: user.email, name: user.name, id: user.id }));
        }
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setIsLoading(false);
      return;
    }

    // Navigate to dashboard after successful login
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push("/dashboard");
  };

  useEffect(() => {
    setIsSignUp(initialSignUp);
  }, [initialSignUp]);

  const handleForgotPassword = async () => {
    setError("");
    setIsLoading(true);

    try {
      const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      let emailToReset = email;
      if (!emailToReset) {
        // Ask user for email if not filled
        const promptEmail = typeof window !== 'undefined' ? window.prompt('Please enter your account email for password reset:') : '';
        if (promptEmail) emailToReset = promptEmail.trim();
      }

      if (!emailToReset) {
        setError('Please provide an email address to reset your password.');
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setError('Password reset requires Supabase to be configured in this environment.');
        setIsLoading(false);
        return;
      }

      const res = await supabase.auth.resetPasswordForEmail(emailToReset, {
        redirectTo: window.location.origin + '/update-password'
      });

      if ((res as any)?.error) {
        setError((res as any).error.message || 'Failed to send password reset email');
        setIsLoading(false);
        return;
      }

      alert('If an account exists for that email, a password reset link has been sent.');
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        setIsLoading(false);
        return;
      }

      // Initiate OAuth flow - this will redirect to Google
      // Mark that the next full navigation should skip the preloader
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('aikb_skip_preloader', '1')
        }
      } catch (e) {}

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        }
      });

      if (error) {
        console.warn("Google OAuth failed, falling back to mock login:", error.message);
        localStorage.setItem("user", JSON.stringify({
          email: "google-user@example.com",
          name: "Google Explorer",
          id: "google-mock-id"
        }));
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
        router.push("/dashboard");
        return;
      }
      // If successful, supabase will handle the redirect to Google
      // Loading state will remain true during redirect
    } catch (err: any) {
      console.error('Google login error:', err);
      // Fallback for development if local settings fail completely
      localStorage.setItem("user", JSON.stringify({
        email: "google-user@example.com",
        name: "Google Explorer",
        id: "google-mock-id"
      }));
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsLoading(false);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white">
      {/* Left Content Section */}
      <div className="relative flex flex-col justify-end bg-black px-12 pb-0 pt-12 text-white h-full">
            <div className="relative z-20 flex items-end justify-center h-[400px] w-full">
              {/* Cartoon Characters */}
              <div className="relative" style={{ width: '550px', height: '400px' }}>
                {/* Purple tall rectangle character - Back layer */}
                <div
                  ref={purpleRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '70px',
                    width: '180px',
                    height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                    backgroundColor: '#6C3FF5',
                    borderRadius: '10px 10px 0 0',
                    zIndex: 1,
                    transform: (password.length > 0 && showPassword)
                      ? `skewX(0deg)`
                      : (isTyping || (password.length > 0 && !showPassword))
                        ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                        : `skewX(${purplePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  {/* Eyes */}
                  <div
                    className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                    style={{
                      left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                      top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                    }}
                  >
                    <EyeBall
                      size={18}
                      pupilSize={7}
                      maxDistance={5}
                      eyeColor="white"
                      pupilColor="#2D2D2D"
                      isBlinking={isPurpleBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                    />
                    <EyeBall
                      size={18}
                      pupilSize={7}
                      maxDistance={5}
                      eyeColor="white"
                      pupilColor="#2D2D2D"
                      isBlinking={isPurpleBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                    />
                  </div>
                </div>

                {/* Black tall rectangle character - Middle layer */}
                <div
                  ref={blackRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '240px',
                    width: '120px',
                    height: '310px',
                    backgroundColor: '#2D2D2D',
                    borderRadius: '8px 8px 0 0',
                    zIndex: 2,
                    transform: (password.length > 0 && showPassword)
                      ? `skewX(0deg)`
                      : isLookingAtEachOther
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                        : (isTyping || (password.length > 0 && !showPassword))
                          ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                          : `skewX(${blackPos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  {/* Eyes */}
                  <div
                    className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                    style={{
                      left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                      top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                    }}
                  >
                    <EyeBall
                      size={16}
                      pupilSize={6}
                      maxDistance={4}
                      eyeColor="white"
                      pupilColor="#2D2D2D"
                      isBlinking={isBlackBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                    />
                    <EyeBall
                      size={16}
                      pupilSize={6}
                      maxDistance={4}
                      eyeColor="white"
                      pupilColor="#2D2D2D"
                      isBlinking={isBlackBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                    />
                  </div>
                </div>

                {/* Orange semi-circle character - Front left */}
                <div
                  ref={orangeRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '0px',
                    width: '240px',
                    height: '200px',
                    zIndex: 3,
                    backgroundColor: '#FF9B6B',
                    borderRadius: '120px 120px 0 0',
                    transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  {/* Eyes - just pupils, no white */}
                  <div
                    className="absolute flex gap-8 transition-all duration-200 ease-out"
                    style={{
                      left: (password.length > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                      top: (password.length > 0 && showPassword) ? `${90}px` : `${90 + (orangePos.faceY || 0)}px`,
                    }}
                  >
                    <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                    <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                  </div>
                </div>

                {/* Yellow tall rectangle character - Front right */}
                <div
                  ref={yellowRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '310px',
                    width: '140px',
                    height: '230px',
                    backgroundColor: '#E8D754',
                    borderRadius: '70px 70px 0 0',
                    zIndex: 4,
                    transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  {/* Eyes - just pupils, no white */}
                  <div
                    className="absolute flex gap-6 transition-all duration-200 ease-out"
                    style={{
                      left: (password.length > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                      top: (password.length > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                    }}
                  >
                    <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                    <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                  </div>
                  {/* Horizontal line for mouth */}
                  <div
                    className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                    style={{
                      left: (password.length > 0 && showPassword) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                      top: (password.length > 0 && showPassword) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-black h-full">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span>AIKB</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isSignUp ? "Create your account" : "Welcome back!"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp ? "Get started with AIKB in seconds" : "Please enter your details"}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Erik"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 bg-background border-border/60 focus:border-primary"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="anna@gmail.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-background border-border/60 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember for 30 days
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline font-medium bg-transparent border-0 p-0"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              size="lg"
              disabled={isLoading}
              onClick={(e) => {
                if (!isSignUp) {
                  e.preventDefault();
                  handleLogin();
                }
              }}
            >
              {isLoading
                ? (isSignUp ? "Creating account..." : "Signing in...")
                : (isSignUp ? "Sign Up" : "Log in")}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full h-12 bg-background border-border/60 hover:bg-accent"
              type="button"
              onClick={() => {
                setIsInGoogleFlow(true);
                window.history.pushState({ googleLoginFlow: true }, "", window.location.href);
                handleGoogleLogin();
              }}
              disabled={isLoading}
            >
              <Mail className="mr-2 size-5" />
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </Button>
          </div>

          {/* Toggle Link */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            {isSignUp ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setName("");
                  setEmail("");
                  setPassword("");
                  setIsSignUp(false);
                  if (window.location.pathname === "/signup") {
                    router.push("/#login");
                  }
                }}
                className="text-foreground font-medium hover:underline focus:outline-none"
              >
                Log in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setEmail("");
                  setPassword("");
                  setIsSignUp(true);
                  if (window.location.pathname === "/") {
                    router.push("/#signup");
                  } else {
                    router.push("/signup");
                  }
                }}
                className="text-foreground font-medium hover:underline"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = LoginPage;
