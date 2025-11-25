// src/features/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import instance from "../../../shared/lib/axios.config";
import {
    message,
    Card,
    Button,
    Tag,
    Skeleton,
    Empty,
    Modal,
    Form,
    Input,
    Select,
    InputNumber
} from "antd";
import { useNavigate } from "react-router-dom";
import {
    PlusOutlined,
    ClockCircleOutlined,
    ReadOutlined,
    FileTextOutlined,
    ArrowRightOutlined,
    AppstoreOutlined,
    FormOutlined,
    SettingOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth";

export default function TestListPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [form] = Form.useForm();

    // --- 1. LẤY USER TỪ AUTH ---
    const { user, isAdmin } = useAuth(); // Giả sử useAuth trả về isAdmin hoặc check user.role === 'admin'
    const navigate = useNavigate();

    // --- GET DATA ---
    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await instance.get("/testList", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setTests(res.data.data);
            } else {
                message.error(res.data.message || "Không tải được dữ liệu");
            }
        } catch (err) {
            // message.error("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const handleClickTest = (testId) => {
        console.log("--- DEBUG AUTH ---");
        console.log("User Object:", user);
        console.log("User Role:", user?.role);
        // LOGIC CHECK ROLE QUAN TRỌNG Ở ĐÂY
        if (user?.role === 'admin') {
            // Nếu là admin -> Vào trang quản lý đề (TestManagementPage)
            navigate(`/admin/test/${testId}`);
        } else {
            // Nếu là học sinh -> Vào trang thi (TestDetailPage)
            navigate(`/test/${testId}`);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCancelModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // --- API CREATE TEST ---
    const handleCreateTest = async (values) => {
        setCreating(true);
        try {
            const token = localStorage.getItem("authToken");

            const payload = {
                title: values.title,
                description: values.description,
                duration: `${values.duration}p`,
                gradeLevel: values.gradeLevel
            };

            const res = await instance.post("/testList", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                message.success("Tạo bài kiểm tra thành công!");
                setTests([res.data.data, ...tests]);
                handleCancelModal();
            } else {
                message.error(res.data.message || "Tạo thất bại");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tạo bài kiểm tra");
        } finally {
            setCreating(false);
        }
    };

    // --- ANIMATION VARIANTS ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const getGradeColor = (grade) => {
        if (!grade) return "blue";
        if (grade.toString().includes("12")) return "purple";
        if (grade.toString().includes("10")) return "cyan";
        return "blue";
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <AppstoreOutlined className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Kho đề thi</h1>
                            <p className="text-slate-500">
                                {user?.role === 'admin' ? "Quản lý, chỉnh sửa và thêm câu hỏi" : "Chọn bài thi để bắt đầu làm bài"}
                            </p>
                        </div>
                    </div>

                    {/* Chỉ Admin mới thấy nút tạo đề */}
                    {user?.role === 'admin' && (
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleOpenModal}
                            className="bg-blue-600 hover:bg-blue-700 border-none h-12 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center"
                        >
                            Tạo đề thi mới
                        </Button>
                    )}
                </div>

                {/* LIST CONTENT */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="rounded-2xl border-none shadow-sm h-48">
                                <Skeleton active avatar paragraph={{ rows: 3 }} />
                            </Card>
                        ))}
                    </div>
                ) : tests.length === 0 ? (
                    <div className="flex justify-center items-center h-96 bg-white rounded-3xl border border-slate-200">
                        <Empty description="Chưa có bài kiểm tra nào" />
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {tests.map((test) => (
                                <motion.div key={test._id} variants={itemVariants} layout>
                                    <Card
                                        hoverable
                                        className="h-full rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                                        onClick={() => handleClickTest(test._id)}
                                        bodyStyle={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="flex justify-between items-start mb-4">
                                            <Tag
                                                color={getGradeColor(test.gradeLevel)}
                                                className="px-3 py-1 rounded-full text-sm font-semibold border-none bg-slate-100 m-0 flex items-center gap-1"
                                            >
                                                <ReadOutlined /> {test.gradeLevel ? `Khối ${test.gradeLevel}` : "Đại trà"}
                                            </Tag>

                                            {/* Icon chỉ báo Admin */}
                                            {user?.role === 'admin' && (
                                                <div className="text-slate-400 bg-slate-100 p-1.5 rounded-md">
                                                    <SettingOutlined />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {test.title}
                                        </h3>

                                        <div className="flex-grow">
                                            <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                                                {test.description || "Chưa có mô tả cho bài kiểm tra này."}
                                            </p>
                                        </div>

                                        <div className="h-px w-full bg-slate-100 my-4" />

                                        <div className="flex items-center justify-between text-slate-400 text-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5" title="Thời gian làm bài">
                                                    <ClockCircleOutlined className="text-blue-500" />
                                                    <span className="font-medium text-slate-600">{test.duration || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Chi tiết">
                                                    <FileTextOutlined className="text-indigo-500" />
                                                    <span className="font-medium text-slate-600">
                                                        {user?.role === 'admin' ? "Quản lý" : "Vào thi"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-blue-600">
                                                <ArrowRightOutlined />
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* --- MODAL CREATE TEST --- */}
                <Modal
                    title={
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-700 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FormOutlined /></div>
                            Tạo đề thi mới
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={handleCancelModal}
                    footer={null}
                    centered
                    className="p-0 rounded-3xl overflow-hidden"
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleCreateTest}
                        className="mt-4"
                    >
                        <Form.Item
                            label={<span className="font-semibold text-slate-600">Tên bài kiểm tra</span>}
                            name="title"
                            rules={[{ required: true, message: 'Vui lòng nhập tên bài kiểm tra!' }]}
                        >
                            <Input size="large" placeholder="VD: Kiểm tra 15 phút Đại số" className="rounded-xl py-2.5" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                label={<span className="font-semibold text-slate-600">Thời gian (phút)</span>}
                                name="duration"
                                rules={[{ required: true, message: 'Nhập thời gian!' }]}
                            >
                                <InputNumber size="large" placeholder="40" min={1} className="w-full rounded-xl py-1" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-slate-600">Khối lớp</span>}
                                name="gradeLevel"
                                rules={[{ required: true, message: 'Chọn khối lớp!' }]}
                            >
                                <Select size="large" placeholder="Chọn khối" className="rounded-xl">
                                    {[1, 2, 3, 4, 5].map(g => (
                                        <Select.Option key={g} value={g.toString()}>{`Khối ${g}`}</Select.Option>
                                    ))}
                                    {/*<Select.Option value="Khác">Khác</Select.Option>*/}
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item label={<span className="font-semibold text-slate-600">Mô tả chi tiết</span>} name="description">
                            <Input.TextArea rows={4} placeholder="Ghi chú..." className="rounded-xl" />
                        </Form.Item>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button size="large" onClick={handleCancelModal} className="rounded-xl">Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" size="large" loading={creating} className="rounded-xl bg-blue-600">Tạo bài thi</Button>
                        </div>
                    </Form>
                </Modal>

            </div>
        </div>
    );
}