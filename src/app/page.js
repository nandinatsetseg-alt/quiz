"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

export default function Home() {
  const [quizList, setQuizList] = useState([]);
  const [title, setTitle] = useState("");
  const getData = async () => {
    const { data, error } = await supabase.from("title").select();
    if (data) {
      setQuizList(data);
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
    // if (!trimmedTitle) return;
    // if (selected === "a") {
    //   correctAnswer = "A";
    // } else if (selected === "b") {
    //   correctAnswer = "B";
    // } else if (selected === "c") {
    //   correctAnswer = "C";
    // } else if (selected === "d") {
    //   correctAnswer = "D";
    // }
    const { data, error } = await supabase
      .from("title")
      .insert({
        title: trimmedTitle,
      })
      .select();

    if (data && data.length > 0) {
      setQuizList([...quizList, data[0]]);
      setTitle("");
      // setA("");
      // setB("");
      // setC("");
      // setD("");
      // setSelected("");
    }
    if (error) {
      console.error("Error adding quiz :", error);
    }
  }

  return (
    <div className="p-6 flex justify-center items-center flex-col gap-4">
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
      <div className="w-full flex flex-col gap-3 bg-amber-50 p-4 rounded">
        <h2 className="font-bold text-lg">Available Quizzes:</h2>
        {quizList.map((quizz, index) => (
          <div
            className="bg-blue-100 p-3 rounded flex justify-between items-center"
            key={quizz.id || index}
          >
            <p className="font-medium">{quizz.title}</p>
            <Link
              className="text-blue-600 underline font-semibold"
              href={`/quiz/${quizz.id}`}
            >
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
