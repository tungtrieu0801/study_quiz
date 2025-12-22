import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin, Modal, Tag } from "antd";

// IMPORT COMPONENTS
import SummaryResult from "./components/SummaryResult";
import TestHeader from "./components/TestHeader";
import QuestionPalette from "./components/QuestionPalette";
import QuestionItem from "./components/QuestionItem";
import SubmitModal from "./components/SubmitModal";
import useAuth from "../../../../app/hooks/useAuth.js";
import instance from "../../../../shared/lib/axios.config.js";

export default function TestDetailPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isInitialized } = useAuth();

    // Data State
    const [questions, setQuestions] = useState([]);
    const [testInfo, setTestInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Test State
    const [selectedAnswers, setSelectedAnswers] = useState({});
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

                if (questionsRes.data.success) setQuestions(questionsRes.data.data);

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

    const scrollToQuestion = (id) => {
        const element = questionRefs.current[id];
        if (element) {
            const headerOffset = 180;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    // --- LOGIC XỬ LÝ INPUT ---
    const handleAnswerChange = (qId, value, type) => {
        if (viewMode !== 'doing') return;

        setSelectedAnswers(prev => {
            const current = prev[qId];

            if (type === 'MULTIPLE_SELECT') {
                let newArr = Array.isArray(current) ? [...current] : [];
                if (newArr.includes(value)) newArr = newArr.filter(item => item !== value);
                else newArr.push(value);
                return { ...prev, [qId]: newArr };
            }

            if (type === 'FILL_IN_THE_BLANK') {
                let newArr = Array.isArray(current) ? [...current] : [];
                newArr[value.index] = value.text;
                return { ...prev, [qId]: newArr };
            }

            return { ...prev, [qId]: value };
        });
    };

    // --- LOGIC NỘP BÀI ---
    const handleManualSubmit = () => {
        const unansweredCount = questions.filter(q => {
            const ans = selectedAnswers[q._id];
            if (ans === undefined || ans === null) return true;
            if (Array.isArray(ans) && ans.length === 0) return true;
            if (typeof ans === 'string' && ans.trim() === '') return true;
            if (q.type === 'FILL_IN_THE_BLANK' && Array.isArray(ans)) {
                const blanksCount = q.content.split('___').length - 1;
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
            questions.forEach(q => { fullAnswers[q._id] = selectedAnswers[q._id] || null; });

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

    // --- RENDER ---
    if (!isInitialized || loading || timeLeft === null) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    if (viewMode === 'summary') {
        return <SummaryResult result={submitResult} onReview={() => setViewMode('review')} onBack={() => navigate('/')} testTitle={testInfo?.title} />;
    }

    const isReviewing = viewMode === 'review';
    const finalQuestions = questions.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <TestHeader
                title={testInfo?.title}
                duration={testInfo?.duration}
                timeLeft={timeLeft}
                isReviewing={isReviewing}
                onExit={() => navigate('/')}
                onSubmit={handleManualSubmit}
                questions={questions}
                selectedAnswers={selectedAnswers}
                submitResult={submitResult}
                onScrollTo={scrollToQuestion}
            />

            <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-8">
                {/* Sidebar Desktop */}
                <div className="hidden lg:block w-[300px] shrink-0">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700">Danh sách câu</h3><Tag>{questions.length} câu</Tag></div>
                            <QuestionPalette
                                questions={questions}
                                selectedAnswers={selectedAnswers}
                                submitResult={submitResult}
                                onScrollTo={scrollToQuestion}
                                isMobile={false}
                            />
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
                                    <QuestionItem
                                        key={q._id}
                                        ref={(el) => (questionRefs.current[q._id] = el)}
                                        q={q}
                                        index={idx}
                                        userAnswer={userAnswer}
                                        resultData={resultData}
                                        isReviewing={isReviewing}
                                        onChange={handleAnswerChange}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <SubmitModal
                config={modalConfig}
                onCancel={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                onOk={() => {
                    setModalConfig(prev => ({ ...prev, visible: false }));
                    if (modalConfig.type === 'confirm') processSubmit();
                }}
            />
        </div>
    );
}