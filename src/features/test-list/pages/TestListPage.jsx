// src/features/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import instance from "../../../shared/lib/axios.config";
import { message, Card, Button, Tag, Skeleton, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import {
    PlusOutlined,
    ClockCircleOutlined,
    ReadOutlined,
    FileTextOutlined,
    ArrowRightOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

export default function TestListPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("authToken");
                const res = await instance.get("/testList", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.success) {
                    setTests(res.data.data);
                } else {
                    message.error(res.data.message || "Không tải được dữ liệu");
                }
            } catch (err) {
                message.error("Lỗi server, thử lại!");
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const handleClickTest = (testId) => {
        navigate(`/test/${testId}`);
    };

    const handleAddTest = () => {
        // Logic của bạn
        message.info("Chức năng thêm bài kiểm tra đang phát triển");
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    // Màu sắc cho grade (ví dụ)
    const getGradeColor = (grade) => {
        if (!grade) return "blue";
        if (grade.toString().includes("12")) return "purple";
        if (grade.toString().includes("10")) return "cyan";
        return "blue";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <AppstoreOutlined className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                Kho đề thi
                            </h1>
                            <p className="text-slate-500">Quản lý và tổ chức các bài kiểm tra</p>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleAddTest}
                        className="bg-blue-600 hover:bg-blue-700 border-none h-12 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center"
                    >
                        Tạo đề thi mới
                    </Button>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="rounded-2xl border-none shadow-sm h-48">
                                <Skeleton active avatar paragraph={{ rows: 3 }} />
                            </Card>
                        ))}
                    </div>
                ) : tests.length === 0 ? (
                    <div className="flex justify-center items-center h-96 bg-white/50 rounded-3xl backdrop-blur-sm">
                        <Empty description="Chưa có bài kiểm tra nào" />
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {tests.map((test) => (
                            <motion.div key={test._id} variants={itemVariants}>
                                <Card
                                    hoverable
                                    className="h-full rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                                    onClick={() => handleClickTest(test._id)}
                                    bodyStyle={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}
                                >
                                    {/* Decorative Header Line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Card Header Info */}
                                    <div className="flex justify-between items-start mb-4">
                                        <Tag
                                            color={getGradeColor(test.gradeLevel)}
                                            className="px-3 py-1 rounded-full text-sm font-semibold border-none bg-opacity-10 m-0 flex items-center gap-1"
                                        >
                                            <ReadOutlined /> {test.gradeLevel ? `Khối ${test.gradeLevel}` : "Đại trà"}
                                        </Tag>
                                        {/* Placeholder for status or menu dots if needed */}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {test.title}
                                    </h3>

                                    {/* Description */}
                                    <div className="flex-grow">
                                        <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                                            {test.description || "Chưa có mô tả cho bài kiểm tra này."}
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-slate-100 my-4" />

                                    {/* Footer Meta Data */}
                                    <div className="flex items-center justify-between text-slate-400 text-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5" title="Thời gian làm bài">
                                                <ClockCircleOutlined className="text-blue-500" />
                                                <span className="font-medium text-slate-600">{test.duration || 0}'</span>
                                            </div>
                                            {/* Ví dụ thêm thông tin số câu hỏi nếu có trong data, ở đây mình giả định */}
                                            <div className="flex items-center gap-1.5" title="Chi tiết">
                                                <FileTextOutlined className="text-indigo-500" />
                                                <span className="font-medium text-slate-600">Chi tiết</span>
                                            </div>
                                        </div>

                                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-blue-600">
                                            <ArrowRightOutlined />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}