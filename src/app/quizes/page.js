"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";
import { toast, ToastContainer } from "react-toastify";

export default function Home() {
  const [quizList, setQuizList] = useState([]);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [scores, setScores] = useState([]);
  const router = useRouter();
  const [editTitle, setEditTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const storedName = window.localStorage.getItem("name");
    if (!storedName) {
      router.push("/login");
    } else {
      setName(storedName);
    }
  }, [router]);

  const getData = async () => {
    const { data, error } = await supabase.from("title").select();
    if (data) {
      setQuizList(data);
    }
    if (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchScores = async (hereglegc) => {
    if (!hereglegc) return;
    const { data, error } = await supabase
      .from("Score")
      .select("*")
      .eq("name", hereglegc);

    if (error) {
      console.error("Error fetching score details:", error);
    } else {
      setScores(data || []);
    }
  };

  useEffect(() => {
    getData();
    const storedName = window.localStorage.getItem("name");
    if (storedName) {
      fetchScores(storedName);
    }
  }, []);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const { data, error } = await supabase
      .from("title")
      .insert({ title: trimmedTitle, Name: name })
      .select();

    if (data && data.length > 0) {
      setQuizList([...quizList, data[0]]);
      setTitle("");
      console.log(name);
      toast.success("Quiz created successfully!");
    }
    if (error) {
      console.error("Error adding quiz:", error);
      toast.error("Failed to create quiz.");
    }
  }

  function handleEdit(quiz) {
    setEditTitle(quiz.title);
    setEditingId(quiz.id);
  }

  async function handleUpdate(Id) {
    const trimmedEditTitle = editTitle.trim();
    if (!trimmedEditTitle) return;

    const { data, error } = await supabase
      .from("title")
      .update({ title: trimmedEditTitle })
      .eq("id", Id)
      .select();

    if (error) {
      console.error("Error garlaa: ", error);
      return;
    }
    setQuizList(
      quizList.map((quiz) =>
        quiz.id === Id ? { ...quiz, title: trimmedEditTitle } : quiz,
      ),
    );
    setEditingId(null);
  }

  async function handleDelete(quizId) {
    if (!quizId) return;
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this quiz?",
    );
    if (!isConfirmed) return;
    const { error } = await supabase.from("title").delete().eq("id", quizId);
    if (error) {
      console.error("Ustgahad error garsan bn:", error);
      toast.error("Failed to delete quiz.");
      return;
    }
    setQuizList(quizList.filter((item) => item.id !== quizId));
    toast.success("Quiz deleted successfully!");
  }

  return (
    <div className="min-h-screen bg-[#eaf4f4] bg-gradient-to-br from-[#e0f2f1] via-[#eaf4f4] to-[#fff3e0] text-[#3e2723] font-sans p-8 flex justify-center flex-row gap-12">
            <div className="flex gap-8 flex-col max-w-3xl w-full">
                <div className="flex flex-row gap-8 items-center">
          <div>
            <Link
              href="/profile"
              className="bg-[#81c784] border-4 border-[#66bb6a] shadow-lg w-56 h-16 rounded-full flex items-center justify-between px-4 transition-transform hover:-translate-y-1 hover:shadow-xl hover:bg-[#66bb6a]"
            >
              <div className="bg-white/90 border-2 border-white/50 w-10 h-10 rounded-full shrink-0 shadow-inner"></div>
              <div className="font-bold text-[#1b5e20] pr-2 truncate text-lg tracking-wide">
                {name}
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-row gap-3 items-center">
            <input
              className="flex-1 border-2 border-[#bcaaa4] bg-[#fff8e1]/80 p-4 rounded-3xl shadow-inner focus:outline-none focus:border-[#ffb300] focus:bg-white transition-all text-[#5d4037] placeholder-[#a1887f] font-medium"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write a new story (quiz title)..."
            />
            <button
              className="bg-[#ffca28] hover:bg-[#ffb300] border-2 border-[#ffb300] text-[#5d4037] px-6 py-4 rounded-3xl font-bold shadow-md hover:shadow-lg transition-transform active:scale-95"
              onClick={handleSave}
            >
              Create
            </button>
          </div>
        </div>

        {/* Quizzes List */}
        <div className="w-full flex flex-col gap-4 bg-[#fff9c4]/60 backdrop-blur-sm border-2 border-[#ffe082]/50 p-8 rounded-[2rem] shadow-xl">
          <h2 className="font-extrabold text-2xl text-[#795548] font-serif mb-2 flex items-center gap-2">
             Available Quizes
          </h2>
          
          {quizList.map((quizz, index) => {
            const isEditingThis = editingId === quizz.id;
            return (
              <div
                className="bg-white/80 p-4 rounded-2xl flex justify-between items-center shadow-sm border-2 border-[#f5f5f5] hover:shadow-md hover:border-[#ffecb3] transition-all"
                key={quizz.id || index}
              >
                <div className="flex-1 pr-4">
                  {isEditingThis ? (
                    <input
                      className="w-full px-4 py-2 border-2 rounded-xl border-[#81c784] bg-white focus:outline-none shadow-inner text-[#3e2723]"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  ) : (
                    <p className="font-semibold text-lg text-[#4e342e]">{quizz.title}</p>
                  )}
                </div>
                <div>
                  {name === quizz.Name ? (
                    <div className="flex flex-row gap-3">
                      <Link
                        className="text-[#0277bd] bg-[#b3e5fc] hover:bg-[#81d4fa] w-20 h-10 flex justify-center items-center rounded-full font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                        href={`/quiz/${quizz.id}`}
                      >
                        Open
                      </Link>
                      <div className="flex flex-row gap-3">
                        <button
                          onClick={() => handleDelete(quizz.id)}
                          className="bg-[#ffcdd2] text-[#c62828] hover:bg-[#ef9a9a] w-20 h-10 cursor-pointer rounded-full font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                        >
                          Delete
                        </button>
                        {isEditingThis ? (
                          <button
                            onClick={() => handleUpdate(quizz.id)}
                            className="bg-[#c8e6c9] text-[#2e7d32] hover:bg-[#a5d6a7] w-20 h-10 font-bold rounded-full shadow-sm transition-transform hover:-translate-y-0.5"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(quizz)}
                            className="bg-[#fff9c4] text-[#f57f17] hover:bg-[#fff59d] w-20 h-10 font-bold rounded-full shadow-sm transition-transform hover:-translate-y-0.5"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Link
                        className="text-[#1b5e20] bg-[#c8e6c9] hover:bg-[#a5d6a7] w-24 h-10 flex justify-center items-center rounded-full font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                        href={`/quizzz/${quizz.id}`}
                      >
                        Start
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex rounded-[2rem] p-6 bg-[#d7ccc8]/40 border-2 border-[#bcaaa4]/30 w-72 flex-col gap-4 overflow-y-auto max-h-[40rem] shadow-xl backdrop-blur-md">
          <div className="text-xl font-bold text-[#5d4037] font-serif border-b-2 border-[#bcaaa4]/30 pb-2">
            📜 Score History
          </div>
          {scores.length === 0 ? (
            <p className="text-sm text-[#8d6e63] italic text-center mt-4">
              Your journey hasn't started yet.
            </p>
          ) : (
            scores.map((scoreItem, index) => (
              <div
                key={scoreItem.id || index}
                className="bg-white/90 w-full p-4 rounded-2xl border-2 border-[#efebe9] shadow-sm hover:shadow-md transition-all flex flex-col gap-1"
              >
                <div className="text-md font-bold text-[#4e342e] leading-tight">
                  {scoreItem.title}
                </div>
                <div className="text-sm font-bold text-[#ff8f00] bg-[#fff8e1] self-start px-3 py-1 rounded-full mt-1">
                  Score: {scoreItem.score}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}