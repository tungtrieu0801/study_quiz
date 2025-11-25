// src/features/pages/TestDetailPage.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import { message, Button, Tag, Skeleton, Empty, Spin, Result } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    FlagOutlined,
    EyeOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth.js";

// Component con: Màn hình Tổng kết điểm
const SummaryCard = ({ result, onReview, onBack }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200"
    >
        <Result
            status="success"
            title="Nộp bài thành công!"
            subTitle="Kết quả bài thi của bạn đã được ghi nhận."
            extra={[
                <div key="score" className="mb-6">
                    <div className="text-slate-500 mb-2">Điểm số cuối cùng</div>
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                        {result.score}<span className="text-2xl text-slate-400">/10</span>
                    </div>
                    <div className="flex justify-center gap-4 text-sm font-medium">
                        <Tag color="green" className="px-3 py-1 text-base">Đúng: {result.correctCount}</Tag>
                        <Tag color="default" className="px-3 py-1 text-base">Tổng: {result.total}</Tag>
                    </div>
                </div>,
                <Button
                    key="review"
                    type="primary"
                    size="large"
                    icon={<EyeOutlined />}
                    className="w-full mb-3 bg-blue-600 h-12 rounded-xl"
                    onClick={onReview} // Chuyển sang xem chi tiết
                >
                    Xem chi tiết đáp án
                </Button>,
                <Button
                    key="back"
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    className="w-full h-12 rounded-xl"
                    onClick={onBack}
                >
                    Quay về trang chủ
                </Button>
            ]}
        />
    </motion.div>
);


export default function TestDetailPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isInitialized } = useAuth();

    // Data State
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Test State
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitResult, setSubmitResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(1800);

    // UI State
    const [viewMode, setViewMode] = useState('doing'); // 'doing' | 'summary' | 'review'
    const questionRefs = useRef({});

    // 1. Bảo vệ trang
    useEffect(() => {
        if (isInitialized && isAdmin) {
            navigate(`/admin/test/${testId}`, { replace: true });
        }
    }, [isAdmin, isInitialized, testId, navigate]);

    // 2. Fetch TOÀN BỘ câu hỏi
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
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

    // 3. Countdown Timer (Chỉ chạy khi viewMode = 'doing')
    useEffect(() => {
        if (viewMode !== 'doing') return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [viewMode]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return { m, sec };
    };

    const scrollToQuestion = (id) => {
        const element = questionRefs.current[id];
        if (element) {
            const headerOffset = 180;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    const handleSelect = (qId, value) => {
        if (viewMode !== 'doing') return; // Chặn sửa khi không phải 'doing'
        setSelectedAnswers(prev => ({ ...prev, [qId]: value }));
    };

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
            const res = await instance.post("/questions/submit", {
                testId: testId,
                answers: selectedAnswers
            });

            if (res.data.success) {
                setSubmitResult(res.data.data);
                // CHUYỂN NGAY SANG MÀN HÌNH TỔNG KẾT
                setViewMode('summary');
                message.success(`Đã nộp bài! Điểm số: ${res.data.data.score}/10`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Lỗi khi nộp bài. Vui lòng thử lại!";
            message.error(errorMessage);
            console.error(err);
        }
    };

    // --- RENDER LOGIC ---

    // 1. Loading State
    if (!isInitialized || loading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    // 2. Summary Screen (Chặn toàn bộ UI khác)
    if (viewMode === 'summary') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <SummaryCard
                    result={submitResult}
                    onReview={() => setViewMode('review')}
                    onBack={() => navigate('/')}
                />
            </div>
        );
    }

    // 3. Doing/Review State (Render giao diện chính)
    const isReviewing = viewMode === 'review';
    const { m, sec } = formatTime(timeLeft);
    const isUrgent = timeLeft < 300 && viewMode === 'doing';
    const finalQuestions = questions.length === 0 && !loading;


    // --- COMPONENT CON: THANH CÂU HỎI ---
    const QuestionPalette = ({ isMobile = false }) => (
        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2 custom-scrollbar' : 'grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar'}`}>
            {questions.map((q, index) => {
                const isSelected = !!selectedAnswers[q._id];
                let btnClass = isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-slate-500 hover:bg-slate-100 border-slate-200";

                if (submitResult) {
                    const detail = submitResult.details.find(d => d.questionId === q._id);
                    if (detail?.isCorrect) {
                        btnClass = "bg-green-500 text-white border-green-500";
                    } else {
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
            {/* --- STICKY HEADER --- */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col gap-3">
                        {/* Hàng 1: Tiêu đề + Đồng hồ + Nút Nộp */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-700 hidden md:block">{isReviewing ? "Xem lại bài thi" : "Kiểm tra Online"}</h2>

                            {/* Đồng hồ */}
                            <div className={`flex items-center gap-2 text-xl font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                                <ClockCircleOutlined />
                                {m}:{sec}
                            </div>

                            {/* Nút Nộp / Điểm */}
                            <div className="flex items-center gap-3">
                                {isReviewing && (
                                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} size="large" className="font-semibold">Thoát</Button>
                                )}
                                {!isReviewing && (
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        icon={<SendOutlined />}
                                        className="bg-blue-600 shadow-lg shadow-blue-200 font-semibold"
                                    >
                                        Nộp bài
                                    </Button>
                                )}
                            </div>
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
                    {finalQuestions ? (
                        <Empty description="Đề thi chưa có câu hỏi nào" className="mt-10" />
                    ) : (
                        <div className="space-y-6 md:space-y-8">
                            {questions.map((q, idx) => {
                                const userAnswer = selectedAnswers[q._id];
                                const resultData = submitResult?.details?.find(d => d.questionId === q._id);

                                return (
                                    <div
                                        key={q._id}
                                        ref={(el) => (questionRefs.current[q._id] = el)}
                                        className={`
                                            p-5 md:p-8 rounded-2xl bg-white shadow-sm border transition-all scroll-mt-48
                                            ${isReviewing
                                            ? (resultData?.isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30')
                                            : 'border-slate-200 hover:shadow-md'
                                        }
                                        `}
                                    >
                                        {/* Đầu câu hỏi */}
                                        <div className="flex gap-4 mb-4">
                                            <span className={`
                                                flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-colors
                                                ${isReviewing
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

                                                let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                                                let iconRender = null;

                                                if (!isReviewing) {
                                                    if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600";
                                                } else {
                                                    const isCorrectAns = opt === resultData?.correctAnswer;

                                                    if (isCorrectAns) {
                                                        containerClass = "border-green-500 bg-green-100 ring-1 ring-green-500";
                                                        iconRender = <CheckCircleOutlined className="text-green-600 text-xl ml-auto" />;
                                                    } else if (isSelected && !resultData?.isCorrect) {
                                                        containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400 opacity-80";
                                                        iconRender = <CloseCircleOutlined className="text-red-500 text-xl ml-auto" />;
                                                    } else {
                                                        containerClass = "border-slate-100 opacity-50";
                                                    }
                                                }

                                                return (
                                                    <div
                                                        key={opt}
                                                        onClick={() => handleSelect(q._id, opt)}
                                                        className={`relative flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${containerClass}`}
                                                    >
                                                        {!isReviewing && (
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                                                                {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                                            </div>
                                                        )}
                                                        <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                                                        {iconRender}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Giải thích / Lời giải (Chỉ hiện khi đang Review) */}
                                        {isReviewing && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="mt-6 ml-0 md:ml-14 p-4 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 text-sm md:text-base"
                                            >
                                                <div className="font-bold text-amber-800 mb-2 flex items-center gap-2"><FlagOutlined /> Giải thích chi tiết:</div>
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