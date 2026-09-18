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
      return
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
    <div className="p-6 flex justify-center  flex-row gap-10">
      <div className="flex gap-5 flex-col">
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
          {quizList.map((quizz, index) => {
            const isEditingThis = editingId === quizz.id;
            return (
              <div
                className="bg-blue-100 p-3 rounded flex justify-between items-center"
                key={quizz.id || index}
              >
                <div>
                  {isEditingThis ? (
                    <input
                      className="px-2 py-1  border rounded border-gray-400"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  ) : (
                    <p className="font-medium">{quizz.title}</p>
                  )}
                </div>
                <div>
                  {name === quizz.Name ? (
                    <div className="flex flex-row gap-11">
                      <Link
                        className="text-black bg-blue-300 w-15 h-8 flex justify-center items-center border rounded-2xl font-semibold"
                        href={`/quiz/${quizz.id}`}
                      >
                        Open
                      </Link>
                      <div className="flex flex-row gap-10">
                        <button
                          onClick={() => handleDelete(quizz.id)}
                          className="bg-red-400 text-black w-16 h-8 cursor-pointer rounded-2xl border font-semibold hover:bg-red-500 transition"
                        >
                          Delete
                        </button>
                        {isEditingThis ? (
                          <button
                            onClick={() => handleUpdate(quizz.id)}
                            className="bg-yellow-200 w-15 font-semibold h-8 rounded-2xl border"
                          >
                            Save
                          </button>
                        ) : (
                          <div>
                            <button
                              onClick={() => handleEdit(quizz)}
                              className="bg-yellow-200 w-15 h-8 font-semibold rounded-2xl border"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Link
                        className="text-black bg-green-300 w-15 h-8 flex justify-center items-center rounded-2xl border font-semibold"
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
        <div className="flex rounded-2xl p-5 bg-amber-300 h-300 w-60 flex-col gap-2 overflow-y-auto max-h-96">
          <div>Score History: </div>
          {scores.length === 0 ? (
            <p className="text-xs text-amber-800/60 italic">
              No score records found.
            </p>
          ) : (
            scores.map((scoreItem, index) => (
              <div
                key={scoreItem.id || index}
                className="bg-white w-50 p-3 rounded-lg border border-amber-200 shadow-xs"
              >
                <div className="text-sm w-50 font-semibold text-gray-900 ">
                  {scoreItem.title}
                </div>
                <div className="text-sm text-black m-1">
                  Score: {scoreItem.score}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
