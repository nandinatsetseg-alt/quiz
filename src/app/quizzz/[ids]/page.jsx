"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase/client";

export default function Page() {
  const { ids } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState(null);      
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [number, setNumber] = useState(0);
  const [name, setName] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [time, setTime] = useState(20);
   useEffect(() => {
    const storedName = window.localStorage.getItem("name");
    setName(storedName);
  }, []);

  const score = quizList.reduce((onoo, quizItem) => {
    const isSubmitted = submittedQuizzes[quizItem.id];
    const isCorrect = userAnswers[quizItem.id] === quizItem.correct;
    return isSubmitted && isCorrect ? onoo + 1 : onoo;
  }, 0);

  useEffect(() => {
    async function fetchMainTitle() {
      if (!ids) return;
      const { data, error } = await supabase
        .from("title")
        .select("*")
        .eq("id", ids)
        .single();

      if (error) console.error("Error fetching title:", error);
      else setQuiz(data);
    }
    fetchMainTitle();
  }, [ids]);
    
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
  async function handleNext() {
    if (number < quizList.length - 1) {
      setNumber(number + 1);
    } else {
      setSavingScore(true);
      const { error } = await supabase
        .from("Score")
        .insert({ name: name, title: quiz.title, score: score });

      if (error) {
        console.error("Error saving total quiz score:", error);
      }
      setSavingScore(false);
      setIsFinished(true);
    }
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

  const totalQuestions = quizList.length;

  if (loading) return <div className="text-center mt-10 text-gray-500 font-sans">Loading...</div>;
  if (!quiz) return <div className="text-center mt-10 text-gray-500 font-sans">Quiz title not found.</div>;
  if (quizList.length === 0) return <div className="text-center mt-10 text-gray-500 font-sans">No questions found.</div>;

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto p-10 mt-10 text-center font-sans border rounded-lg shadow-sm bg-white">
        <h1 className="text-3xl font-bold mb-4">Quiz Finished!</h1>
        <p className="text-xl mb-6 text-gray-600">Thank you for participating in {quiz.title}.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-1">Your Total Score</p>
          <span className="text-4xl font-extrabold text-blue-700">{score} / {totalQuestions}</span>
        </div>
        <button 
          onClick={() => router.push("/quizes")} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md transition-colors"
        >
          Back to Quizes
        </button>
      </div>
    );
  }

  const quizItem = quizList[number];
  const selectedAnswer = userAnswers[quizItem.id];
  const isSubmitted = submittedQuizzes[quizItem.id];
  const isCorrect = selectedAnswer === quizItem.correct;

  return (
    <div className="max-w-2xl flex justify-center flex-col gap-5  items-center mx-auto p-6 font-sans text-gray-800">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Quiz: {quiz.title}</h1>
        <span className="bg-gray-100 text-gray-600 font-medium px-3 py-1 rounded-full text-sm">
          Question {number + 1} of {totalQuestions}
        </span>
      </div>
<div className="w-50 h-20 felx p-3 justify-center rounded-2xl items-center bg-blue-200">
  <div className="flex items-center justify-center">Timer</div>
  <div className="flex items-center justify-center font-bold text-2xl">{time}</div>
</div>
      <div className="bg-white border w-100 border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-medium mb-6">{quizItem.asuult}</h2>
        
        <div className="flex flex-col gap-3 mb-6">
          {["A", "B", "C", "D"].map((letter) => {
            const optionText = quizItem[letter.toLowerCase()];
            const isCurrentSelection = selectedAnswer === letter;
            return (
              <button
                key={letter}
                disabled={isSubmitted}
                onClick={() => handleSelect(quizItem.id, letter)}
                className={`text-left p-4 border rounded-md text-sm transition-all
                  ${isCurrentSelection 
                    ? "bg-blue-50 border-blue-600 font-semibold" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                  } 
                  ${isSubmitted ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
              >
                <span className="font-semibold text-gray-400 mr-3">{letter}</span> {optionText} 
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {!isSubmitted ? (
            <button
              disabled={!selectedAnswer}
              onClick={() => handleSubmit(quizItem.id)}
              className={`w-full bg-blue-600 text-white font-medium py-3 rounded-md transition-colors text-center text-sm
                ${!selectedAnswer 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-blue-700 cursor-pointer"}`}
            >
              Submit Answer
            </button>
          ) : (
            <div className="space-y-4">
              <div className={`border rounded-md p-4 text-sm space-y-1
                ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <p>Your choice: <strong className="font-semibold">{selectedAnswer}</strong></p>
                <p>Correct choice: <strong className="font-semibold">{quizItem.correct}</strong></p>
                <p className={`font-bold mt-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  Result: {isCorrect ? "CORRECT" : "INCORRECT"}
                </p>
              </div>

              <button
                disabled={savingScore}
                onClick={handleNext}
                className="w-full h-11 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-sm cursor-pointer disabled:opacity-50"
              >
                {savingScore ? "Saving Score..." : number === quizList.length - 1 ? "Finish Quiz" : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
