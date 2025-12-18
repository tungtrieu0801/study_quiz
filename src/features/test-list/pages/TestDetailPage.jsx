// src/features/pages/TestDetailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import { message, Button, Tag, Spin, Result, Modal, Image, Input, Checkbox, Radio, Alert } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    FlagOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
    CheckSquareOutlined,
    BorderOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth.js";

const { TextArea } = Input;

// --- COMPONENT CON: TỔNG KẾT ĐIỂM ---
const SummaryCard = ({ result, onReview, onBack, testTitle }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200"
    >
        <Result
            status="success"
            title="Nộp bài thành công!"
            subTitle={<span>Kết quả bài thi: <strong>{testTitle}</strong> đã được ghi nhận.</span>}
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
                <Button key="review" type="primary" size="large" icon={<EyeOutlined />} className="w-full mb-3 bg-blue-600 h-12 rounded-xl" onClick={onReview}>
                    Xem chi tiết đáp án
                </Button>,
                <Button key="back" size="large" icon={<ArrowLeftOutlined />} className="w-full h-12 rounded-xl" onClick={onBack}>
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
    const [testInfo, setTestInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Test State
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Stores answer for each question ID
    const [submitResult, setSubmitResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // UI State
    const [viewMode, setViewMode] = useState('doing'); // 'doing', 'summary', 'review'
    const [modalConfig, setModalConfig] = useState({ visible: false, type: 'confirm' });

    const hasWarnedRef = useRef(false);
    const questionRefs = useRef({});

    // 1. Bảo vệ trang
    useEffect(() => {
        if (isInitialized && isAdmin) {
            navigate(`/admin/test/${testId}`, { replace: true });
        }
    }, [isAdmin, isInitialized, testId, navigate]);

    // 2. Fetch Dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionsRes, testRes] = await Promise.all([
                    instance.get(`/questions?testId=${testId}&size=999`),
                    instance.get(`/testList/${testId}`)
                ]);

                if (questionsRes.data.success) {
                    setQuestions(questionsRes.data.data);
                }

                if (testRes.data.success) {
                    const rawData = testRes.data.data;
                    const info = Array.isArray(rawData) ? rawData[0] : rawData;
                    setTestInfo(info);

                    let durationInSeconds = 1800;
                    if (info && info.duration) {
                        const numberPart = String(info.duration).replace(/[^0-9]/g, '');
                        const minutes = parseInt(numberPart);
                        if (!isNaN(minutes) && minutes > 0) durationInSeconds = minutes * 60;
                    }
                    setTimeLeft(durationInSeconds);
                }
            } catch (err) {
                console.error(err);
                message.error("Lỗi tải dữ liệu bài thi");
            } finally {
                setLoading(false);
            }
        };
        if (isInitialized) fetchData();
    }, [testId, isInitialized]);

    // 3. Countdown Timer
    useEffect(() => {
        if (viewMode !== 'doing' || timeLeft === null) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                if (prev === 121 && !hasWarnedRef.current) {
                    message.warning({ content: "⚠️ Chú ý: Chỉ còn 2 phút làm bài!", duration: 5 });
                    hasWarnedRef.current = true;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [viewMode, timeLeft]);

    const formatTime = (s) => {
        if (s === null) return { m: '--', sec: '--' };
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

    // --- LOGIC XỬ LÝ INPUT (QUAN TRỌNG) ---
    const handleAnswerChange = (qId, value, type) => {
        if (viewMode !== 'doing') return;

        setSelectedAnswers(prev => {
            const current = prev[qId];

            if (type === 'MULTIPLE_SELECT') {
                // Logic chọn nhiều: Nếu có rồi thì bỏ, chưa có thì thêm
                let newArr = Array.isArray(current) ? [...current] : [];
                if (newArr.includes(value)) {
                    newArr = newArr.filter(item => item !== value);
                } else {
                    newArr.push(value);
                }
                return { ...prev, [qId]: newArr };
            }

            if (type === 'FILL_IN_THE_BLANK') {
                // value ở đây là { index: 0, text: "abc" }
                let newArr = Array.isArray(current) ? [...current] : [];
                newArr[value.index] = value.text;
                return { ...prev, [qId]: newArr };
            }

            // Các loại khác (Single, TrueFalse, ShortAnswer) -> Lưu đè
            return { ...prev, [qId]: value };
        });
    };

    // --- LOGIC NỘP BÀI ---
    const handleManualSubmit = () => {
        // Tính số câu chưa làm (check null, undefined, mảng rỗng, string rỗng)
        const unansweredCount = questions.filter(q => {
            const ans = selectedAnswers[q._id];
            if (ans === undefined || ans === null) return true;
            if (Array.isArray(ans) && ans.length === 0) return true;
            if (typeof ans === 'string' && ans.trim() === '') return true;
            // Với fill in blank, check xem có ô nào trống không
            if (q.type === 'FILL_IN_THE_BLANK' && Array.isArray(ans)) {
                // Đếm số chỗ trống trong câu hỏi
                const blanksCount = q.content.split('___').length - 1;
                // Nếu mảng answer chưa đủ độ dài hoặc có phần tử rỗng
                if(ans.length < blanksCount) return true;
                for(let i=0; i<blanksCount; i++) if(!ans[i] || ans[i].trim() === '') return true;
            }
            return false;
        }).length;

        if (unansweredCount > 0) {
            setModalConfig({ visible: true, type: 'block', count: unansweredCount });
        } else {
            setModalConfig({ visible: true, type: 'confirm' });
        }
    };

    const handleModalOk = () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        if (modalConfig.type === 'confirm') processSubmit();
    };

    const handleAutoSubmit = () => {
        Modal.warning({
            title: 'Hết thời gian!',
            content: 'Hệ thống sẽ tự động thu bài.',
            onOk: () => processSubmit()
        });
    };

    const processSubmit = async () => {
        try {
            const fullAnswers = {};
            questions.forEach(q => {
                fullAnswers[q._id] = selectedAnswers[q._id] || null;
            });

            const res = await instance.post("/questions/submit", { testId, answers: fullAnswers });
            if (res.data.success) {
                setSubmitResult(res.data.data);
                setViewMode('summary');
                message.success("Nộp bài thành công!");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            message.error(err.response?.data?.message || "Lỗi nộp bài.");
        }
    };

    // --- RENDERERS CHO TỪNG LOẠI CÂU HỎI ---

    // 1. Single Choice
    const renderSingleChoice = (q, userAnswer, resultData, isReviewing) => {
        return (
            <div className="grid gap-3 ml-0 md:ml-0">
                {q.options.map((opt) => {
                    const isSelected = userAnswer === opt;
                    let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                    let iconRender = null;

                    if (!isReviewing) {
                        if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm";
                    } else {
                        if (resultData) {
                            const isCorrectAns = opt === resultData.correctAnswer;
                            if (isCorrectAns) {
                                containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                iconRender = <CheckCircleOutlined className="text-green-600 text-xl ml-auto" />;
                            } else if (isSelected && !resultData.isCorrect) {
                                containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400 opacity-80";
                                iconRender = <CloseCircleOutlined className="text-red-500 text-xl ml-auto" />;
                            } else {
                                containerClass = "border-slate-100 opacity-50";
                            }
                        } else {
                            containerClass = "border-slate-100 opacity-50";
                        }
                    }

                    return (
                        <div key={opt} onClick={() => handleAnswerChange(q._id, opt, 'SINGLE_CHOICE')}
                             className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${containerClass}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                            </div>
                            <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                            {iconRender}
                        </div>
                    );
                })}
            </div>
        );
    };

    // 2. Multiple Select
    const renderMultipleSelect = (q, userAnswer, resultData, isReviewing) => {
        const currentSelected = Array.isArray(userAnswer) ? userAnswer : [];

        return (
            <div className="grid gap-3">
                <div className="text-sm text-slate-500 italic mb-1">* Chọn tất cả các đáp án đúng</div>
                {q.options.map((opt) => {
                    const isSelected = currentSelected.includes(opt);
                    let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                    let iconRender = null;

                    if (!isReviewing) {
                        if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm";
                    } else {
                        // Logic Review Multiple
                        if (resultData) {
                            // Backend trả về resultData.correctAnswer là mảng các đáp án đúng
                            const correctArr = Array.isArray(resultData.correctAnswer) ? resultData.correctAnswer : [];
                            const isCorrectOpt = correctArr.includes(opt);

                            if (isCorrectOpt) {
                                if (isSelected) {
                                    // Chọn đúng
                                    containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                    iconRender = <CheckCircleOutlined className="text-green-600 text-xl ml-auto" />;
                                } else {
                                    // Đúng nhưng không chọn -> Nhắc nhở
                                    containerClass = "border-green-500 border-dashed bg-white opacity-70";
                                    iconRender = <span className="ml-auto text-green-600 text-xs font-bold">(Đáp án đúng)</span>;
                                }
                            } else if (isSelected && !isCorrectOpt) {
                                // Chọn sai
                                containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400";
                                iconRender = <CloseCircleOutlined className="text-red-500 text-xl ml-auto" />;
                            } else {
                                containerClass = "border-slate-100 opacity-40";
                            }
                        }
                    }

                    return (
                        <div key={opt} onClick={() => handleAnswerChange(q._id, opt, 'MULTIPLE_SELECT')}
                             className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${containerClass}`}>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                {isSelected && <CheckSquareOutlined className="text-white text-xs" />}
                            </div>
                            <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                            {iconRender}
                        </div>
                    );
                })}
            </div>
        );
    };

    // 3. True / False
    const renderTrueFalse = (q, userAnswer, resultData, isReviewing) => {
        // userAnswer có thể là boolean (true/false) hoặc string "true"/"false" hoặc null
        // convert về string để so sánh
        const currentVal = String(userAnswer);

        const options = [
            { label: "Đúng (True)", val: "true", color: "text-green-700" },
            { label: "Sai (False)", val: "false", color: "text-red-700" }
        ];

        return (
            <div className="flex gap-4">
                {options.map((opt) => {
                    const isSelected = currentVal === opt.val;
                    let btnClass = "bg-white border-slate-200 text-slate-500 hover:border-blue-400";

                    if (!isReviewing) {
                        if (isSelected) btnClass = "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600 font-bold shadow-md";
                    } else if (resultData) {
                        const correctVal = String(resultData.correctAnswer);
                        if (opt.val === correctVal) {
                            btnClass = "bg-green-100 border-green-500 text-green-800 ring-1 ring-green-500 font-bold";
                        } else if (isSelected && opt.val !== correctVal) {
                            btnClass = "bg-red-50 border-red-400 text-red-800 ring-1 ring-red-400 opacity-80";
                        } else {
                            btnClass = "bg-slate-50 border-slate-100 opacity-40";
                        }
                    }

                    return (
                        <button
                            key={opt.val}
                            onClick={() => handleAnswerChange(q._id, opt.val, 'TRUE_FALSE')}
                            className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all text-lg ${btnClass}`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        );
    };

    // 4. Fill in the Blank
    const renderFillInTheBlank = (q, userAnswer, resultData, isReviewing) => {
        // Split content by '___'
        const parts = q.content.split('___');
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];

        // Nếu đang review, backend trả về mảng đáp án đúng
        const correctAnswers = resultData && Array.isArray(resultData.correctAnswer) ? resultData.correctAnswer : [];

        return (
            <div className="leading-10 text-lg text-slate-800">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        <span>{part}</span>
                        {index < parts.length - 1 && (
                            <span className="inline-block mx-1">
                                {isReviewing ? (
                                    // REVIEW MODE
                                    <span className="flex flex-col items-center leading-normal align-middle">
                                        <span className={`px-2 py-1 rounded font-bold border-b-2 
                                            ${userAnswers[index] === correctAnswers[index]
                                            ? 'bg-green-100 text-green-700 border-green-500'
                                            : 'bg-red-50 text-red-700 border-red-500 line-through decoration-red-500'}`}>
                                            {userAnswers[index] || "(Trống)"}
                                        </span>
                                        {userAnswers[index] !== correctAnswers[index] && (
                                            <span className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-1 rounded">
                                                {correctAnswers[index]}
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    // DOING MODE
                                    <Input
                                        style={{ width: '150px', textAlign: 'center' }}
                                        placeholder={`(${index + 1})`}
                                        value={userAnswers[index] || ""}
                                        onChange={(e) => handleAnswerChange(q._id, { index: index, text: e.target.value }, 'FILL_IN_THE_BLANK')}
                                        className="font-medium text-blue-800 border-blue-300 focus:border-blue-600 focus:shadow-md"
                                    />
                                )}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // 5. Short Answer
    const renderShortAnswer = (q, userAnswer, resultData, isReviewing) => {
        return (
            <div className="w-full">
                {isReviewing ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="mb-2">
                            <span className="text-slate-500 text-sm">Câu trả lời của bạn:</span>
                            <div className={`mt-1 font-medium text-lg ${resultData?.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {userAnswer || "(Bỏ trống)"}
                            </div>
                        </div>
                        {!resultData?.isCorrect && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <span className="text-slate-500 text-sm">Đáp án tham khảo:</span>
                                <div className="mt-1 font-medium text-lg text-green-700">
                                    {Array.isArray(resultData?.correctAnswer) ? resultData.correctAnswer.join(" / ") : resultData?.correctAnswer}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <TextArea
                        rows={3}
                        placeholder="Nhập câu trả lời của bạn tại đây..."
                        value={userAnswer || ""}
                        onChange={(e) => handleAnswerChange(q._id, e.target.value, 'SHORT_ANSWER')}
                        className="rounded-xl border-slate-300 text-base focus:border-blue-500 focus:shadow-sm"
                    />
                )}
            </div>
        );
    };

    // --- MAIN RENDER QUESTION ITEM ---
    const renderQuestionInput = (q, userAnswer, resultData, isReviewing) => {
        // Tùy theo Type mà gọi hàm render tương ứng
        switch (q.type) {
            case 'MULTIPLE_SELECT':
                return renderMultipleSelect(q, userAnswer, resultData, isReviewing);
            case 'TRUE_FALSE':
                return renderTrueFalse(q, userAnswer, resultData, isReviewing);
            case 'FILL_IN_THE_BLANK':
                return renderFillInTheBlank(q, userAnswer, resultData, isReviewing);
            case 'SHORT_ANSWER':
                return renderShortAnswer(q, userAnswer, resultData, isReviewing);
            case 'SINGLE_CHOICE':
            default:
                return renderSingleChoice(q, userAnswer, resultData, isReviewing);
        }
    };

    // --- RENDER MAIN UI ---
    if (!isInitialized || loading || timeLeft === null) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    if (viewMode === 'summary') {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><SummaryCard result={submitResult} onReview={() => setViewMode('review')} onBack={() => navigate('/')} testTitle={testInfo?.title} /></div>;
    }

    const isReviewing = viewMode === 'review';
    const { m, sec } = formatTime(timeLeft);
    const isUrgent = timeLeft < 120 && viewMode === 'doing';
    const finalQuestions = questions.length === 0;

    // Palette: Nút bấm chuyển câu nhanh
    const QuestionPalette = ({ isMobile = false }) => (
        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2 custom-scrollbar' : 'grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar'}`}>
            {questions.map((q, index) => {
                // Check đã làm chưa
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

                return (<button key={q._id} onClick={() => scrollToQuestion(q._id)} className={`${isMobile ? 'min-w-[40px] h-10' : 'w-10 h-10'} rounded-lg flex items-center justify-center text-sm font-bold border transition-all flex-shrink-0 ${btnClass}`}>{index + 1}</button>);
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h2 className="text-base font-bold text-slate-700 md:text-lg line-clamp-1">{isReviewing ? "Xem lại bài thi" : testInfo?.title || "Kiểm tra Online"}</h2>
                                {!isReviewing && <span className="text-xs text-slate-400 hidden md:block">Thời gian: {testInfo?.duration}</span>}
                            </div>
                            <div className={`flex items-center gap-2 text-xl font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                                <ClockCircleOutlined /> {m}:{sec}
                            </div>
                            <div className="flex items-center gap-3">
                                {isReviewing && (<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} size="middle" className="font-semibold">Thoát</Button>)}
                                {!isReviewing && (<Button type="primary" onClick={handleManualSubmit} icon={<SendOutlined />} className="bg-blue-600 shadow-lg font-semibold">Nộp bài</Button>)}
                            </div>
                        </div>
                        <div className="lg:hidden w-full"><QuestionPalette isMobile={true} /></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-8">
                {/* Sidebar Desktop */}
                <div className="hidden lg:block w-[300px] shrink-0">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700">Danh sách câu</h3><Tag>{questions.length} câu</Tag></div>
                            <QuestionPalette isMobile={false} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {finalQuestions ? (
                        <div className="text-center mt-20 text-slate-400">Đề thi chưa có câu hỏi nào.</div>
                    ) : (
                        <div className="space-y-6 md:space-y-8">
                            {questions.map((q, idx) => {
                                const userAnswer = selectedAnswers[q._id];
                                let resultData = null;
                                if (submitResult && submitResult.details) {
                                    resultData = submitResult.details.find(d => d.questionId === q._id);
                                }

                                return (
                                    <div
                                        key={q._id}
                                        ref={(el) => (questionRefs.current[q._id] = el)}
                                        className={`
                                            p-5 md:p-8 rounded-2xl bg-white shadow-sm border transition-all scroll-mt-48
                                            ${isReviewing
                                            ? (resultData?.isCorrect ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20')
                                            : 'border-slate-200 hover:shadow-md'
                                        }
                                        `}
                                    >
                                        <div className="flex gap-4 mb-4">
                                            <span className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-colors ${isReviewing ? (resultData?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-blue-100 text-blue-600'}`}>
                                                {idx + 1}
                                            </span>

                                            <div className="pt-1 w-full">
                                                {/* Nếu là Fill Blank thì content render trong input luôn, ko render ở đây để tránh trùng lặp, trừ khi muốn hiện đề bài gốc */}
                                                {q.type !== 'FILL_IN_THE_BLANK' && (
                                                    <h3 className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed mb-3">
                                                        {q.content}
                                                    </h3>
                                                )}

                                                {q.type === 'FILL_IN_THE_BLANK' && (
                                                    <div className="mb-3">
                                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Điền từ vào chỗ trống:</span>
                                                        {/* Render Fill blank content inside Input area */}
                                                    </div>
                                                )}

                                                {q.imageUrl && (
                                                    <div className="w-full my-4 flex justify-center">
                                                        <Image
                                                            src={q.imageUrl}
                                                            className="rounded-lg border border-slate-100 object-contain"
                                                            style={{ maxHeight: "350px", maxWidth: "100%" }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Khu vực render input */}
                                        <div className="ml-0 md:ml-14">
                                            {renderQuestionInput(q, userAnswer, resultData, isReviewing)}
                                        </div>

                                        {/* Lời giải chi tiết (Review Mode) */}
                                        {isReviewing && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 ml-0 md:ml-14 p-4 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 text-sm md:text-base">
                                                <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                                    {!resultData ? <WarningOutlined className="text-red-500"/> : <FlagOutlined />}
                                                    {resultData ? "Giải thích chi tiết:" : <span className="text-red-600">Bạn chưa làm câu này!</span>}
                                                </div>
                                                <div className="leading-relaxed">
                                                    {resultData?.solution || (
                                                        resultData
                                                            ? <span className="italic text-slate-500">Không có lời giải chi tiết.</span>
                                                            : <span className="italic text-slate-400">Hệ thống không hiển thị đáp án cho câu hỏi chưa làm.</span>
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

            {/* Modal Confirm Submit */}
            <Modal
                title={<div className="flex items-center gap-2 text-lg font-bold text-slate-800">{modalConfig.type === 'block' ? <WarningOutlined className="text-red-500 text-xl"/> : <ExclamationCircleOutlined className="text-orange-500 text-xl"/>}{modalConfig.type === 'block' ? "Chưa hoàn thành bài thi" : "Xác nhận nộp bài"}</div>}
                open={modalConfig.visible}
                onCancel={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                onOk={handleModalOk}
                okText={modalConfig.type === 'block' ? "Đã hiểu, làm tiếp" : "Nộp ngay"}
                cancelText={modalConfig.type === 'block' ? null : "Làm tiếp"}
                okButtonProps={{ className: modalConfig.type === 'block' ? "bg-blue-600" : "bg-green-600 hover:bg-green-500 border-none", size: "large" }}
                cancelButtonProps={{ style: { display: modalConfig.type === 'block' ? 'none' : 'inline-block' }, size: "large" }}
                centered zIndex={3000}
            >
                <div className="py-4 text-base">
                    {modalConfig.type === 'block' ? (
                        <div><p className="mb-2">Bạn vẫn còn <strong className="text-red-600 text-lg">{modalConfig.count}</strong> câu hỏi chưa hoàn thành.</p><p className="text-slate-500 text-sm">Vui lòng kiểm tra lại các câu hỏi (đặc biệt là câu điền từ/chọn nhiều).</p></div>
                    ) : (
                        <p>Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài và kết thúc phiên làm việc này không?</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}