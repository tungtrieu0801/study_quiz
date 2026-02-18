import React from "react";
import { Button } from "antd";
import { ClockCircleOutlined, ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import QuestionPalette from "./QuestionPalette"; // Tái sử dụng Palette cho Mobile

const TestHeader = ({
                        title,
                        duration,
                        timeLeft,
                        isReviewing,
                        onExit,
                        onSubmit,
                        questions,
                        selectedAnswers,
                        submitResult,
                        onScrollTo
                    }) => {
    // Format time logic
    const formatTime = (s) => {
        if (s === null) return { m: '--', sec: '--' };
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return { m, sec };
    };

    const { m, sec } = formatTime(timeLeft);
    const isUrgent = timeLeft < 120 && !isReviewing;

    return (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h2 className="text-base font-bold text-slate-700 md:text-lg line-clamp-1">
                                {isReviewing ? "Xem lại bài thi" : title || "Kiểm tra Online"}
                            </h2>
                            {!isReviewing && <span className="text-xs text-slate-400 hidden md:block">Thời gian: {duration}</span>}
                        </div>

                        <div className={`flex items-center gap-2 text-xl font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                            <ClockCircleOutlined /> {m}:{sec}
                        </div>

                        <div className="flex items-center gap-3">
                            {isReviewing ? (
                                <Button icon={<ArrowLeftOutlined />} onClick={onExit} size="middle" className="font-semibold">Thoát</Button>
                            ) : (
                                <Button type="primary" onClick={onSubmit} icon={<SendOutlined />} className="bg-blue-600 shadow-lg font-semibold">Nộp bài</Button>
                            )}
                        </div>
                    </div>
                    {/* Mobile Palette */}
                    <div className="lg:hidden w-full">
                        <QuestionPalette
                            questions={questions}
                            selectedAnswers={selectedAnswers}
                            submitResult={submitResult}
                            onScrollTo={onScrollTo}
                            isMobile={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestHeader;