import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import { message, Button, Progress, Tag, Skeleton, Empty } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    LeftOutlined,
    RightOutlined,
    FlagOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

export default function TestDetailPage() {
    const { testId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submit, setSubmit] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800);
    const [targetScrollId, setTargetScrollId] = useState(null);

    const [page, setPage] = useState(0);
    const questionRefs = useRef({});

    // Tính toán tiến độ
    const progressPercent = Math.round(
        (Object.keys(selectedAnswers).length / (questions.length || 1)) * 100
    );

    useEffect(() => {
        if (targetScrollId) {
            setTimeout(() => {
                questionRefs.current[targetScrollId]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
            setTargetScrollId(null);
        }
    }, [page, targetScrollId]);

    /* ================= COUNTDOWN ================= */
    useEffect(() => {
        if (submit) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
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
        const m = Math.floor(sec / 60)
            .toString()
            .padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return { m, s };
    };

    /* ================= FETCH QUESTIONS ================= */
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const res = await instance.get(`/questions?testId=${testId}`, {
                    headers: { Authorization: `Bearer ${token}` },
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
        if (submit) return; // Không cho chọn lại khi đã nộp
        setSelectedAnswers((prev) => ({ ...prev, [qId]: value }));
    };

    const scrollToQuestion = (id) => {
        const index = questions.findIndex((q) => q._id === id);
        if (index === -1) return;

        const targetPage = Math.floor(index / PAGE_SIZE);
        if (page !== targetPage) {
            setTargetScrollId(id);
            setPage(targetPage);
        } else {
            questionRefs.current[id]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    const handleSubmit = () => {
        if (Object.keys(selectedAnswers).length < questions.length) {
            // Optional: Cảnh báo nếu chưa làm hết
            if(!window.confirm("Bạn chưa hoàn thành tất cả câu hỏi. Có chắc chắn nộp?")) return;
        }
        setSubmit(true);
        message.success("Đã nộp bài thành công!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ================= PAGINATION ================= */
    const PAGE_SIZE = 5; // Tăng số lượng câu trên 1 trang để đỡ phải next nhiều
    const startIndex = page * PAGE_SIZE;
    const pageQuestions = questions.slice(startIndex, startIndex + PAGE_SIZE);
    const totalPages = Math.ceil(questions.length / PAGE_SIZE);

    const timeObj = formatTime(timeLeft);
    const isUrgent = timeLeft < 300; // Dưới 5 phút thì báo đỏ

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header Mobile Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600 to-indigo-800 rounded-b-[3rem] shadow-xl z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 p-4 md:p-8 max-w-7xl mx-auto mt-4">

                {/* =============== SIDEBAR (STICKY) =============== */}
                <div className="lg:w-[320px] shrink-0">
                    <div className="sticky top-8 space-y-6">

                        {/* Timer Card */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 ${isUrgent ? 'border-red-500' : 'border-blue-500'} flex flex-col items-center justify-center`}
                        >
                            <p className="text-slate-500 font-medium mb-2 flex items-center gap-2">
                                <ClockCircleOutlined /> Thời gian còn lại
                            </p>
                            <div className={`text-5xl font-extrabold tracking-widest ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                                {timeObj.m}:{timeObj.s}
                            </div>
                        </motion.div>

                        {/* Navigation Grid */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 text-lg">Question Palette</h3>
                                <Tag color="blue">{questions.length} câu</Tag>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Tiến độ</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <Progress percent={progressPercent} showInfo={false} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                            </div>

                            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                {questions.map((q, index) => {
                                    const isSelected = !!selectedAnswers[q._id];
                                    // Xác định trạng thái câu hỏi
                                    let btnClass = "bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent";

                                    if (isSelected) btnClass = "bg-blue-600 text-white shadow-md shadow-blue-200 border-blue-600";
                                    if (submit) {
                                        // Logic màu sắc sau khi nộp (Optional: Check đúng sai nếu BE trả về ngay, ở đây giả sử chỉ check đã làm)
                                        if (isSelected) btnClass = "bg-green-500 text-white border-green-500";
                                        else btnClass = "bg-red-50 text-red-400 border-red-100";
                                    }

                                    return (
                                        <button
                                            key={q._id}
                                            onClick={() => scrollToQuestion(q._id)}
                                            className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        text-sm font-bold transition-all duration-200 border
                        ${btnClass}
                      `}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {!submit ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SendOutlined />}
                                    className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-200 font-semibold tracking-wide"
                                    onClick={handleSubmit}
                                >
                                    NỘP BÀI THI
                                </Button>
                            ) : (
                                <div className="mt-6 text-center p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 font-bold">
                                    <CheckCircleOutlined className="mr-2"/> Đã hoàn thành
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* =============== MAIN CONTENT =============== */}
                <div className="flex-1">
                    {/* Main Content Header */}
                    <div className="bg-white/90 backdrop-blur-md shadow-sm p-6 rounded-2xl mb-6 border border-white sticky top-0 z-20 md:static">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-800">Bài Kiểm Tra Tổng Hợp</h2>
                                <p className="text-slate-500 text-sm mt-1">Hãy bình tĩnh và làm bài thật tốt nhé!</p>
                            </div>
                            {/* Có thể thêm bộ lọc câu hỏi ở đây nếu cần */}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1,2,3].map(i => <Skeleton active key={i} className="p-6 bg-white rounded-2xl" />)}
                        </div>
                    ) : questions.length === 0 ? (
                        <Empty description="Không có câu hỏi nào" />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={page}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {pageQuestions.map((q, idx) => {
                                    const userAnswer = selectedAnswers[q._id];
                                    const actualIndex = startIndex + idx + 1;

                                    return (
                                        <div
                                            key={q._id}
                                            ref={(el) => (questionRefs.current[q._id] = el)}
                                            className="mb-8 p-6 md:p-8 rounded-3xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
                                        >
                                            {/* Decorative Number Background */}
                                            <span className="absolute -top-4 -right-4 text-9xl font-black text-slate-50 opacity-50 select-none pointer-events-none group-hover:text-blue-50 transition-colors">
                          {actualIndex}
                      </span>

                                            <div className="relative z-10">
                                                {/* Question Header */}
                                                <div className="flex gap-4 mb-6">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                                {actualIndex}
                            </span>
                                                    <div className="pt-1">
                                                        <h3 className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed">
                                                            {q.content}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Options Area */}
                                                <div className="grid gap-3 md:grid-cols-1 ml-0 md:ml-14">
                                                    {q.options.map((opt, optIdx) => {
                                                        const isSelected = userAnswer === opt;
                                                        const isCorrect = q.solution === opt;

                                                        // Logic style cho option
                                                        let wrapperClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50";
                                                        let iconClass = "border-slate-300 text-transparent";

                                                        if (isSelected) {
                                                            wrapperClass = "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500";
                                                            iconClass = "border-blue-500 bg-blue-500 text-white";
                                                        }

                                                        if (submit) {
                                                            if (isCorrect) {
                                                                wrapperClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                                                iconClass = "border-green-500 bg-green-500 text-white";
                                                            } else if (isSelected && !isCorrect) {
                                                                wrapperClass = "border-red-300 bg-red-50 opacity-70";
                                                                iconClass = "border-red-400 bg-red-400 text-white";
                                                            } else {
                                                                wrapperClass = "opacity-50 grayscale";
                                                            }
                                                        }

                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                onClick={() => handleSelect(q._id, opt)}
                                                                className={`
                                            relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                            ${wrapperClass}
                                        `}
                                                            >
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${iconClass}`}>
                                                                    <CheckCircleOutlined className="text-sm" />
                                                                </div>
                                                                <span className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>
                                            {opt}
                                        </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Result Feedback */}
                                                {submit && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        className="mt-6 ml-0 md:ml-14 p-4 bg-green-50 rounded-xl border border-green-200 text-green-800 flex items-start gap-3"
                                                    >
                                                        <CheckCircleOutlined className="mt-1 text-xl"/>
                                                        <div>
                                                            <span className="font-bold block mb-1">Đáp án đúng:</span>
                                                            {q.solution}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Pagination Controls */}
                    {!loading && questions.length > 0 && (
                        <div className="flex justify-between items-center mt-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <Button
                                type="default"
                                size="large"
                                disabled={page === 0}
                                onClick={() => {
                                    setPage(prev => prev - 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                icon={<LeftOutlined />}
                                className="hover:text-blue-600 hover:border-blue-600 rounded-xl"
                            >
                                Trang trước
                            </Button>

                            <span className="font-semibold text-slate-500">
                    Trang {page + 1} / {totalPages}
                </span>

                            <Button
                                type="primary"
                                size="large"
                                disabled={page >= totalPages - 1}
                                onClick={() => {
                                    setPage(prev => prev + 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="bg-blue-600 rounded-xl shadow-md shadow-blue-200"
                            >
                                Trang sau <RightOutlined />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}