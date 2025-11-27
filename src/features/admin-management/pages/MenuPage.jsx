import React, {useState} from "react";
import {Button, Card, Form, Input, InputNumber, Modal, Select, message} from "antd";
import {
    PlusCircleOutlined,
    UnorderedListOutlined,
    TagsOutlined,
    TeamOutlined,
    RightOutlined,
} from "@ant-design/icons";
import {motion} from "framer-motion";
import {useNavigate} from "react-router-dom";
import useTestManagement from "../../../app/hooks/useTestManagement.js";

export default function MenuPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const {createTest, creating} = useTestManagement();
    const handleCancelModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };
    // Thêm màu sắc và mô tả để giao diện sinh động hơn
    const items = [
        {
            label: "Danh sách bài kiểm tra",
            desc: "Quản lý kho đề thi",
            icon: <UnorderedListOutlined/>,
            action: "tests",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Danh sách câu hỏi",
            desc: "Ngân hàng câu hỏi",
            icon: <UnorderedListOutlined/>,
            action: "question-list",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
        {
            label: "Danh sách thẻ tag",
            desc: "Phân loại chủ đề",
            icon: <TagsOutlined/>,
            action: "tag-list",
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            label: "Danh sách học sinh",
            desc: "Thông tin học viên",
            icon: <TeamOutlined/>,
            action: "student-list",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Thêm bài kiểm tra",
            desc: "Tạo đề thi mới",
            icon: <PlusCircleOutlined/>,
            action: "add-test",
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            label: "Thêm câu hỏi",
            desc: "Soạn thảo câu hỏi",
            icon: <PlusCircleOutlined/>,
            action: "add-question",
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
    ];

    const handleClick = (action) => {
        switch (action) {
            case "tests":
                navigate("/tests");
                break;
            case "student-list":
                navigate("/students");
                break;
            case "tag-list":
                navigate("/tags");
                break; // Đã sửa lỗi thiếu break
            case "question-list":
                navigate("/questions");
                break; // Đã sửa lỗi thiếu break
            case "add-test": // Giả sử bạn có route này
                setIsModalOpen(true);
                break;
            case "add-question": // Giả sử bạn có route này
                navigate("/add-question");
                break;
            default:
                console.log("Action not found:", action);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 30},
        visible: {opacity: 1, y: 0, transition: {type: "spring", stiffness: 50}},
    };

    const handleCreateTest = (values) => {
        createTest(values, () => {
            message.success("Tạo bài kiểm tra thành công!");
            handleCancelModal();
        })
    }


    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-6 md:p-12 font-sans flex mt-5 justify-center">
            <div className="max-w-7xl w-full">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.5}}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
                            Menu Quản Lý
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Hệ thống quản trị nội dung và đào tạo
                        </p>
                    </motion.div>
                </div>

                {/* Grid Section */}
                <motion.div
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {items.map((item) => (
                        <motion.div
                            key={item.label}
                            variants={itemVariants}
                            whileHover={{y: -5}}
                            whileTap={{scale: 0.98}}
                        >
                            <Card
                                bordered={false}
                                className="h-full rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group bg-white/80 backdrop-blur-md border border-white/50"
                                bodyStyle={{padding: "24px"}}
                                onClick={() => handleClick(item.action)}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    {/* Icon Box */}
                                    <div
                                        className={`p-4 rounded-2xl ${item.bg} ${item.color} text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        {item.icon}
                                    </div>

                                    {/* Arrow Icon appearing on hover */}
                                    <div
                                        className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-slate-400">
                                        <RightOutlined/>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                        {item.label}
                                    </h3>
                                    <p className="text-slate-400 mt-2 text-sm font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <Modal title="Tạo đề thi mới" open={isModalOpen} onCancel={handleCancelModal} footer={null} centered
                       width={600}>
                    <Form form={form} layout="vertical" onFinish={handleCreateTest} className="mt-4">
                        <Form.Item label="Tên bài kiểm tra" name="title" rules={[{required: true}]}><Input size="large"
                                                                                                           className="rounded-xl"/></Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Thời gian (phút)" name="duration" rules={[{required: true}]}><InputNumber
                                size="large" className="w-full rounded-xl"/></Form.Item>
                            <Form.Item label="Khối lớp" name="gradeLevel" rules={[{required: true}]}><Select
                                size="large" className="rounded-xl">{[1, 2, 3, 4, 5].map(g => <Select.Option key={g}
                                                                                                             value={g.toString()}>Khối {g}</Select.Option>)}</Select></Form.Item>
                        </div>
                        <Form.Item label="Mô tả" name="description"><Input.TextArea rows={4}
                                                                                    className="rounded-xl"/></Form.Item>
                        <div className="flex justify-end gap-3 pt-4"><Button
                            onClick={handleCancelModal}>Hủy</Button><Button type="primary" htmlType="submit"
                                                                            loading={creating}>Tạo</Button></div>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}