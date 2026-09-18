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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#eaf4f4] text-xl font-bold text-[#795548] font-serif">Loading...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center bg-[#eaf4f4] text-xl font-bold text-[#795548] font-serif">Quiz title not found.</div>;

  return (
    <div className="min-h-screen bg-[#eaf4f4] bg-gradient-to-br from-[#e0f2f1] via-[#eaf4f4] to-[#fff3e0] text-[#3e2723] font-sans p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
                <div>
          <h1 className="text-4xl font-extrabold mb-3 text-[#795548] font-serif drop-shadow-sm">Quiz: {quiz.title}</h1>
          <div className="text-lg font-medium text-[#5d4037] bg-white/60 inline-block px-5 py-2 rounded-full border-2 border-[#efebe9] shadow-sm">
            Creater by: <span className="font-bold text-[#1b5e20]">{name}</span>
          </div>
        </div>
        <div className="bg-[#fff9c4]/60 backdrop-blur-sm border-2 border-[#ffe082]/50 rounded-[2rem] p-8 shadow-xl max-w-2xl">
          <h2 className="text-2xl font-bold text-[#795548] font-serif mb-6 flex items-center gap-2">
            🌱 Create New Question
          </h2>
          <div className="flex flex-col gap-4 mb-6">
            <input 
              className="w-full border-2 border-[#bcaaa4] bg-[#fff8e1]/80 p-4 rounded-2xl shadow-inner focus:outline-none focus:border-[#ffb300] focus:bg-white transition-all text-[#5d4037] placeholder-[#a1887f] font-medium"
              type="text" 
              value={asuult} 
              onChange={(event) => setAsuult(event.target.value)} 
              placeholder="Question"
            />
            
            <div className="grid grid-cols-1 gap-3 pl-2">
              {["A", "B", "C", "D"].map((letter) => (
                <div key={letter} className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selected === letter}
                    onChange={() => setSelected(letter)}
                    className="w-6 h-6 cursor-pointer accent-[#ffb300] bg-white border-2 border-[#bcaaa4] rounded-md transition-all"
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
                    className="flex-1 border-2 border-[#d7ccc8] bg-white/90 p-3 rounded-xl focus:outline-none focus:border-[#ffb300] transition-all text-[#4e342e] font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={handleSave} 
            className="w-full bg-[#ffca28] hover:bg-[#ffb300] border-2 border-[#ffb300] text-[#5d4037] font-bold py-4 px-6 rounded-full shadow-md hover:shadow-lg transition-transform active:scale-95 text-lg"
          >
            Add Question
          </button>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {quizList.map((quizItem) => {
            const isEditingThis = editingId === quizItem.id;

            return (
              <div key={quizItem.id} className="bg-white/90 border-2 border-[#efebe9] rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-[#ffecb3] transition-all flex flex-col justify-between h-full">
                <div>
                  {isEditingThis ? (
                    <input
                      className="w-full px-4 py-3 mb-4 border-2 rounded-2xl border-[#81c784] bg-[#f1f8e9] focus:outline-none shadow-inner text-[#2e7d32] font-bold"
                      value={editAsuult}
                      onChange={(e) => setEditAsuult(e.target.value)}
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-[#4e342e] mb-4 leading-snug">{quizItem.asuult}</h1>
                  )}
                  
                  <div className="flex flex-col gap-3 mb-6">
                    {["A", "B", "C", "D"].map((letter) => {
                      const optionText = quizItem[letter.toLowerCase()];
                      
                      return (
                        <div key={letter} className="flex items-center bg-[#fff8e1]/40 rounded-xl p-2 border border-transparent hover:border-[#ffe082] transition-colors">
                          <span className="font-bold text-[#8d6e63] w-6 flex-shrink-0">{letter}:</span>
                          {isEditingThis ? (
                            <input
                              className="flex-1 border-2 border-[#bcaaa4] px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-[#81c784] shadow-inner bg-white text-[#3e2723]"
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
                            <p className="text-[#5d4037] font-medium break-words">{optionText}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t-2 border-[#f5f5f5]">
                  {isEditingThis ? (
                    <div className="flex gap-3">
                      <button
                        className="bg-[#c8e6c9] hover:bg-[#a5d6a7] text-[#2e7d32] flex-1 rounded-full h-12 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                        onClick={() => handleUpdate(quizItem.id)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-[#ffcdd2] hover:bg-[#ef9a9a] text-[#c62828] px-6 rounded-full h-12 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-[#b3e5fc] hover:bg-[#81d4fa] text-[#0277bd] w-full rounded-full h-12 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                      onClick={() => startEditing(quizItem)}
                    >
                      Edit Question
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
      </div> 
    </div>
  );
}