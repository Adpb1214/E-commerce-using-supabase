"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, User, Mail, Lock, Phone, Home, MapPin, Globe, Image } from "lucide-react";

const Register = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // State for form inputs
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone_number: "",
    address: "",
    city: "",
    zip_code: "",
    photo_url: "",
    country: "",
    state: "",
    role: "client", // Default role is 'client'
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // For multi-step form

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle role change from shadcn Select
  const handleRoleChange = (value: string) => {
    setForm({ ...form, role: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password, name, phone_number, address, city, zip_code, photo_url, country, state, role } = form;

    try {
      // Create a user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (user) {
        // Insert additional details into the profiles table
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id, // Link to auth.users ID
          name,
          phone_number,
          address,
          city,
          zip_code,
          photo_url,
          country,
          state,
          role, // Insert the role ('client' or 'admin')
        });

        if (profileError) throw profileError;

        toast.success("Registration successful!");
        router.push("/auth/login"); // Redirect to login page
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

  // Go to next step
  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Go back to previous step
  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md py-8"
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
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign up now to start shopping with us
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4"
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={step === 1 ? nextStep : handleSubmit}>
              {step === 1 ? (
                <div className="space-y-4">
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
                  
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="phone_number"
                      placeholder="Phone Number"
                      value={form.phone_number}
                      onChange={handleChange}
                      required
                      className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
                  >
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        name="zip_code"
                        placeholder="Zip Code"
                        value={form.zip_code}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={form.country}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="photo_url"
                      placeholder="Profile Photo URL (optional)"
                      value={form.photo_url}
                      onChange={handleChange}
                      className="pl-10 bg-white/50 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Type</label>
                    <Select name="role" value={form.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="bg-white/50 border-slate-200">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-11 border-slate-200"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col pt-0">
            <div className="relative w-full mb-4">
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
              onClick={() => router.push("/auth/login")}
              className="w-full h-11 border-slate-200 hover:bg-slate-50 font-medium"
            >
              Already have an account? Sign in
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              By registering, you agree to our{" "}
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

export default Register;