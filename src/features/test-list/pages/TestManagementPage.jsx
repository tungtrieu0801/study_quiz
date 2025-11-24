// src/features/pages/TestManagementPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import {
    Table,
    Button,
    Card,
    Tag,
    Modal,
    message,
    Popconfirm,
    Breadcrumb,
    Typography,
    Empty
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    FileTextOutlined,
    BankOutlined,
    QuestionCircleOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {useAuth} from "../../auth/hooks/useAuth.js";

const { Title, Text } = Typography;

export default function TestManagementPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy user để check lại quyền

    // State
    const [testInfo, setTestInfo] = useState(null);
    const [currentQuestions, setCurrentQuestions] = useState([]); // Câu hỏi ĐANG CÓ trong đề
    const [allQuestions, setAllQuestions] = useState([]);       // Câu hỏi TỪ NGÂN HÀNG (để chọn)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]); // ID các câu được chọn trong Modal

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // --- 1. CHECK ROLE & FETCH DATA ---
    useEffect(() => {
        // Bảo vệ Route: Nếu không phải admin, đá về trang chủ
        if (user && user.role !== "admin") {
            message.warning("Bạn không có quyền truy cập trang này!");
            navigate("/");
            return;
        }
        fetchTestDetails();
    }, [testId, user]);

    // --- API: Lấy chi tiết bài thi + câu hỏi đã có ---
    const fetchTestDetails = async () => {
        setLoading(true);
        try {
            const res = await instance.get(`/testList/${testId}`);
            if (res.data.success) {
                setTestInfo(res.data.data);
                // Giả định backend trả về populated questions trong mảng 'questions'
                // Nếu backend chỉ trả về array ID, bạn cần gọi thêm API getQuestionsByIds
                setCurrentQuestions(res.data.data.questions || []);
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải thông tin bài thi");
        } finally {
            setLoading(false);
        }
    };

    // --- API: Lấy toàn bộ câu hỏi từ ngân hàng ---
    const fetchAllQuestions = async () => {
        try {
            // Sử dụng API get questions mà bạn đã cung cấp ở context QuestionListPage
            const res = await instance.get("/questions");
            if (res.data.success || Array.isArray(res.data.data)) {
                const bankData = res.data.data || [];

                // Lọc: Chỉ hiển thị những câu CHƯA có trong bài thi này
                const existingIds = currentQuestions.map(q => q._id);
                const availableQuestions = bankData.filter(q => !existingIds.includes(q._id));

                setAllQuestions(availableQuestions);
            }
        } catch (err) {
            message.error("Không tải được ngân hàng câu hỏi");
        }
    };

    // --- HANDLER: Mở Modal thêm câu hỏi ---
    const handleOpenAddModal = () => {
        fetchAllQuestions(); // Tải mới nhất từ ngân hàng
        setSelectedQuestionIds([]); // Reset lựa chọn cũ
        setModalVisible(true);
    };

    // --- HANDLER: Lưu câu hỏi vào bài thi ---
    const handleAddQuestionsToTest = async () => {
        if (selectedQuestionIds.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 câu hỏi");
            return;
        }
        setSaving(true);

        try {
            // Logic: Lấy danh sách ID cũ + ID mới
            const currentIds = currentQuestions.map(q => q._id);
            const newQuestionList = [...currentIds, ...selectedQuestionIds];

            // Cập nhật bài thi với danh sách câu hỏi mới
            await instance.put(`/testList/${testId}`, {
                ...testInfo, // Giữ nguyên thông tin khác (title, duration...)
                questions: newQuestionList // Cập nhật mảng ID questions
            });

            message.success(`Đã thêm ${selectedQuestionIds.length} câu hỏi vào đề thi!`);
            setModalVisible(false);
            fetchTestDetails(); // Reload lại bảng câu hỏi hiện tại
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi cập nhật đề thi");
        } finally {
            setSaving(false);
        }
    };

    // --- HANDLER: Xóa câu hỏi khỏi bài thi ---
    const handleRemoveQuestion = async (questionId) => {
        try {
            const newQuestionList = currentQuestions
                .filter(q => q._id !== questionId) // Loại bỏ câu cần xóa
                .map(q => q._id); // Lấy ID

            await instance.put(`/testList/${testId}`, {
                ...testInfo,
                questions: newQuestionList
            });

            message.success("Đã gỡ câu hỏi khỏi đề thi");
            fetchTestDetails(); // Reload data
        } catch (err) {
            message.error("Lỗi khi xóa câu hỏi");
        }
    };

    // --- TABLE CONFIG (Câu hỏi hiện tại) ---
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, index) => <span className="text-slate-500 font-semibold">{index + 1}</span>,
        },
        {
            title: 'Nội dung câu hỏi',
            dataIndex: 'content',
            key: 'content',
            render: (text) => <span className="font-medium text-slate-700 line-clamp-2">{text}</span>
        },
        {
            title: 'Đáp án',
            dataIndex: 'solution',
            key: 'solution',
            width: 150,
            render: (sol) => <Tag color="green">{sol || "N/A"}</Tag>
        },
        {
            title: 'Loại',
            dataIndex: 'gradeLevel',
            key: 'gradeLevel',
            width: 100,
            render: (lv) => <Tag color="blue">{lv ? `Khối ${lv}` : 'Chung'}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Popconfirm
                    title="Gỡ câu hỏi này khỏi đề?"
                    description="Câu hỏi vẫn tồn tại trong ngân hàng câu hỏi."
                    onConfirm={() => handleRemoveQuestion(record._id)}
                    okText="Gỡ bỏ"
                    cancelText="Huỷ"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    // --- MODAL TABLE CONFIG (Chọn câu hỏi) ---
    const modalColumns = [
        { title: 'Nội dung câu hỏi', dataIndex: 'content', key: 'content' },
        {
            title: 'Thẻ',
            dataIndex: 'tags',
            width: 150,
            render: (tags) => (
                <div className="flex flex-wrap gap-1">
                    {tags?.map((t, i) => <Tag key={i} bordered={false}>{t}</Tag>)}
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* HEADER & BREADCRUMB */}
                <div className="mb-8">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        className="mb-4 text-slate-500 hover:bg-slate-200 pl-0"
                        onClick={() => navigate('/')}
                    >
                        Về danh sách đề thi
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3"
                            >
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <FileTextOutlined style={{ fontSize: '24px' }}/>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800 m-0">
                                        {testInfo?.title || <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"/>}
                                    </h1>
                                    <div className="text-slate-500 flex items-center gap-3 text-sm mt-1">
                                        <span><ClockCircleOutlined /> {testInfo?.duration} phút</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>Khối: {testInfo?.gradeLevel}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleOpenAddModal}
                            className="bg-blue-600 shadow-lg shadow-blue-200 rounded-xl"
                        >
                            Thêm câu hỏi từ ngân hàng
                        </Button>
                    </div>
                </div>

                {/* MAIN CONTENT: DANH SÁCH CÂU HỎI HIỆN TẠI */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card
                        className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                        bodyStyle={{ padding: 0 }}
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <QuestionCircleOutlined className="text-blue-500"/>
                                Danh sách câu hỏi
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-sm font-normal ml-2">
                                    Tổng: {currentQuestions.length}
                                </span>
                            </h3>
                        </div>

                        <Table
                            rowKey="_id"
                            columns={columns}
                            dataSource={currentQuestions}
                            loading={loading}
                            pagination={false}
                            locale={{ emptyText: <Empty description="Đề thi này chưa có câu hỏi nào" /> }}
                            rowClassName="hover:bg-slate-50 transition-colors"
                        />
                    </Card>
                </motion.div>

                {/* --- MODAL CHỌN CÂU HỎI --- */}
                <Modal
                    title={
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-700 py-2 border-b border-slate-100 mb-4">
                            <BankOutlined className="text-blue-600"/> Ngân hàng câu hỏi
                        </div>
                    }
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    width={900}
                    centered
                    footer={[
                        <Button key="cancel" onClick={() => setModalVisible(false)} size="large" className="rounded-xl">
                            Hủy bỏ
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleAddQuestionsToTest}
                            loading={saving}
                            icon={<SaveOutlined />}
                            size="large"
                            className="bg-blue-600 rounded-xl shadow-md"
                        >
                            Thêm {selectedQuestionIds.length} câu đã chọn
                        </Button>
                    ]}
                    className="rounded-2xl overflow-hidden pb-0"
                    bodyStyle={{ padding: '0 24px 24px 24px' }}
                >
                    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-sm flex items-center gap-2">
                        <QuestionCircleOutlined />
                        <span>Hệ thống tự động ẩn những câu hỏi đã có trong đề thi này.</span>
                    </div>

                    <Table
                        rowKey="_id"
                        columns={modalColumns}
                        dataSource={allQuestions}
                        pagination={{ pageSize: 5, showSizeChanger: false }}
                        rowSelection={{
                            type: 'checkbox',
                            onChange: (selectedRowKeys) => {
                                setSelectedQuestionIds(selectedRowKeys);
                            }
                        }}
                        scroll={{ y: 350 }}
                        size="middle"
                        bordered
                    />
                </Modal>

            </div>
        </div>
    );
}