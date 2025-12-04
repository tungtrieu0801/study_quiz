// src/features/pages/TestDetailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import { message, Button, Tag, Skeleton, Empty, Spin, Result, Modal, Image } from "antd"; // Đã thêm Image
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SendOutlined,
    FlagOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
    ExclamationCircleOutlined,
    WarningOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth.js";

// Component con: Màn hình Tổng kết điểm
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
                <Button
                    key="review"
                    type="primary"
                    size="large"
                    icon={<EyeOutlined />}
                    className="w-full mb-3 bg-blue-600 h-12 rounded-xl"
                    onClick={onReview}
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
    const [testInfo, setTestInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Test State
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitResult, setSubmitResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // UI State
    const [viewMode, setViewMode] = useState('doing');

    // State Modal
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'confirm'
    });

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
                        if (!isNaN(minutes) && minutes > 0) {
                            durationInSeconds = minutes * 60;
                        }
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

    const handleSelect = (qId, value) => {
        if (viewMode !== 'doing') return;
        setSelectedAnswers(prev => ({ ...prev, [qId]: value }));
    };

    // --- LOGIC NỘP BÀI ---

    const handleManualSubmit = () => {
        const unansweredCount = questions.length - Object.keys(selectedAnswers).length;

        if (unansweredCount > 0) {
            setModalConfig({ visible: true, type: 'block' });
        } else {
            setModalConfig({ visible: true, type: 'confirm' });
        }
    };

    const handleModalOk = () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        if (modalConfig.type === 'confirm') {
            processSubmit();
        }
    };

    const handleAutoSubmit = () => {
        Modal.warning({
            title: 'Hết thời gian làm bài!',
            content: 'Hệ thống sẽ tự động thu bài của bạn ngay bây giờ.',
            okText: 'Xem kết quả',
            centered: true,
            keyboard: false,
            maskClosable: false,
            onOk: () => { }
        });
        processSubmit();
    };

    const processSubmit = async () => {
        try {
            // --- BƯỚC 1: CHUẨN BỊ DỮ LIỆU ĐẦY ĐỦ ---
            // Tạo một object chứa đáp án của TẤT CẢ câu hỏi
            // Nếu user chưa chọn, mặc định gán là null
            const fullAnswers = {};
            questions.forEach(q => {
                // Kiểm tra xem câu hỏi này đã có trong danh sách chọn chưa
                if (selectedAnswers[q._id]) {
                    fullAnswers[q._id] = selectedAnswers[q._id];
                } else {
                    fullAnswers[q._id] = null; // Gửi null nếu chưa làm
                }
            });

            // --- BƯỚC 2: GỬI REQUEST ---
            const res = await instance.post("/questions/submit", {
                testId: testId,
                answers: fullAnswers // Gửi fullAnswers thay vì selectedAnswers
            });

            if (res.data.success) {
                setSubmitResult(res.data.data);
                setViewMode('summary');
                message.success("Nộp bài thành công!");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Lỗi khi nộp bài. Vui lòng thử lại!";
            message.error(errorMessage);
        }
    };

    // --- RENDER ---

    if (!isInitialized || loading || timeLeft === null) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    if (viewMode === 'summary') {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><SummaryCard result={submitResult} onReview={() => setViewMode('review')} onBack={() => navigate('/')} testTitle={testInfo?.title} /></div>;
    }

    const isReviewing = viewMode === 'review';
    const { m, sec } = formatTime(timeLeft);
    const isUrgent = timeLeft < 120 && viewMode === 'doing';
    const finalQuestions = questions.length === 0;
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length;

    const QuestionPalette = ({ isMobile = false }) => (
        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto pb-2 custom-scrollbar' : 'grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar'}`}>
            {questions.map((q, index) => {
                const isSelected = !!selectedAnswers[q._id];
                let btnClass = isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border-slate-200";

                if (submitResult) {
                    // SỬA: Thêm ?. hoặc fallback về mảng rỗng [] để tránh lỗi undefined
                    const details = submitResult.details || [];
                    const detail = details.find(d => d.questionId === q._id);

                    if (detail) {
                        // Đã làm -> Check đúng sai dựa trên kết quả trả về
                        btnClass = detail.isCorrect
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-red-500 text-white border-red-500";
                    } else {
                        // Chưa làm (không tìm thấy trong details) -> Tính là Sai (Màu đỏ)
                        btnClass = "bg-red-500 text-white border-red-500";
                    }
                }

                return (<button key={q._id} onClick={() => scrollToQuestion(q._id)} className={`${isMobile ? 'min-w-[40px] h-10' : 'w-10 h-10'} rounded-lg flex items-center justify-center text-sm font-bold border transition-all flex-shrink-0 ${btnClass}`}>{index + 1}</button>);
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Sticky Header */}
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
                <div className="hidden lg:block w-[300px] shrink-0">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700">Danh sách câu</h3><Tag>{questions.length} câu</Tag></div>
                            <QuestionPalette isMobile={false} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {finalQuestions ? (
                        <Empty description="Đề thi chưa có câu hỏi nào" className="mt-10" />
                    ) : (
                        <div className="space-y-6 md:space-y-8">
                            {questions.map((q, idx) => {
                                const userAnswer = selectedAnswers[q._id];

                                // --- FIX LOGIC 2: Check an toàn khi lấy kết quả ---
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
                                            // Nếu có resultData và đúng -> Xanh. Ngược lại (sai hoặc chưa làm) -> Đỏ
                                            ? (resultData?.isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30')
                                            : 'border-slate-200 hover:shadow-md'
                                        }
                                        `}
                                    >
                                        <div className="flex gap-4 mb-4">
                                            <span className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-colors ${isReviewing ? (resultData?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-blue-100 text-blue-600'}`}>{idx + 1}</span>

                                            {/* Container chứa Text và Image */}
                                            <div className="pt-1 w-full">
                                                <h3 className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed mb-3">
                                                    {q.content}
                                                </h3>

                                                {/* --- HIỂN THỊ ẢNH CÂU HỎI (Mới thêm) --- */}
                                                {q.imageUrl && (
                                                    <div className="w-full my-4 flex justify-center">
                                                        <Image
                                                            src={q.imageUrl}
                                                            alt={`Question ${idx + 1} image`}
                                                            className="rounded-lg border border-slate-100 object-contain"
                                                            style={{ maxHeight: "350px", maxWidth: "100%" }}
                                                            placeholder={
                                                                <div className="flex items-center justify-center h-40 bg-slate-100 text-slate-400 rounded-lg">
                                                                    <Spin />
                                                                </div>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid gap-3 ml-0 md:ml-14">
                                            <div className="text-start text-sm md:text-base font-medium text-slate-600 mb-1">
                                                Chọn đáp án dưới đây
                                            </div>
                                            {q.options.map((opt) => {
                                                const isSelected = userAnswer === opt;
                                                let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                                                let iconRender = null;

                                                if (!isReviewing) {
                                                    if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600";
                                                }
                                                else {
                                                    // --- FIX LOGIC 3: Xử lý hiển thị đáp án khi chưa làm ---
                                                    if (resultData) {
                                                        // Trường hợp ĐÃ LÀM
                                                        const isCorrectAns = opt === resultData.correctAnswer;
                                                        if (isCorrectAns) { containerClass = "border-green-500 bg-green-100 ring-1 ring-green-500"; iconRender = <CheckCircleOutlined className="text-green-600 text-xl ml-auto" />; }
                                                        else if (isSelected && !resultData.isCorrect) { containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400 opacity-80"; iconRender = <CloseCircleOutlined className="text-red-500 text-xl ml-auto" />; }
                                                        else { containerClass = "border-slate-100 opacity-50"; }
                                                    } else {
                                                        // Trường hợp CHƯA LÀM (resultData undefined)
                                                        containerClass = "border-slate-100 opacity-50";
                                                    }
                                                }

                                                return (<div key={opt} onClick={() => handleSelect(q._id, opt)} className={`relative flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${containerClass}`}>
                                                    {!isReviewing && (<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>{isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}</div>)}
                                                    <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                                                    {iconRender}
                                                </div>);
                                            })}
                                        </div>

                                        {/* Hiển thị lời giải */}
                                        {isReviewing && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 ml-0 md:ml-14 p-4 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 text-sm md:text-base">
                                                <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                                    {/* Nếu chưa làm -> Hiện icon Warning */}
                                                    {!resultData ? <WarningOutlined className="text-red-500"/> : <FlagOutlined />}
                                                    {resultData ? "Giải thích chi tiết:" : <span className="text-red-600">Bạn chưa chọn đáp án cho câu hỏi này!</span>}
                                                </div>

                                                <div className="leading-relaxed">
                                                    {resultData?.solution
                                                        ? resultData.solution
                                                        : (
                                                            resultData
                                                                ? <span className="italic text-slate-500">Không có lời giải chi tiết. Đáp án đúng: <strong>{resultData.correctAnswer}</strong></span>
                                                                : <span className="italic text-slate-400">Hệ thống không hiển thị đáp án cho câu hỏi chưa làm.</span>
                                                        )
                                                    }
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

            {/* --- MODAL XỬ LÝ NỘP BÀI --- */}
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
                        <div><p className="mb-2">Bạn vẫn còn <strong className="text-red-600 text-lg">{unansweredCount}</strong> câu hỏi chưa chọn đáp án.</p><p className="text-slate-500 text-sm">Vui lòng hoàn thành tất cả các câu hỏi trước khi nộp bài.</p></div>
                    ) : (
                        <p>Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài và kết thúc phiên làm việc này không?</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}