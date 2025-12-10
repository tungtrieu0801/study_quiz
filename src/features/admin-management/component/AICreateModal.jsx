import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Radio, message, Tag, Card, Form, InputNumber, Select, Progress, Row, Col } from "antd";
import {
    ThunderboltFilled,
    CheckCircleFilled,
    RobotOutlined,
    BulbFilled,
    LoadingOutlined,
    EditOutlined,
    SaveOutlined,
    AppstoreAddOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
// Đảm bảo đường dẫn import axios config đúng với dự án của bạn
import instance from "../../../shared/lib/axios.config";

// --- API SERVICE (AI) ---
const generateQuestionsAPI = async (prompt, count) => {
    try {
        const response = await instance.post("ai/generate", {
            prompt,
            count
        });
        // const response = await fetch('http://localhost:5000/api/ai/generate', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ prompt, count }),
        // });
        const data = await response.data;
        if (!data.success && !data.data) throw new Error(data.message || "Lỗi AI");
        return data.data;
    } catch (error) {
        console.error("AI Error:", error);
        throw error;
    }
};

// --- LOADING SCREEN ---
const LoadingScreen = () => {
    const loadingTexts = [
        "INITIALIZING NEURAL LINK...",
        "ANALYZING PROMPT DATA...",
        "GENERATING LOGIC PATTERNS...",
        "OPTIMIZING ANSWERS...",
        "FINALIZING DATA PACKETS..."
    ];
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % loadingTexts.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-[350px] w-full">
            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
                <motion.div
                    className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-4 border-4 border-t-transparent border-r-cyan-400 border-b-transparent border-l-pink-500 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <RobotOutlined className="text-5xl text-indigo-600 animate-pulse" />
                </div>
            </div>
            <div className="h-8">
                <motion.div
                    key={textIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-bold font-mono text-slate-600 tracking-widest text-center"
                >
                    {loadingTexts[textIndex]}
                </motion.div>
            </div>
            <div className="w-64 h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                />
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function AICreateModal({ open, onCancel }) {
    // --- STATE ---
    // step: 'input' -> 'loading' -> 'result' -> 'config' (nhập tên đề) -> 'saving' (gọi api)
    const [step, setStep] = useState('input');
    const [prompt, setPrompt] = useState("");
    const [count, setCount] = useState(10);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Config Save
    const [formConfig] = Form.useForm();
    const [saveProgress, setSaveProgress] = useState(0);
    const [saveStatusText, setSaveStatusText] = useState("");

    // Edit Question
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingQIndex, setEditingQIndex] = useState(null);
    const [formEdit] = Form.useForm();

    // Reset khi đóng modal
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep('input');
                setPrompt("");
                setQuestions([]);
                setSaveProgress(0);
                formConfig.resetFields();
            }, 300);
        }
    }, [open]);

    // 1. GỌI AI
    const handleGenerate = async () => {
        if (!prompt.trim()) return message.warning("Vui lòng nhập mô tả!");
        setStep('loading');
        setLoading(true);
        try {
            const data = await generateQuestionsAPI(prompt, count);
            setQuestions(data);
            setStep('result');
            message.success("AI đã sinh đề thi thành công!");
        } catch (error) {
            message.error("Kết nối thất bại!");
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    // 2. CHUẨN BỊ SỬA CÂU HỎI
    const openEditModal = (index, questionData) => {
        setEditingQIndex(index);
        formEdit.setFieldsValue({
            content: questionData.content,
            options: questionData.options, // array ["A", "B"...]
            answer: questionData.answer,
            solution: questionData.solution
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const values = await formEdit.validateFields();
            const newQuestions = [...questions];
            newQuestions[editingQIndex] = { ...newQuestions[editingQIndex], ...values };
            setQuestions(newQuestions);
            setEditModalOpen(false);
            message.success("Đã cập nhật câu hỏi!");
        } catch (e) {
            // Validate fail
        }
    };

    // 3. CHUYỂN SANG BƯỚC NHẬP THÔNG TIN ĐỀ
    const handleProceedToSave = () => {
        setStep('config');
    };

    // 4. THỰC HIỆN LƯU VÀO DATABASE (API CHAIN)
    const handleConfirmSave = async () => {
        try {
            const configValues = await formConfig.validateFields();
            setStep('saving');
            setLoading(true);
            setSaveProgress(5);
            setSaveStatusText("Đang khởi tạo đề thi...");

            // BƯỚC 1: TẠO TEST (ĐỀ THI)
            const testPayload = {
                title: configValues.title,
                duration: configValues.duration,
                gradeLevel: configValues.gradeLevel,
                description: configValues.description || "Đề thi được tạo tự động bởi AI",
            };

            const testRes = await instance.post('/testList', testPayload);
            if(!testRes.data.success) throw new Error("Không thể tạo đề thi");

            const testId = testRes.data.data._id; // Lấy ID đề thi vừa tạo
            setSaveProgress(20);
            setSaveStatusText("Đang lưu câu hỏi...");

            // BƯỚC 2: TẠO TỪNG CÂU HỎI VÀ GẮN VÀO TEST
            const totalQ = questions.length;
            let successCount = 0;

            for (let i = 0; i < totalQ; i++) {
                const q = questions[i];
                const formData = new FormData();

                formData.append('content', q.content);
                formData.append('gradeLevel', configValues.gradeLevel);
                formData.append('answer', q.answer);
                formData.append('solution', q.solution || "Không có giải thích");
                formData.append('type', "SINGLE_CHOICE");

                // Gắn options
                if (Array.isArray(q.options)) {
                    q.options.forEach(opt => formData.append('options', opt));
                }

                // Gắn testId (Quan trọng: để câu hỏi thuộc về đề thi này)
                formData.append('testIds', testId);

                // Gọi API tạo câu hỏi
                await instance.post('/questions', formData);

                successCount++;
                const percent = 20 + Math.floor((successCount / totalQ) * 80);
                setSaveProgress(percent);
                setSaveStatusText(`Đã lưu ${successCount}/${totalQ} câu hỏi...`);
            }

            setSaveProgress(100);
            setSaveStatusText("Hoàn tất!");
            await new Promise(r => setTimeout(r, 800)); // Delay tí cho đẹp

            message.success("Đã lưu bộ đề và câu hỏi thành công!");
            onCancel(); // Đóng modal chính

        } catch (error) {
            console.error(error);
            message.error("Lỗi khi lưu dữ liệu: " + (error.message || "Unknown Error"));
            setStep('result'); // Quay lại bước check nếu lỗi
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onCancel={!loading ? onCancel : null}
                footer={null}
                width={900}
                centered
                maskClosable={!loading}
                closeIcon={loading ? null : undefined}
                styles={{ body: { padding: 0, borderRadius: '1.5rem', overflow: 'hidden' } }}
                className="ai-modal-container"
            >
                <div className="bg-[#F8FAFC] min-h-[600px] flex flex-col">
                    {/* HEADER */}
                    <div className="bg-slate-900 px-8 py-5 flex items-center justify-between shadow-xl z-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-800 opacity-20"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                                <ThunderboltFilled className="text-yellow-400 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg m-0 leading-none">AI GENERATOR</h3>
                                <span className="text-xs text-indigo-300 font-mono tracking-wider">POWERED BY LLM</span>
                            </div>
                        </div>
                        {step === 'result' && (
                            <Tag color="#10b981" className="relative z-10 border-0 px-3 py-1 font-bold">
                                GENERATED: {questions.length} Qs
                            </Tag>
                        )}
                    </div>

                    {/* BODY */}
                    <div className="flex-1 p-8 relative overflow-hidden flex flex-col">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: INPUT */}
                            {step === 'input' && (
                                <motion.div
                                    key="input"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex-1">
                                        <div className="mb-6">
                                            <label className="text-slate-700 font-bold mb-3 block text-sm uppercase tracking-wide">
                                                1. Mô tả nội dung đề thi
                                            </label>
                                            <Input.TextArea
                                                rows={6}
                                                className="rounded-2xl border-slate-200 bg-white text-base p-4 shadow-sm focus:border-indigo-600 focus:shadow-indigo-100 transition-all"
                                                placeholder="Ví dụ: Tạo đề thi toán học cho lớp 1 với mức độ Vận dụng cao..."
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-8">
                                            <label className="text-slate-700 font-bold mb-3 block text-sm uppercase tracking-wide">
                                                2. Số lượng câu hỏi
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[10, 15, 20].map(val => (
                                                    <div
                                                        key={val}
                                                        onClick={() => setCount(val)}
                                                        className={`cursor-pointer h-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${
                                                            count === val
                                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                                                                : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'
                                                        }`}
                                                    >
                                                        {val} Câu
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleGenerate}
                                        className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-200 border-none font-bold text-lg tracking-wider"
                                    >
                                        <ThunderboltFilled /> KÍCH HOẠT AI
                                    </Button>
                                </motion.div>
                            )}

                            {/* STEP 2: LOADING */}
                            {step === 'loading' && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex items-center justify-center"
                                >
                                    <LoadingScreen />
                                </motion.div>
                            )}

                            {/* STEP 3: RESULT & REVIEW */}
                            {step === 'result' && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 max-h-[420px] custom-scroll pb-4">
                                        {questions.map((q, idx) => (
                                            <Card
                                                key={idx}
                                                className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden group"
                                                styles={{ body: { padding: '16px' } }}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                                            {idx + 1}
                                                        </span>
                                                        <p className="font-semibold text-slate-800 text-base m-0">{q.content}</p>
                                                    </div>
                                                    <Button
                                                        icon={<EditOutlined />}
                                                        size="small"
                                                        onClick={() => openEditModal(idx, q)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 border-indigo-200 bg-indigo-50"
                                                    >
                                                        Sửa
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pl-9 mb-3">
                                                    {q.options.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className={`px-3 py-2 rounded-lg text-sm border ${
                                                                opt === q.answer
                                                                    ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                                                                    : 'bg-white border-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="ml-9 bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex gap-2 text-sm text-yellow-800">
                                                    <BulbFilled className="mt-0.5 text-yellow-600" />
                                                    <span>{q.solution}</span>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                                        <Button
                                            size="large"
                                            onClick={() => setStep('input')}
                                            className="h-12 rounded-xl border-slate-300 text-slate-600 font-semibold"
                                        >
                                            Tạo Lại
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={handleProceedToSave}
                                            className="h-12 rounded-xl bg-slate-900 hover:bg-black font-bold shadow-lg flex items-center justify-center gap-2"
                                        >
                                            TIẾP TỤC <CheckCircleFilled />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: CONFIG TEST INFO */}
                            {step === 'config' && (
                                <motion.div
                                    key="config"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="h-full flex flex-col"
                                >
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <AppstoreAddOutlined className="text-indigo-600"/> Cấu hình Đề thi
                                    </h3>

                                    <div className="flex-1">
                                        <Form form={formConfig} layout="vertical" size="large">
                                            <Form.Item
                                                label="Tên bài kiểm tra"
                                                name="title"
                                                rules={[{ required: true, message: 'Nhập tên bài kiểm tra' }]}
                                            >
                                                <Input className="rounded-xl" placeholder="VD: Kiểm tra Toán 15 phút" />
                                            </Form.Item>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label="Thời gian (phút)"
                                                        name="duration"
                                                        rules={[{ required: true, message: 'Nhập thời gian' }]}
                                                        initialValue={15}
                                                    >
                                                        <InputNumber className="w-full rounded-xl" min={1} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label="Khối lớp"
                                                        name="gradeLevel"
                                                        rules={[{ required: true, message: 'Chọn khối' }]}
                                                        initialValue="1"
                                                    >
                                                        <Select className="rounded-xl">
                                                            {[1, 2, 3, 4, 5].map(g => (
                                                                <Select.Option key={g} value={g.toString()}>Khối {g}</Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item label="Mô tả" name="description">
                                                <Input.TextArea rows={3} className="rounded-xl" placeholder="Mô tả thêm về đề thi..." />
                                            </Form.Item>
                                        </Form>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                                        <Button
                                            size="large"
                                            onClick={() => setStep('result')}
                                            className="h-12 rounded-xl"
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={handleConfirmSave}
                                            className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <SaveOutlined /> XÁC NHẬN LƯU
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 5: SAVING PROGRESS */}
                            {step === 'saving' && (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-64 mb-6">
                                        <Progress type="circle" percent={saveProgress} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} width={120} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">{saveStatusText}</h3>
                                    <p className="text-slate-400">Đang đồng bộ dữ liệu lên máy chủ...</p>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                {/* --- MODAL CON: EDIT CÂU HỎI --- */}
                <Modal
                    title="Chỉnh sửa câu hỏi"
                    open={editModalOpen}
                    onCancel={() => setEditModalOpen(false)}
                    onOk={handleSaveEdit}
                    okText="Cập nhật"
                    cancelText="Hủy"
                    centered
                >
                    <Form form={formEdit} layout="vertical">
                        <Form.Item label="Nội dung" name="content" rules={[{ required: true }]}>
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-2">
                            {['0', '1', '2', '3'].map((idxStr, i) => (
                                <Form.Item key={i} name={['options', i]} rules={[{ required: true }]}>
                                    <Input prefix={<span className="text-gray-400 font-bold w-4">{String.fromCharCode(65+i)}</span>} />
                                </Form.Item>
                            ))}
                        </div>
                        <Form.Item label="Đáp án đúng (Copy y nguyên nội dung option)" name="answer" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Giải thích" name="solution">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Form>
                </Modal>

                <style>{`
                    .custom-scroll::-webkit-scrollbar { width: 6px; }
                    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                    .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}</style>
            </Modal>
        </>
    );
}