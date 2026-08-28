"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase/client";

export default function Page() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);      
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asuult, setAsuult] = useState("")
  const [userLogged , setUserLogged] = useState(false)
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [selected, setSelected] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
    const router = useRouter();
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
      setAsuult("")
    }
  }
  function handleEdit () {

  }
  function handleSelect(questionId, letter) {
    if (submittedQuizzes[questionId]) return;
    setUserAnswers({ ...userAnswers, [questionId]: letter });
  }

  function handleSubmit(questionId) {
    if (userAnswers[questionId]) {
      setSubmittedQuizzes({ ...submittedQuizzes, [questionId]: true });
    }
  }
  const score = quizList.reduce((acc, quizItem) => {
    const isSubmitted = submittedQuizzes[quizItem.id];
    const isCorrect = userAnswers[quizItem.id] === quizItem.correct;
    return isSubmitted && isCorrect ? acc + 1 : acc;
  }, 0);
  const totalQuestions = quizList.length;
  if (loading) return <div className="text-center mt-10 text-gray-500 font-sans">Loading...</div>;
  if (!quiz) return <div className="text-center mt-10 text-gray-500 font-sans">Quiz title not found.</div>;
  return (
    <div>
      <div className="max-w-2xl p-10 flex flex-col px-5 font-sans text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Quiz: {quiz.title}</h1>
        <div className=" flex flex-row gap-20">
          <div className="bg-white w-150 border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Question</h2>
            <div className="flex flex-col gap-3 mb-4">
                  <input className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-gray-500"
   type="text" value={asuult} onChange={(event) => setAsuult(event.target.value)} placeholder="Question"/>
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
        <div className="w-250 grid p-0 grid-cols-3 flex-row gap-10">
          {quizList.map((quizItem) => {
            const selectedAnswer = userAnswers[quizItem.id];
            const isSubmitted = submittedQuizzes[quizItem.id];
            const isCorrect = selectedAnswer === quizItem.correct;
            return (
              <div key={quizItem.id} className="w-80 bg-white border border-gray-200 h-100 rounded-lg p-6 shadow-sm">
                <h1 className="pb-2.5">{quizItem.asuult}</h1>
                <div className="flex w-70 flex-col gap-2 mb-4">
                  {["A", "B", "C", "D"].map((letter) => {
                    const optionText = quizItem[letter.toLowerCase()];
                    const isCurrentSelection = selectedAnswer === letter;
                    return (
                      <div key={letter}>
                      <button
                        disabled={isSubmitted}
                        onClick={() => handleSelect(quizItem.id, letter)}
                        className={`text-left w-70 p-3 border rounded-md text-sm transition-all
                          ${isCurrentSelection 
                            ? "bg-blue-50 border-blue-600 font-semibold" 
                            : "bg-white border-gray-200 hover:bg-gray-50"
                          } 
                         `}
                      >
                        <span className="font-semibold text-gray-400 mr-2">{letter}</span> {optionText} 
                      </button>
                        </div>
                    );
                  })}
                    <button onClick={(handleEdit)}>Edit</button>
                </div>
               
              </div>
            );
          })}
        </div>
      </div> 
    </div>
  );
}
