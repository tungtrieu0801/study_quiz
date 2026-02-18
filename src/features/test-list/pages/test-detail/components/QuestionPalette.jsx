import React from "react";

const QuestionPalette = ({ questions, selectedAnswers, submitResult, onScrollTo, isMobile = false }) => {
    return (
        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2 custom-scrollbar' : 'grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar'}`}>
            {questions.map((q, index) => {
                const ans = selectedAnswers[q._id];
                let hasAnswered = false;

                if (Array.isArray(ans)) hasAnswered = ans.length > 0;
                else hasAnswered = ans !== undefined && ans !== null && ans !== "";

                let btnClass = hasAnswered ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border-slate-200";

                if (submitResult) {
                    const detail = submitResult.details?.find(d => d.questionId === q._id);
                    if (detail) {
                        btnClass = detail.isCorrect ? "bg-green-500 text-white border-green-500" : "bg-red-500 text-white border-red-500";
                    } else {
                        btnClass = "bg-red-500 text-white border-red-500";
                    }
                }

                return (
                    <button
                        key={q._id}
                        onClick={() => onScrollTo(q._id)}
                        className={`${isMobile ? 'min-w-[40px] h-10' : 'w-10 h-10'} rounded-lg flex items-center justify-center text-sm font-bold border transition-all flex-shrink-0 ${btnClass}`}
                    >
                        {index + 1}
                    </button>
                );
            })}
        </div>
    );
};

export default QuestionPalette;