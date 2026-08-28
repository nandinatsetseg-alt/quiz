"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function Home() {
  const [quizList, setQuizList] = useState([]);
  const [title, setTitle] = useState("");
  const [userLogged, setUserLogged] = useState(false);
  const [name, setName] = useState("");

  const router = useRouter();
  useEffect(() => {
    const storedName = window.localStorage.getItem("name");
    setName(storedName);
  }, []);
  const getData = async () => {
    const { data, error } = await supabase.from("title").select();
    if (data) {
      setQuizList(data);
      console.log(name);
    }
    if (error) {
      console.log("Error fetching quizzes:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  async function handleSave() {
    const trimmedTitle = title.trim();
    const { data, error } = await supabase
      .from("title")
      .insert({
        title: trimmedTitle,
      })
      .select();

    if (data && data.length > 0) {
      setQuizList([...quizList, data[0]]);
      setTitle("");
    }
    if (error) {
      console.error("Error adding quiz :", error);
    }
  }

  return (
    <div className="p-6 flex justify-center items-center flex-col gap-4">
      <div className="flex flex-row gap-30">
        <div>
          <Link
            href="/profile"
            className="bg-blue-300 w-56 h-16 rounded-3xl flex items-center justify-between px-5 transition hover:bg-blue-400"
          >
            <div className="bg-white w-10 h-10 rounded-full shrink-0"></div>
            <div className="font-semibold text-gray-800 pr-2 truncate">
              {name}
            </div>
          </Link>
        </div>

        <div className="w-150 flex flex-col gap-2">
          <input
            className="border p-2 rounded"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter quiz title..."
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Create
          </button>
        </div>
      </div>
      <div className="w-full flex flex-col gap-3 bg-amber-50 p-4 rounded">
        <h2 className="font-bold text-lg">Available Quizzes:</h2>
        {quizList.map((quizz, index) => (
          <div
            className="bg-blue-100 p-3 rounded flex justify-between items-center"
            key={quizz.id || index}
          >
            <p className="font-medium">{quizz.title}</p>
            <div>
              {!userLogged ? (
                <div className="flex flex-row gap-11">
                  <Link
                    className="text-blue-600 underline font-semibold"
                    href={`/quiz/${quizz.id}`}
                  >
                    Open
                  </Link>
                  <Link
                    className="text-blue-600 underline font-semibold"
                    href={`/quizzz/${quizz.id}`}
                  >
                    Start
                  </Link>
                </div>
              ) : (
                router.push(`/login`)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
