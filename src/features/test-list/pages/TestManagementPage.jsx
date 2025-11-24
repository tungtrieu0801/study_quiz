// src/features/pages/TestManagementPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn
import instance from "../../../shared/lib/axios.config";
import {
    Table,
    Button,
    Card,
    Tag,
    Modal,
    message,
    Popconfirm,
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
    QuestionCircleOutlined,
    ClockCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
// Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn
import useAuth from "../../../app/hooks/useAuth.js";

const { Title } = Typography;

export default function TestManagementPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

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
        // Kiểm tra quyền truy cập
        if (user && user.role?.toLowerCase() !== "admin") {
            message.warning("Bạn không có quyền truy cập trang này!");
            navigate("/");
            return;
        }
        fetchData();
    }, [testId, user]);

    // --- API: LOAD DATA AN TOÀN ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Lấy danh sách câu hỏi (Quan trọng nhất)
            // Đảm bảo backend có endpoint: GET /questions?testId=...
            const questionsRes = await instance.get(`/questions?testId=${testId}`);
            if (questionsRes.data.success) {
                setCurrentQuestions(questionsRes.data.data || []);
            }

            // 2. Lấy thông tin chi tiết đề thi
            // Sử dụng try-catch lồng để không chặn luồng nếu API này lỗi 404
            try {
                const testRes = await instance.get(`/testList/${testId}`);
                if (testRes.data.success) {
                    setTestInfo(testRes.data.data);
                }
            } catch (error) {
                console.warn("API chi tiết đề thi lỗi hoặc chưa tồn tại:", error.message);
                // Nếu chưa có info, set giá trị mặc định để UI không bị vỡ
                if (!testInfo) {
                    setTestInfo({ title: `Đề thi #${testId.slice(-6)}`, duration: 0, gradeLevel: "N/A" });
                }
            }

        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải dữ liệu câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    // --- API: Lấy toàn bộ câu hỏi từ ngân hàng ---
    const fetchAllQuestions = async () => {
        try {
            const res = await instance.get("/questions");
            if (res.data.success || Array.isArray(res.data.data)) {
                const bankData = res.data.data || [];

                // Lọc bỏ những câu hỏi ĐÃ CÓ trong đề thi hiện tại
                const existingIds = currentQuestions.map(q => q._id);
                const availableQuestions = bankData.filter(q => !existingIds.includes(q._id));

                setAllQuestions(availableQuestions);
            }
        } catch (err) {
            message.error("Không tải được ngân hàng câu hỏi");
        }
    };

    // --- HANDLER: Mở Modal ---
    const handleOpenAddModal = () => {
        fetchAllQuestions();
        setSelectedQuestionIds([]);
        setModalVisible(true);
    };

    // --- HANDLER: Thêm câu hỏi vào đề (Update field testIds của câu hỏi) ---
    const handleAddQuestionsToTest = async () => {
        if (selectedQuestionIds.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 câu hỏi");
            return;
        }
        setSaving(true);

        try {
            // Duyệt qua từng ID câu hỏi được chọn để update
            const updatePromises = selectedQuestionIds.map(async (questionId) => {
                const originalQuestion = allQuestions.find(q => q._id === questionId);
                if (!originalQuestion) return null;

                const currentTestIds = originalQuestion.testIds || [];
                // Thêm testId hiện tại vào mảng testIds (nếu chưa có)
                const newTestIds = [...new Set([...currentTestIds, testId])];

                // Gọi API update câu hỏi
                return instance.put(`/questions/${questionId}`, {
                    testIds: newTestIds
                });
            });

            await Promise.all(updatePromises);

            message.success(`Đã thêm ${selectedQuestionIds.length} câu hỏi vào đề thi!`);
            setModalVisible(false);
            fetchData(); // Reload lại danh sách câu hỏi
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi thêm câu hỏi");
        } finally {
            setSaving(false);
        }
    };

    // --- HANDLER: Gỡ câu hỏi khỏi đề ---
    const handleRemoveQuestion = async (questionId) => {
        try {
            const questionToRemove = currentQuestions.find(q => q._id === questionId);
            if (!questionToRemove) return;

            const currentTestIds = questionToRemove.testIds || [];
            // Loại bỏ testId hiện tại khỏi mảng testIds
            const newTestIds = currentTestIds.filter(id => id !== testId);

            await instance.put(`/questions/${questionId}`, {
                testIds: newTestIds
            });

            message.success("Đã gỡ câu hỏi khỏi đề thi");

            // Cập nhật State trực tiếp để UI phản hồi ngay lập tức
            setCurrentQuestions(prev => prev.filter(q => q._id !== questionId));

        } catch (err) {
            console.error(err);
            message.error("Lỗi khi gỡ câu hỏi");
        }
    };

    // --- Cấu hình bảng ---
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
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
            width: 200,
            render: (sol) => <Tag color="green">{sol || "Chưa có lời giải"}</Tag>
        },
        {
            title: 'Loại',
            dataIndex: 'gradeLevel',
            key: 'gradeLevel',
            width: 120,
            align: 'center',
            render: (lv) => <Tag color="blue">{lv ? `Khối ${lv}` : 'Chung'}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title="Gỡ câu hỏi này?"
                    description="Câu hỏi sẽ bị xóa khỏi đề thi này nhưng vẫn còn trong ngân hàng."
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

    const modalColumns = [
        { title: 'Nội dung câu hỏi', dataIndex: 'content', key: 'content' },
        {
            title: 'Thẻ',
            dataIndex: 'tags',
            width: 150,
            render: (tags) => (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(tags) && tags.map((t, i) => (
                        <Tag key={i} bordered={false}>{typeof t === 'object' ? t.name : t}</Tag>
                    ))}
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header & Breadcrumb */}
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
                                        {testInfo?.title || "Quản lý câu hỏi"}
                                    </h1>
                                    {testInfo && (
                                        <div className="text-slate-500 flex items-center gap-3 text-sm mt-1">
                                            <span><ClockCircleOutlined /> {testInfo.duration ? `${testInfo.duration} phút` : '0 phút'}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>Khối: {testInfo.gradeLevel || 'N/A'}</span>
                                        </div>
                                    )}
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

                {/* Main Content: Danh sách câu hỏi */}
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
                                Danh sách câu hỏi trong đề
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-sm font-bold ml-2">
                                    {currentQuestions.length}
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

                {/* Modal Chọn câu hỏi */}
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
                        <span>Hệ thống tự động ẩn những câu hỏi đã có trong đề thi này để tránh trùng lặp.</span>
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