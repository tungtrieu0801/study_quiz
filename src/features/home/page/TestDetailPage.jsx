import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import { message, Radio, Button } from "antd";

export default function TestDetailPage() {
    const { testId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submit, setSubmit] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 phút
    const [targetScrollId, setTargetScrollId] = useState(null);

    const [page, setPage] = useState(0); // page = mỗi trang 2 câu

    const questionRefs = useRef({});

    useEffect(() => {
        if (targetScrollId) {
            questionRefs.current[targetScrollId]?.scrollIntoView({ behavior: "smooth", block: "start" });
            setTargetScrollId(null); // reset
        }
    }, [page, targetScrollId]);

    /* ================= COUNTDOWN ================= */
    useEffect(() => {
        if (submit) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    message.warning("Hết giờ! Tự động nộp bài.");
                    setSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [submit]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    /* ================= FETCH QUESTIONS ================= */
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const res = await instance.get(`/questions?testId=${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) setQuestions(res.data.data);
                else message.error("Không lấy được câu hỏi");
            } catch (err) {
                console.error(err);
                message.error("Lỗi server");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [testId]);

    const handleSelect = (qId, value) => {
        setSelectedAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const scrollToQuestion = (id) => {
        const index = questions.findIndex(q => q._id === id);
        if (index === -1) return;

        const targetPage = Math.floor(index / PAGE_SIZE);
        if (page !== targetPage) {
            setTargetScrollId(id); // nhớ scroll sau khi render
            setPage(targetPage);
        } else {
            questionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };


    const handleSubmit = () => {
        setSubmit(true);
        message.success("Đã nộp bài!");
    };

    /* ================= PAGINATION ================= */
    const PAGE_SIZE = 2;
    const startIndex = page * PAGE_SIZE;
    const pageQuestions = questions.slice(startIndex, startIndex + PAGE_SIZE);

    const totalPages = Math.ceil(questions.length / PAGE_SIZE);


    return (
        <div className="flex gap-10 p-6 max-w-7xl mx-auto">

            {/* =============== SIDEBAR =============== */}
            <div className="w-[240px] sticky top-4 bg-white shadow-xl p-6 rounded-2xl border border-gray-200">

                {/* TIMER */}
                <div className="text-center mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
                    <p className="font-semibold text-gray-700">⏳ Thời gian còn lại</p>
                    <p className="text-3xl font-bold text-blue-600">{formatTime(timeLeft)}</p>
                </div>

                <p className="font-semibold mb-4 text-center text-lg">Danh sách câu hỏi</p>

                <div className="grid grid-cols-4 gap-3">
                    {questions.map((q, index) => {
                        const isSelected = !!selectedAnswers[q._id];

                        return (
                            <div
                                key={q._id}
                                onClick={() => scrollToQuestion(q._id)}
                                className={`
                                    w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer
                                    text-sm font-semibold transition-all border
                                    ${isSelected
                                    ? "bg-blue-500 border-blue-600 text-white shadow-md"
                                    : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                }
                                `}
                            >
                                {index + 1}
                            </div>
                        );
                    })}
                </div>

                <Button
                    type="primary"
                    className="w-full mt-6 py-2 text-md rounded-lg"
                    onClick={handleSubmit}
                >
                    Nộp bài
                </Button>
            </div>

            {/* =============== MAIN CONTENT =============== */}
            <div className="flex-1">

                {/* HEADER */}
                <div className="bg-white shadow p-5 rounded-xl mb-6 border border-gray-200">
                    <h2 className="text-2xl font-bold">Bài kiểm tra</h2>
                    <p className="text-gray-600 mt-1">
                        Tổng số câu hỏi: {questions.length}
                    </p>
                </div>

                {loading ? (
                    <p>Đang tải câu hỏi...</p>
                ) : (
                    <>
                        {pageQuestions.map((q, idx) => {
                            const userAnswer = selectedAnswers[q._id];

                            return (
                                <div
                                    key={q._id}
                                    ref={el => (questionRefs.current[q._id] = el)}
                                    className={`
                                        mb-10 p-6 rounded-xl bg-white shadow-lg border-2 
                                        ${userAnswer ? "border-blue-500" : "border-gray-300"}
                                    `}
                                >
                                    <p className="font-semibold text-xl mb-3">
                                        Câu {startIndex + idx + 1}: {q.content}
                                    </p>

                                    {/* Đáp án xuống dòng */}
                                    <Radio.Group
                                        onChange={e => handleSelect(q._id, e.target.value)}
                                        value={userAnswer}
                                    >
                                        <div className="flex flex-col gap-3">
                                            {q.options.map(opt => (
                                                <Radio key={opt} value={opt} className="text-md">
                                                    {opt}
                                                </Radio>
                                            ))}
                                        </div>
                                    </Radio.Group>

                                    {submit && (
                                        <p className="mt-4 text-green-600 font-semibold">
                                            ✅ Đáp án đúng: {q.solution}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {/* PAGINATION BUTTONS */}
                        <div className="flex justify-between mt-6">
                            <Button
                                disabled={page === 0}
                                onClick={() => setPage(prev => prev - 1)}
                            >
                                ⬅ Trang trước
                            </Button>

                            <Button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                Trang sau ➡
                            </Button>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
