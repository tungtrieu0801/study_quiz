import React, { useEffect, useState } from "react";
import { Button, Card, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import instance from "../../../shared/lib/axios.config";

// Import components
import QuestionTable from "../components/QuestionTable";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionDetailDrawer from "../components/QuestionDetailDrawer";

export default function QuestionListPage() {
    // --- Data State ---
    const [questions, setQuestions] = useState([]);
    const [tags, setTags] = useState([]);
    const [tests, setTests] = useState([]); // Vẫn cần fetch để dùng trong Modal tạo/sửa
    const [loading, setLoading] = useState(false);

    // --- Pagination State (MỚI) ---
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

    // --- 1. Fetch Metadata (Tags, Tests) - Chỉ chạy 1 lần khi load trang ---
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [tRes, testRes] = await Promise.all([
                    instance.get("/tag"),
                    instance.get("/testList")
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
        // Gọi dữ liệu trang 1 ngay khi vào
        fetchQuestions(1, 10);
    }, []);

    // --- 2. Fetch Questions (Gọi khi chuyển trang hoặc reload) ---
    const fetchQuestions = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            // Truyền params page và size lên server
            const res = await instance.get("/questions", {
                params: {
                    page: page,
                    size: pageSize
                }
            });

            if (res.data.success) {
                setQuestions(res.data.data || []);
                // Cập nhật state phân trang dựa trên total từ server trả về
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

    // Hàm refresh Tags (truyền cho Modal dùng khi tạo tag nhanh)
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
            // Reload lại trang hiện tại
            fetchQuestions(pagination.current, pagination.pageSize);
        } catch (err) {
            message.error("Xóa thất bại");
        }
    };

    const handleView = (question) => {
        setViewingQuestion(question);
        setDrawerOpen(true);
    };

    // Xử lý sự kiện khi người dùng bấm trang số 2, 3... ở Table
    const handleTableChange = (newPagination) => {
        fetchQuestions(newPagination.current, newPagination.pageSize);
    };

    // Logic Submit Form (Create/Update)
    const handleFormSuccess = async (values) => {
        try {
            if (editingQuestion) {
                // UPDATE
                await instance.put(`/questions/${editingQuestion._id}`, values);
                message.success("Cập nhật thành công!");
            } else {
                // CREATE
                await instance.post("/questions", values);
                message.success("Tạo câu hỏi thành công!");
            }

            setModalOpen(false);
            // Reload lại trang hiện tại để thấy thay đổi
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
                        pagination={pagination}      // <-- Truyền state phân trang
                        onChange={handleTableChange} // <-- Truyền hàm xử lý đổi trang
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