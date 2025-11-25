// src/features/pages/TestDetailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import { message, Button, Tag, Skeleton, Empty, Spin } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    FlagOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth.js";

export default function TestDetailPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isInitialized } = useAuth();

    // Data State
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Test State
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: "A" }
    const [submitResult, setSubmitResult] = useState(null); // Kết quả trả về từ BE
    const [timeLeft, setTimeLeft] = useState(1800); // 30 phút mặc định

    // UI Refs
    const questionRefs = useRef({});

    // 1. Bảo vệ trang (Nếu bạn muốn test UI bằng nick Admin thì comment đoạn này lại)
    useEffect(() => {
        if (isInitialized && isAdmin) {
            navigate(`/admin/test/${testId}`, { replace: true });
        }
    }, [isAdmin, isInitialized, testId, navigate]);

    // 2. Fetch TOÀN BỘ câu hỏi (size lớn để lấy hết)
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Thêm size=999 để lấy hết câu hỏi
                const res = await instance.get(`/questions?testId=${testId}&size=999`);
                if (res.data.success) {
                    setQuestions(res.data.data);
                } else {
                    message.error("Không lấy được câu hỏi");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (isInitialized) {
            fetchQuestions();
        }
    }, [testId, isInitialized]);

    // 3. Countdown Timer
    useEffect(() => {
        if (submitResult) return; // Dừng đếm khi đã nộp
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit(); // Tự động nộp khi hết giờ
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [submitResult]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return { m, sec };
    };

    // 4. Scroll tới câu hỏi
    const scrollToQuestion = (id) => {
        const element = questionRefs.current[id];
        if (element) {
            // Scroll có offset để không bị header che mất trên mobile
            const headerOffset = 180;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const handleSelect = (qId, value) => {
        if (submitResult) return; // Không cho chọn lại khi đã nộp
        setSelectedAnswers(prev => ({ ...prev, [qId]: value }));
    };

    // 5. Submit Logic
    const handleSubmit = async () => {
        if (Object.keys(selectedAnswers).length < questions.length) {
            if (!window.confirm("Bạn chưa làm hết câu hỏi. Chắc chắn nộp?")) return;
        }
        await processSubmit();
    };

    const handleAutoSubmit = async () => {
        message.warning("Hết giờ! Hệ thống đang nộp bài...");
        await processSubmit();
    };

    const processSubmit = async () => {
        try {
            // Gọi API backend mới tạo
            const res = await instance.post("/questions/submit", {
                answers: selectedAnswers
            });

            if (res.data.success) {
                setSubmitResult(res.data.data); // Lưu kết quả chấm từ server
                message.success(`Đã nộp bài! Điểm số: ${res.data.data.score}/10`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            message.error("Lỗi khi nộp bài. Vui lòng thử lại!");
            console.error(err);
        }
    };

    // Loading State
    if (!isInitialized) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    const { m, sec } = formatTime(timeLeft);
    const isUrgent = timeLeft < 300 && !submitResult;

    // --- COMPONENT CON: THANH CÂU HỎI ---
    const QuestionPalette = ({ isMobile = false }) => (
        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2 custom-scrollbar' : 'grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar'}`}>
            {questions.map((q, index) => {
                const isSelected = !!selectedAnswers[q._id];
                let btnClass = isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-slate-500 hover:bg-slate-100 border-slate-200";

                // Logic màu sắc sau khi nộp
                if (submitResult) {
                    const detail = submitResult.details.find(d => d.questionId === q._id);
                    if (detail?.isCorrect) {
                        btnClass = "bg-green-500 text-white border-green-500";
                    } else {
                        // Nếu sai (hoặc không chọn) thì hiện màu đỏ
                        btnClass = "bg-red-500 text-white border-red-500";
                    }
                }

                return (
                    <button
                        key={q._id}
                        onClick={() => scrollToQuestion(q._id)}
                        className={`
                            ${isMobile ? 'min-w-[40px] h-10' : 'w-10 h-10'} 
                            rounded-lg flex items-center justify-center text-sm font-bold border transition-all flex-shrink-0
                            ${btnClass}
                        `}
                    >
                        {index + 1}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* --- STICKY HEADER (Mobile & Desktop) --- */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col gap-3">
                        {/* Hàng 1: Tiêu đề + Đồng hồ + Nút Nộp */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-700 hidden md:block">Kiểm tra Online</h2>

                            {/* Đồng hồ */}
                            <div className={`flex items-center gap-2 text-xl font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                                <ClockCircleOutlined />
                                {m}:{sec}
                            </div>

                            {/* Nút Nộp / Điểm */}
                            {!submitResult ? (
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    icon={<SendOutlined />}
                                    className="bg-blue-600 shadow-lg shadow-blue-200 font-semibold"
                                >
                                    Nộp bài
                                </Button>
                            ) : (
                                <Tag color="gold" className="text-lg px-3 py-1 font-bold rounded-lg border-gold-400">
                                    Điểm: {submitResult.score}
                                </Tag>
                            )}
                        </div>

                        {/* Hàng 2 (Mobile Only): Thanh cuộn câu hỏi */}
                        <div className="lg:hidden w-full">
                            <QuestionPalette isMobile={true} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-8">

                {/* --- SIDEBAR (Chỉ hiện trên Desktop) --- */}
                <div className="hidden lg:block w-[300px] shrink-0">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700">Danh sách câu</h3>
                                <Tag>{questions.length} câu</Tag>
                            </div>
                            <QuestionPalette isMobile={false} />
                        </div>
                    </div>
                </div>

                {/* --- DANH SÁCH CÂU HỎI (Main Content) --- */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <Skeleton active key={i} className="p-6 bg-white rounded-2xl" />)}
                        </div>
                    ) : questions.length === 0 ? (
                        <Empty description="Đề thi chưa có câu hỏi nào" className="mt-10" />
                    ) : (
                        <div className="space-y-6 md:space-y-8">
                            {questions.map((q, idx) => {
                                const userAnswer = selectedAnswers[q._id];
                                // Tìm kết quả chấm của câu này (nếu đã nộp)
                                const resultData = submitResult?.details?.find(d => d.questionId === q._id);

                                return (
                                    <div
                                        key={q._id}
                                        ref={(el) => (questionRefs.current[q._id] = el)}
                                        className={`
                                            p-5 md:p-8 rounded-2xl bg-white shadow-sm border transition-all scroll-mt-48
                                            ${submitResult
                                            ? (resultData?.isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30')
                                            : 'border-slate-200 hover:shadow-md'
                                        }
                                        `}
                                    >
                                        {/* Đầu câu hỏi */}
                                        <div className="flex gap-4 mb-4">
                                            <span className={`
                                                flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-colors
                                                ${submitResult
                                                ? (resultData?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                                                : 'bg-blue-100 text-blue-600'
                                            }
                                            `}>
                                                {idx + 1}
                                            </span>
                                            <div className="pt-1 w-full">
                                                <h3 className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed">
                                                    {q.content}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Các lựa chọn (A, B, C, D) */}
                                        <div className="grid gap-3 ml-0 md:ml-14">
                                            {q.options.map((opt) => {
                                                const isSelected = userAnswer === opt;

                                                // --- Logic tô màu đáp án ---
                                                let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                                                let iconRender = null;

                                                if (!submitResult) {
                                                    // Trạng thái đang làm bài: Chỉ tô xanh cái đang chọn
                                                    if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600";
                                                } else {
                                                    // Trạng thái đã nộp:
                                                    const isCorrectAns = opt === resultData?.correctAnswer;

                                                    if (isCorrectAns) {
                                                        // Đáp án đúng luôn xanh
                                                        containerClass = "border-green-500 bg-green-100 ring-1 ring-green-500";
                                                        iconRender = <CheckCircleOutlined className="text-green-600 text-xl ml-auto" />;
                                                    } else if (isSelected && !resultData?.isCorrect) {
                                                        // Chọn sai thì đỏ
                                                        containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400 opacity-80";
                                                        iconRender = <CloseCircleOutlined className="text-red-500 text-xl ml-auto" />;
                                                    } else {
                                                        // Các câu khác làm mờ
                                                        containerClass = "border-slate-100 opacity-50";
                                                    }
                                                }

                                                return (
                                                    <div
                                                        key={opt}
                                                        onClick={() => handleSelect(q._id, opt)}
                                                        className={`
                                                            relative flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200
                                                            ${containerClass}
                                                        `}
                                                    >
                                                        {/* Radio Circle UI (Chỉ hiện khi chưa nộp) */}
                                                        {!submitResult && (
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                                                                {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                                            </div>
                                                        )}

                                                        <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {opt}
                                                        </span>

                                                        {iconRender}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Giải thích / Lời giải (Chỉ hiện khi đã nộp) */}
                                        {submitResult && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="mt-6 ml-0 md:ml-14 p-4 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 text-sm md:text-base"
                                            >
                                                <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                                    <FlagOutlined /> Giải thích chi tiết:
                                                </div>
                                                <div className="leading-relaxed">
                                                    {resultData?.solution || (
                                                        <span className="italic text-slate-500">Không có lời giải chi tiết cho câu này. Đáp án đúng là: <strong>{resultData?.correctAnswer}</strong></span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}