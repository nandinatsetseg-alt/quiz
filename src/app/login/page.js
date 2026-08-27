"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";
export default function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(true);
  const router = useRouter();
  const getData = async () => {
    const { data, error } = await supabase.from("Log in").select();
    if (data) {
      setUsers(data);
    }
    if (error) console.log("Error fetching users:", error);
  };

  useEffect(() => {
    getData();
  }, []);

  function showw() {
    setShow(!show);
  }

  const isNameValid = name.length >= 4;
  const isPassLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const isFormValid = isNameValid && isPassLength && hasUpper && hasLower;
  async function handleSave() {
    if (!isFormValid) return;

    const { data, error } = await supabase
      .from("Log in")
      .insert({ Name: name, Password: password })
      .select();

    if (data) {
      setUsers([...users, ...data]);
      setName("");
      setPassword("");
      window.localStorage.setItem("name", name);
    }

    if (error) {
      console.log("Error saving user:", error);
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && isFormValid) {
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [name, password]);

  return (
    <div className="flex w-full min-h-screen p-5 justify-center items-center bg-gray-100">
      <div className="bg-amber-50 w-[360px] min-h-[400px] flex gap-2 flex-col p-5 shadow-md rounded-xl">
        <h1 className="text-xl font-bold flex justify-center items-center mb-2">
          Create User
        </h1>

        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            type="text"
            className="bg-amber-100 p-2 w-full h-10 border rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <p
            className="text-[13px] px-2"
            style={{ color: isNameValid ? "green" : "red" }}
          >
            Name 4 болон түүнээс дээш тэмдэгттэй байх
          </p>

          <div className="flex flex-row gap-2 w-full">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={show ? "password" : "text"}
              className="bg-amber-100 flex-grow h-10 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              className="bg-white w-10 h-10 rounded-full border flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              onClick={showw}
            >
              👀
            </button>
          </div>

          <div className="flex flex-col gap-2 p-2">
            <p
              className={`text-[13px] ${isPassLength ? "text-green-600" : "text-red-500"}`}
            >
              8 болон түүнээс олон тэмдэгт
            </p>
            <p
              className={`text-[13px] ${hasUpper ? "text-green-600" : "text-red-500"}`}
            >
              Нэг том үсэг
            </p>
            <p
              className={`text-[13px] ${hasLower ? "text-green-600" : "text-red-500"}`}
            >
              Нэг жижиг үсэг
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center p-5 mt-auto">
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`w-full h-10 rounded-2xl text-white font-medium transition-all duration-200 ${
              isFormValid
                ? "bg-amber-950 hover:bg-amber-900 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }`}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
