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
    if (loading || isFinished ||  quizList.length === 0) return;
    const currentQuestion = quizList[number];
    if(currentQuestion && submittedQuizzes[currentQuestion.id]) return;
    if (time === 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [time, loading, isFinished, number, quizList, submittedQuizzes]);

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
      setTime(20);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#eaf4f4] text-xl font-bold text-[#795548] font-serif">Loading...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center bg-[#eaf4f4] text-xl font-bold text-[#795548] font-serif">Quiz title not found.</div>;
  if (quizList.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#eaf4f4] text-xl font-bold text-[#795548] font-serif">No questions found.</div>;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#eaf4f4] bg-gradient-to-br from-[#e0f2f1] via-[#eaf4f4] to-[#fff3e0] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-lg p-10 text-center bg-white/90 border-2 border-[#ffe082]/50 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold mb-4 text-[#795548] font-serif">Quiz Finished!</h1>
          <p className="text-lg mb-8 text-[#5d4037]">Thank you for participating in {quiz.title}.</p>
          <div className="bg-[#fff9c4]/80 border-2 border-[#ffe082] rounded-3xl p-8 mb-8 shadow-inner">
            <p className="text-sm uppercase tracking-wider text-[#8d6e63] font-bold mb-2">Your Total Score</p>
            <span className="text-5xl font-extrabold text-[#f57f17] drop-shadow-sm">{score} / {totalQuestions}</span>
          </div>
          <button 
            onClick={() => router.push("/quizes")} 
            className="bg-[#b3e5fc] hover:bg-[#81d4fa] text-[#0277bd] border-2 border-[#81d4fa] font-bold px-8 py-4 rounded-full transition-transform hover:-translate-y-1 shadow-md w-full text-lg"
          >
            Back to Quizes
          </button>
        </div>
      </div>
    );
  }

  const quizItem = quizList[number];
  const selectedAnswer = userAnswers[quizItem.id];
  const isSubmitted = submittedQuizzes[quizItem.id];
  const isCorrect = selectedAnswer === quizItem.correct;

  return (
    <div className="min-h-screen bg-[#eaf4f4] bg-gradient-to-br from-[#e0f2f1] via-[#eaf4f4] to-[#fff3e0] py-10 px-4 font-sans text-[#3e2723]">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 items-center">
        
        {/* Header Section */}
        <div className="w-full flex justify-between items-center px-2">
          <h1 className="text-3xl font-extrabold text-[#795548] font-serif drop-shadow-sm truncate pr-4">Quiz: {quiz.title}</h1>
          <span className="bg-[#c8e6c9] text-[#1b5e20] font-bold px-5 py-2 rounded-full text-sm border-2 border-[#a5d6a7] shadow-sm whitespace-nowrap">
            Question {number + 1} of {totalQuestions}
          </span>
        </div>

        {/* Timer */}
        <div className="w-48 h-24 flex flex-col justify-center items-center rounded-[2rem] bg-[#fff9c4] border-2 border-[#ffe082] shadow-md transition-all">
          <div className="text-sm font-bold text-[#8d6e63] uppercase tracking-wider">Timer</div>
          <div className={`font-extrabold text-4xl ${time <= 5 ? 'text-[#c62828] animate-pulse' : 'text-[#f57f17]'}`}>
            {time}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/90 border-2 border-[#efebe9] w-full rounded-[2.5rem] p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-8 text-[#4e342e] leading-snug">{quizItem.question}</h2>
          
          {/* Options */}
          <div className="flex flex-col gap-4 mb-8">
            {["A", "B", "C", "D"].map((letter) => {
              const optionText = quizItem[letter.toLowerCase()];
              const isCurrentSelection = selectedAnswer === letter;
              return (
                <button
                  key={letter}
                  disabled={isSubmitted}
                  onClick={() => handleSelect(quizItem.id, letter)}
                  className={`text-left p-5 border-2 rounded-2xl text-lg transition-all
                    ${isCurrentSelection 
                      ? "bg-[#fff8e1] border-[#ffb300] font-bold text-[#5d4037] shadow-inner" 
                      : "bg-white border-[#efebe9] hover:border-[#ffe082] hover:bg-[#fff9c4]/30 text-[#4e342e]"
                    } 
                    ${isSubmitted ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-sm"}`}
                >
                  <span className={`font-extrabold mr-4 ${isCurrentSelection ? "text-[#f57f17]" : "text-[#bcaaa4]"}`}>{letter}</span> 
                  {optionText} 
                </button>
              );
            })}
          </div>

          {/* Action Area */}
          <div className="flex flex-col gap-4">
            {!isSubmitted ? (
              <button
                disabled={!selectedAnswer}
                onClick={() => handleSubmit(quizItem.id)}
                className={`w-full font-bold py-4 rounded-full transition-all text-center text-lg border-2
                  ${!selectedAnswer 
                    ? "bg-[#d7ccc8]/50 border-[#d7ccc8]/50 text-[#8d6e63] opacity-50 cursor-not-allowed" 
                    : "bg-[#ffca28] hover:bg-[#ffb300] border-[#ffb300] text-[#5d4037] shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"}`}
              >
                Submit Answer
              </button>
            ) : (
              <div className="space-y-6">
                <div className={`border-2 rounded-3xl p-6 text-base space-y-2
                  ${isCorrect ? "bg-[#f1f8e9] border-[#a5d6a7] text-[#2e7d32]" : "bg-[#ffebee] border-[#ef9a9a] text-[#c62828]"}`}
                >
                  <p>Your choice: <strong className="font-extrabold text-lg">{selectedAnswer}</strong></p>
                  <p>Correct choice: <strong className="font-extrabold text-lg">{quizItem.correct}</strong></p>
                  <div className="mt-4 pt-4 border-t border-current/20">
                    <p className="font-black text-xl uppercase tracking-wider">
                      Result: {isCorrect ? "CORRECT" : "INCORRECT"}
                    </p>
                  </div>
                </div>

                <button
                  disabled={savingScore}
                  onClick={handleNext}
                  className="w-full h-14 bg-[#81c784] hover:bg-[#66bb6a] border-2 border-[#66bb6a] text-[#1b5e20] font-bold rounded-full transition-transform hover:-translate-y-1 shadow-md text-lg cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {savingScore ? "Saving Score..." : number === quizList.length - 1 ? "Finish Journey" : "Next Question →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}