"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase/client";


export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [quiz, setQuiz] = useState(null);      
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asuult, setAsuult] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [selected, setSelected] = useState("");
  const [editingId, setEditingId] = useState(null); 
  const [editAsuult, setEditAsuult] = useState(asuult);
  const [editA, setEditA] = useState("");
  const [editB, setEditB] = useState("");
  const [editC, setEditC] = useState("");
  const [editD, setEditD] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
  useEffect(() => {
    async function fetchMainTitle() {
      if (!id) return;
      const { data, error } = await supabase
        .from("title")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error("Error fetching title:", error);
      else setQuiz(data);
    }
    fetchMainTitle();
  }, [id]);
  useEffect(() => {
    const storedName = window.localStorage.getItem("name");
    setName(storedName);
  }, []);
  useEffect(() => {
    async function fetchQuestions() {
      if (!quiz?.title) return;
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("title", quiz.title);

      if (error) console.error("Error fetching questions:", error);
      else setQuizList(data || []);
      setLoading(false);
    }
    fetchQuestions();
  }, [quiz?.title]);

  async function handleSave() {
    if (!asuult || !a || !b || !c || !d || !selected || !quiz?.title) return;
    const { data, error } = await supabase
      .from("quiz")
      .insert({ a, b, c, d, correct: selected, title: quiz.title, asuult: asuult })
      .select();
    if (error) {
      console.error("Error inserting question:", error);
    } else if (data && data.length > 0) {
      setQuizList([...quizList, data[0]]);
      setA("");
      setB("");
      setC("");
      setD("");
      setSelected("");
      setAsuult("");
    }
  }
  function startEditing(quizItem) {
    setEditingId(quizItem.id);
    setEditAsuult(quizItem.asuult);
    setEditA(quizItem.a);
    setEditB(quizItem.b);
    setEditC(quizItem.c);
    setEditD(quizItem.d);
  }
  async function handleUpdate(id) {
    if (!editAsuult.trim()) return;

    const { error } = await supabase
      .from("quiz")
      .update({
        asuult: editAsuult,
        a: editA,
        b: editB,
        c: editC,
        d: editD
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating question:", error);
      return;
    }
    setQuizList(quizList.map(item => 
      item.id === id 
        ? { ...item, asuult: editAsuult, a: editA, b: editB, c: editC, d: editD } 
        : item
    ))
    setEditingId(null);
  }

  if (loading) return <div className="text-center mt-10 text-gray-500 font-sans">Loading...</div>;
  if (!quiz) return <div className="text-center mt-10 text-gray-500 font-sans">Quiz title not found.</div>;

  return (
    <div>
      <div className="max-w-2xl p-10 flex flex-col px-5 font-sans text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Quiz: {quiz.title}</h1>
        <div>
          <div>Creater by: {name}</div>
        </div>
                <div className="flex flex-row gap-20">
          <div className="bg-white w-150 border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Question</h2>
            <div className="flex flex-col gap-3 mb-4">
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500"
                type="text" 
                value={asuult} 
                onChange={(event) => setAsuult(event.target.value)} 
                placeholder="Question"
              />
              {["A", "B", "C", "D"].map((letter) => (
                <div key={letter} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected === letter}
                    onChange={() => setSelected(letter)}
                    className="w-4 h-4 cursor-pointer text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                  />
                  <input
                    value={letter === "A" ? a : letter === "B" ? b : letter === "C" ? c : d}
                    onChange={(e) => {
                      if (letter === "A") setA(e.target.value);
                      if (letter === "B") setB(e.target.value);
                      if (letter === "C") setC(e.target.value);
                      if (letter === "D") setD(e.target.value);
                    }}
                    placeholder={`Choice ${letter}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500"
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={handleSave} 
              className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Add Question
            </button>
          </div>
        </div>
        <div className="w-250 grid p-0 grid-cols-3 gap-10">
          {quizList.map((quizItem) => {
            const isEditingThis = editingId === quizItem.id;

            return (
              <div key={quizItem.id} className="w-80 bg-white border border-gray-200 min-h-70 rounded-lg p-6 shadow-sm flex flex-col justify-between">
                <div>
                  {isEditingThis ? (
                    <input
                      className="w-full px-2 py-1 mb-2 border rounded border-gray-400"
                      value={editAsuult}
                      onChange={(e) => setEditAsuult(e.target.value)}
                    />
                  ) : (
                    <h1 className="pb-2.5 font-medium">{quizItem.asuult}</h1>
                  )}
                  <div className="flex w-70 flex-col gap-2 mb-4">
                    {["A", "B", "C", "D"].map((letter) => {
                      const optionText = quizItem[letter.toLowerCase()];
                      
                      return (
                        <div key={letter} className="flex items-center">
                          <span className="font-semibold text-gray-400 mr-2">{letter}:</span>
                          {isEditingThis ? (
                            <input
                              className="border px-2 py-0.5 rounded text-sm w-full"
                              value={
                                letter === "A" ? editA : 
                                letter === "B" ? editB : 
                                letter === "C" ? editC : editD
                              }
                              onChange={(e) => {
                                if (letter === "A") setEditA(e.target.value);
                                if (letter === "B") setEditB(e.target.value);
                                if (letter === "C") setEditC(e.target.value);
                                if (letter === "D") setEditD(e.target.value);
                              }}
                            />
                          ) : (
                            <p>{optionText}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isEditingThis ? (
                  <div className="flex gap-2">
                    <button
                      className="bg-green-700 flex-1 rounded-xl h-10 text-white font-medium text-sm"
                      onClick={() => handleUpdate(quizItem.id)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 px-3 rounded-xl h-10 text-white font-medium text-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-blue-950 w-full rounded-xl h-10 text-white font-medium text-sm"
                    onClick={() => startEditing(quizItem)}
                  >
                    Edit
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div> 
    </div>
  );
}
