"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit2, User, MapPin, Phone, Loader2 } from "lucide-react";
import type React from "react";

type Profile = {
  id: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  photo_url: string;
};

const UserProfile = () => {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

        if (error) {
          console.error("Error fetching profile:", error.message);
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({
        ...profile,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setUpdating(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        address: profile.address,
        phone_number: profile.phone_number,
      })
      .eq("id", profile.id);

    setUpdating(false);

    if (error) {
      toast.error("Failed to update profile!");
      console.error("Error updating profile:", error.message);
    } else {
      toast.success("Profile updated successfully!");
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-gray-500">No profile data found.</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <Card className="w-full max-w-3xl shadow-lg">
        {/* Banner Section */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="absolute -bottom-16 left-6">
            <img
              src={profile.photo_url || "/placeholder.svg"}
              alt={profile.name}
              width={128}
              height={128}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
        </div>
        <CardContent className="pt-20">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <Button variant="outline" onClick={() => setEditing(!editing)} className="flex items-center gap-2">
              <Edit2 size={16} />
              {editing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
          
          {/* Profile Fields */}
          <div className="space-y-6">
            <ProfileField
              icon={<User size={20} />}
              label="Full Name"
              value={profile.name}
              editing={editing}
              name="name"
              onChange={handleInputChange}
            />
            <ProfileField
              icon={<MapPin size={20} />}
              label="Address"
              value={profile.address}
              editing={editing}
              name="address"
              onChange={handleInputChange}
            />
            <ProfileField
              icon={<Phone size={20} />}
              label="Phone Number"
              value={profile.phone_number}
              editing={editing}
              name="phone_number"
              onChange={handleInputChange}
            />
          </div>

          {/* Update Button with Loader */}
          {editing && (
            <Button onClick={handleUpdateProfile} className="mt-6 w-full" disabled={updating}>
              {updating ? (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileField = ({
  icon,
  label,
  value,
  editing,
  name,
  onChange,
}: {
  icon: any;
  label: string;
  value: string;
  editing: boolean;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center gap-4">
    <div className="text-gray-500">{icon}</div>
    <div className="flex-grow">
      <p className="text-sm text-gray-500">{label}</p>
      {editing ? (
        <Input name={name} value={value} onChange={onChange} className="mt-1" />
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  </div>
);

export default UserProfile;
