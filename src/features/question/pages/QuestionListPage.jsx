import React, { useEffect, useState } from "react";
import { Button, Card, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import instance from "../../../shared/lib/axios.config";

// Import components
import QuestionTable from "../components/QuestionTable";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionDetailDrawer from "../components/QuestionDetailDrawer";
import questionApi from "../api/questionApi.js";
import QuestionTypeModal from "../components/add-question-module/QuestionTypeModal.jsx";

export default function QuestionListPage() {
    // --- Data State ---
    const [questions, setQuestions] = useState([]);
    const [tags, setTags] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Pagination State ---
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // --- UI State ---
    const [modalOpen, setModalOpen] = useState(false); // Form Modal
    const [typeModalOpen, setTypeModalOpen] = useState(false); // Type Select Modal
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewingQuestion, setViewingQuestion] = useState(null);

    // State lưu loại câu hỏi đang thao tác
    const [selectedType, setSelectedType] = useState('SINGLE_CHOICE');

    // --- 1. Fetch Data ---
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [tRes, testRes] = await Promise.all([
                    questionApi.getTags(),
                    questionApi.getTests()
                ]);
                const tagData = tRes.data.data;
                setTags(Array.isArray(tagData) ? tagData : (tagData?.tagList || []));
                setTests(Array.isArray(testRes.data.data) ? testRes.data.data : []);
            } catch (err) {
                console.error("Lỗi tải metadata:", err);
            }
        };

        fetchMetadata();
        fetchQuestions(1, 10);
    }, []);

    const fetchQuestions = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await questionApi.getAll({ page, pageSize });
            if (res.data.success) {
                setQuestions(res.data.data || []);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: res.data.total || 0
                });
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi tải danh sách câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await instance.get("/tag");
            const data = res.data.data;
            setTags(Array.isArray(data) ? data : (data?.tagList || []));
        } catch (e) {}
    };

    // --- Handlers ---
    const handleCreateClick = () => setTypeModalOpen(true);

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setTypeModalOpen(false);
        setEditingQuestion(null);
        setModalOpen(true);
    };

    const handleEdit = (question) => {
        setSelectedType(question.type || 'SINGLE_CHOICE');
        setEditingQuestion(question);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await instance.delete(`/questions/${id}`);
            message.success("Đã xóa câu hỏi");
            fetchQuestions(pagination.current, pagination.pageSize);
        } catch (err) {
            message.error("Xóa thất bại");
        }
    };

    const handleView = (question) => {
        setViewingQuestion(question);
        setDrawerOpen(true);
    };

    const handleTableChange = (newPagination) => {
        fetchQuestions(newPagination.current, newPagination.pageSize);
    };

    // --- LOGIC GỬI FORM (Xử lý Mảng & FormData) ---
    const handleFormSuccess = async (values) => {
        try {
            const formData = new FormData();
            const typeToSend = values.type || selectedType || "SINGLE_CHOICE";

            // 1. Các trường cơ bản
            formData.append('content', values.content);
            formData.append('gradeLevel', values.gradeLevel);
            formData.append('solution', values.solution || "");
            formData.append('type', typeToSend);

            // 2. Xử lý ANSWER (Quan trọng)
            if (['MULTIPLE_SELECT', 'FILL_IN_THE_BLANK'].includes(typeToSend)) {
                // Backend yêu cầu Array -> Phải append nhiều lần
                const answerArr = Array.isArray(values.answer) ? values.answer : [values.answer];
                // Lọc bỏ giá trị rỗng hoặc null
                const cleanAnswers = answerArr.filter(a => a !== null && a !== undefined && a !== "");

                cleanAnswers.forEach(ans => formData.append('answer', ans));

                // Backup nếu mảng rỗng (tránh lỗi backend đòi mảng không rỗng)
                if (cleanAnswers.length === 0) formData.append('answer', " ");
            }
            else if (typeToSend === 'TRUE_FALSE') {
                // Backend cần string "true"/"false"
                formData.append('answer', String(values.answer));
            }
            else {
                // Single Choice, Short Answer...
                formData.append('answer', values.answer);
            }

            // 3. Xử lý OPTIONS
            if (values.options && Array.isArray(values.options)) {
                values.options.forEach(opt => formData.append('options', opt));
            }

            // 4. Xử lý TAGS
            if (values.tags && Array.isArray(values.tags)) {
                values.tags.forEach(tagId => formData.append('tags', tagId));
            }

            // 5. Xử lý FILE
            if (values.imageFile) {
                formData.append('file', values.imageFile);
            }

            // --- GỌI API ---
            if (editingQuestion) {
                await questionApi.update(editingQuestion._id, formData);
                toast.success("Cập nhật thành công");
            } else {
                await questionApi.create(formData);
                toast.success("Tạo mới thành công");
            }

            setModalOpen(false);
            fetchQuestions(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message;
            toast.error(`Lỗi: ${msg}`);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Card className="shadow-sm border border-slate-200 rounded-xl" bordered={false}>
                    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Ngân hàng câu hỏi</h2>
                            <p className="text-slate-500">Quản lý danh sách câu hỏi và đáp án</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input prefix={<SearchOutlined className="text-slate-400"/>} placeholder="Tìm kiếm..." className="w-48 rounded-lg" />
                            <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={handleCreateClick}
                                className="bg-blue-600 rounded-lg shadow-md"
                            >
                                Thêm câu hỏi
                            </Button>
                        </div>
                    </div>

                    <QuestionTable
                        questions={questions}
                        loading={loading}
                        tags={tags}
                        pagination={pagination}
                        onChange={handleTableChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                </Card>
            </div>

            <QuestionTypeModal
                open={typeModalOpen}
                onCancel={() => setTypeModalOpen(false)}
                onSelect={handleTypeSelect}
            />

            <QuestionFormModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onSuccess={handleFormSuccess}
                initialValues={editingQuestion}
                questionType={selectedType}
                tags={tags}
                tests={tests}
                refreshTags={fetchTags}
            />

            <QuestionDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                question={viewingQuestion}
                tags={tags}
                tests={tests}
                onEdit={handleEdit}
            />
        </div>
    );
}