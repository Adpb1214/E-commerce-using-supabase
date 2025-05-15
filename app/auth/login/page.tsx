"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, Mail, Lock } from "lucide-react";

const Login = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = form;

    try {
      // Log in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (user) {
        // Fetch the user's role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const userRole = profile.role;

        // Redirect based on the role
        if (userRole === "admin") {
          router.push("/admin");
          toast.success("Welcome Back Admin");
        } else if (userRole === "client") {
          router.push("/customer");
          toast.success("Welcome Back Customer");
        } else {
          throw new Error("Invalid role. Please contact support.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Extract the error message
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to continue shopping
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-md bg-red-50 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/auth/register")}
              disabled={loading}
              className="w-full h-11 border-slate-200 hover:bg-slate-50 font-medium"
            >
              Register
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              By continuing, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;