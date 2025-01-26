"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UserQueries = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error.message);
          setSessionError("Failed to fetch session. Are you logged in?");
          return;
        }

        if (session && session.user) {
          setUserId(session.user.id);
        } else {
          setSessionError("No active session found. Please log in.");
        }
      } catch (err) {
        console.error("Unexpected error fetching session:", err);
        setSessionError("Unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (sessionError) {
    return <p>{sessionError}</p>;
  }

  return <div>User ID: {userId}</div>;
};

export default UserQueries;
