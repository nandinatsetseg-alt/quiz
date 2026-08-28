"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();
  useEffect(() => {
    const storedName = window.localStorage.getItem("name");
    setName(storedName);
  }, []);
  async function handleLogOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out from Supabase:", error.message);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    window.localStorage.removeItem("name");
    router.push("/login");
  }

  return (
    <div className="p-5 flex flex-col gap-10">
      <div className="w-100 h-20 rounded-3xl p-8 flex flex-row justify-between items-center bg-blue-100">
        <div>{name}</div>
        <div>
          <button
            className="bg-white w-30 h-10 rounded-2xl"
            onClick={handleLogOut}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
