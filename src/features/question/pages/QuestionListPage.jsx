import React, { useEffect, useState } from "react";
import { Button, Card, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import instance from "../../../shared/lib/axios.config"; // Đảm bảo đường dẫn đúng

// Import components
import QuestionTable from "../components/QuestionTable";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionDetailDrawer from "../components/QuestionDetailDrawer";
import questionApi from "../api/questionApi.js";
import {toast} from "react-toastify";
import useAuth from "../../../app/hooks/useAuth.js";

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
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewingQuestion, setViewingQuestion] = useState(null);

    // --- 1. Fetch Metadata (Tags, Tests) ---
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [tRes, testRes] = await Promise.all([
                    questionApi.getTags(),
                    questionApi.getTests()
                ]);

                // Xử lý Tags
                const tagData = tRes.data.data;
                setTags(Array.isArray(tagData) ? tagData : (tagData?.tagList || []));

                // Xử lý Tests
                setTests(Array.isArray(testRes.data.data) ? testRes.data.data : []);
            } catch (err) {
                console.error("Lỗi tải metadata:", err);
            }
        };

        fetchMetadata();
        fetchQuestions(1, 10);
    }, []);

    // --- 2. Fetch Questions ---
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
    const handleCreate = () => {
        setEditingQuestion(null);
        setModalOpen(true);
    };

    const handleEdit = (question) => {
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

    // --- LOGIC GỬI FORM VỚI FILE UPLOAD ---
    const handleFormSuccess = async (values) => {
        try {
            // Tạo FormData để hỗ trợ upload file
            const formData = new FormData();

            // Append các trường text cơ bản
            formData.append('content', values.content);
            formData.append('gradeLevel', values.gradeLevel);
            formData.append('answer', values.answer);
            formData.append('solution', values.solution);
            formData.append('type', values.type || "SINGLE_CHOICE");

            // Append mảng Options (Lưu ý: tùy backend, thường gửi lặp key hoặc stringify)
            // Cách 1: Gửi lặp key (thường dùng cho multer)
            if (values.options && Array.isArray(values.options)) {
                values.options.forEach(opt => formData.append('options', opt));
            }

            // Append mảng Tags
            if (values.tags && Array.isArray(values.tags)) {
                values.tags.forEach(tagId => formData.append('tags', tagId));
            }

            // Append File ảnh (quan trọng: key "file" phải khớp với upload.single("file") ở server)
            if (values.imageFile) {
                formData.append('file', values.imageFile);
            }

            // Gọi API
            if (editingQuestion) {
                // UPDATE: Lưu ý api update cũng phải hỗ trợ formData nếu muốn sửa ảnh
                await questionApi.update(editingQuestion._id, formData);
                toast.success("Cập nhật câu hỏi thành công");
            } else {
                // CREATE
                await questionApi.create(formData);
                toast.success("Tạo câu hỏi thành công");
            }

            setModalOpen(false);
            fetchQuestions(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error(err);
            message.error("Có lỗi xảy ra: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Card className="shadow-sm border border-slate-200 rounded-xl" bordered={false}>
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Ngân hàng câu hỏi</h2>
                            <p className="text-slate-500">Quản lý danh sách câu hỏi và đáp án</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input prefix={<SearchOutlined className="text-slate-400"/>} placeholder="Tìm kiếm..." className="w-48 rounded-lg" />
                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate} className="bg-blue-600 rounded-lg shadow-md">
                                Thêm câu hỏi
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
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

            <QuestionFormModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onSuccess={handleFormSuccess}
                initialValues={editingQuestion}
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