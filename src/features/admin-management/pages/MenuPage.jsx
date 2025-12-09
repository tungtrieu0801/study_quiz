import React, { useState } from "react";
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    message,
    Tooltip
} from "antd";
import {
    UnorderedListOutlined,
    TagsOutlined,
    TeamOutlined,
    RightOutlined,
    PlusCircleOutlined,
    ThunderboltFilled,
    RobotOutlined,
    CrownFilled,
    ExperimentOutlined,
    GithubOutlined,
    MailOutlined,
    InfoCircleFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useTestManagement from "../../../app/hooks/useTestManagement.js";

// IMPORT MODAL AI VỪA TẠO
import AICreateModal from "../component/AICreateModal.jsx";

// CSS Styles
const styles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  }
  .shimmer {
    position: relative;
    overflow: hidden;
  }
  .shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    transform: skewX(-20deg) translateX(-150%);
    animation: shimmer 3s infinite;
  }
  @keyframes shimmer {
    0% { transform: skewX(-20deg) translateX(-150%); }
    20% { transform: skewX(-20deg) translateX(150%); }
    100% { transform: skewX(-20deg) translateX(150%); }
  }
`;

export default function MenuPage() {
    const navigate = useNavigate();

    // State quản lý 2 Modal
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const [form] = Form.useForm();
    const { createTest, creating } = useTestManagement();

    // Xử lý tạo thủ công
    const handleCreateManual = (values) => {
        createTest(values, () => {
            message.success("Tạo bài kiểm tra thành công!");
            setIsManualModalOpen(false);
            form.resetFields();
        });
    };

    // Xử lý điều hướng
    const handleClick = (action) => {
        if (action === 'add-test') {
            setIsManualModalOpen(true);
        } else if (action === 'ai-create') {
            setIsAIModalOpen(true);
        } else if (action === 'author-and-support') {
            navigate('/author-and-support');
        } else {
            navigate(`/${action}`);
        }
    };

    const modules = [
        { title: "KHO ĐỀ THI", subtitle: "Lưu trữ & Thống kê", icon: <ExperimentOutlined />, action: "tests", color: "text-blue-600", bg: "bg-blue-50" },
        { title: "NGÂN HÀNG CÂU HỎI", subtitle: "Soạn thảo gốc", icon: <UnorderedListOutlined />, action: "questions", color: "text-indigo-600", bg: "bg-indigo-50" },
        { title: "TAGS & CHỦ ĐỀ", subtitle: "Hệ thống phân loại", icon: <TagsOutlined />, action: "tags", color: "text-rose-600", bg: "bg-rose-50" },
        { title: "HỌC VIÊN", subtitle: "Dữ liệu & Kết quả", icon: <TeamOutlined />, action: "students", color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "TẠO THỦ CÔNG", subtitle: "Soạn đề truyền thống", icon: <PlusCircleOutlined />, action: "add-test", color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 p-6 md:p-10 flex flex-col items-center">
            <style>{styles}</style>

            <div className="w-full max-w-7xl">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Chào mừng quay trở lại, Administrator.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-slate-600">System Stable</span>
                    </div>
                </div>

                {/* --- ROW 1: HERO SECTION (AI & AUTHOR) --- */}
                <div className="grid grid-cols-12 gap-6 mb-8 h-auto md:h-[200px]">

                    {/* 1. AI MODULE (Span 8/12) */}
                    <motion.div
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleClick("ai-create")}
                        className="col-span-12 lg:col-span-8 relative rounded-3xl overflow-hidden cursor-pointer group shadow-xl shadow-indigo-200/50 border border-indigo-100 shimmer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca]"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-[-50%] right-[-10%] w-80 h-80 bg-purple-500 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="absolute bottom-[-50%] left-[-10%] w-80 h-80 bg-blue-500 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                        <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-8 md:p-10">
                            <div className="flex items-center gap-6 md:gap-8">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    <RobotOutlined className="text-5xl text-indigo-100" />
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold text-white uppercase tracking-wider mb-2 shadow-sm">
                                        <ThunderboltFilled /> Recommended
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-1 leading-tight">
                                        Tạo Đề Thi Với AI
                                    </h2>
                                    <p className="text-indigo-200 text-sm font-medium">
                                        Tự động sinh câu hỏi & đáp án chính xác trong 30s.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0">
                                <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg group-hover:bg-indigo-50 transition-colors">
                                    <RightOutlined className="text-lg" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. AUTHOR MODULE (Span 4/12) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleClick("author-and-support")}
                        className="col-span-12 lg:col-span-4 glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between hover-lift relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-rose-50"></div>

                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    <InfoCircleFilled /> Information
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                                    Tác Giả & Hỗ Trợ
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <CrownFilled className="text-lg"/>
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                            Liên hệ kỹ thuật, báo cáo lỗi và cập nhật phiên bản mới nhất.
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                            <Tooltip title="Github"><div className="rounded-xl bg-slate-100 text-slate-600 group-hover:bg-black group-hover:text-white transition-all h-10 w-10 flex items-center justify-center"><GithubOutlined /></div></Tooltip>
                            <Tooltip title="Email"><div className="rounded-xl bg-slate-100 text-slate-600 group-hover:bg-rose-500 group-hover:text-white transition-all h-10 w-10 flex items-center justify-center"><MailOutlined /></div></Tooltip>
                            <div className="ml-auto text-sm font-semibold text-slate-600 group-hover:text-rose-600 flex items-center gap-1 transition-colors">
                                Xem CV <RightOutlined className="text-xs group-hover:translate-x-1 transition-transform"/>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- ROW 2: FEATURE GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {modules.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleClick(item.action)}
                            className="glass-card rounded-2xl p-6 hover-lift cursor-pointer group flex flex-col items-start justify-between min-h-[160px]"
                        >
                            <div className="w-full flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <RightOutlined className="text-slate-300 text-xs group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">
                                    {item.subtitle}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* MODAL 1: TẠO THỦ CÔNG */}
            <Modal
                open={isManualModalOpen}
                onCancel={() => setIsManualModalOpen(false)}
                footer={null}
                centered
                width={500}
                closeIcon={null}
                maskClosable={false}
                className="bg-transparent"
            >
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-0">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Thiết Lập Đề Thi (Thủ Công)</h3>
                        <button onClick={() => setIsManualModalOpen(false)} className="w-8 h-8 rounded-full bg-transparent hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-all">✕</button>
                    </div>
                    <div className="p-6">
                        <Form form={form} layout="vertical" onFinish={handleCreateManual}>
                            <Form.Item label={<span className="text-slate-600 font-medium text-xs uppercase">Tên bài kiểm tra</span>} name="title" rules={[{ required: true }]}>
                                <Input size="large" className="rounded-xl border-slate-200" placeholder="Ví dụ: Kiểm tra 15 phút..." />
                            </Form.Item>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item label={<span className="text-slate-600 font-medium text-xs uppercase">Thời gian (phút)</span>} name="duration" rules={[{ required: true }]}>
                                    <InputNumber size="large" className="w-full rounded-xl border-slate-200" min={1} />
                                </Form.Item>
                                <Form.Item label={<span className="text-slate-600 font-medium text-xs uppercase">Khối lớp</span>} name="gradeLevel" rules={[{ required: true }]}>
                                    <Select size="large" className="rounded-xl" placeholder="Chọn khối">
                                        {[10,11,12].map(g => <Select.Option key={g} value={g.toString()}>Khối {g}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                            <Form.Item label={<span className="text-slate-600 font-medium text-xs uppercase">Ghi chú</span>} name="description">
                                <Input.TextArea rows={3} className="rounded-xl border-slate-200" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={creating} size="large" className="w-full h-11 rounded-xl bg-slate-900 hover:bg-indigo-600 shadow-lg font-semibold mt-2">
                                Tạo Đề Thi
                            </Button>
                        </Form>
                    </div>
                </div>
            </Modal>

            {/* MODAL 2: TẠO VỚI AI (Imported Component) */}
            <AICreateModal
                open={isAIModalOpen}
                onCancel={() => setIsAIModalOpen(false)}
            />
        </div>
    );
}