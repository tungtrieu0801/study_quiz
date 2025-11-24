// src/features/question/pages/QuestionListPage.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, Card, message, Popconfirm, Checkbox, Space } from "antd";
import instance from "../../../shared/lib/axios.config";

export default function QuestionListPage() {
    const [questions, setQuestions] = useState([]);
    // Khởi tạo là mảng rỗng để tránh lỗi map
    const [tags, setTags] = useState([]);
    const [tests, setTests] = useState([]);

    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingQuestion, setEditingQuestion] = useState(null);

    // --- FETCH DATA ---

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await instance.get("/questions");
            // Kiểm tra kỹ dữ liệu trả về
            const data = res.data.data;
            setQuestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            message.error("Không thể tải danh sách câu hỏi");
        }
        setLoading(false);
    };

    const fetchTags = async () => {
        try {
            const res = await instance.get("/tag");
            // FIX LỖI TẠI ĐÂY: API trả về mảng trực tiếp trong res.data.data
            const data = res.data.data;
            if (Array.isArray(data)) {
                setTags(data);
            } else if (data && data.tagList) {
                setTags(data.tagList);
            } else {
                setTags([]);
            }
        } catch (err) {
            console.log(err);
            // Không setTags(undefined) khi lỗi
            setTags([]);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await instance.get("/testList");
            const data = res.data.data;
            // Validate dữ liệu test
            setTests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setTests([]);
        }
    };

    useEffect(() => {
        fetchQuestions();
        fetchTags();
        fetchTests();
    }, []);

    // --- HANDLERS ---

    const openCreateModal = () => {
        setEditingQuestion(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);
        form.setFieldsValue({
            ...question,
            tags: question.tags || [],
            testIds: question.testIds || [],
            options: question.options || ["", "", "", ""]
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!editingQuestion) {
                await instance.post("/questions", values);
                message.success("Tạo câu hỏi thành công!");
            } else {
                // Nếu có API update
                message.warning("Cập nhật chưa được triển khai API");
                // await instance.put(`/questions/${editingQuestion._id}`, values);
            }

            setModalOpen(false);
            fetchQuestions();
        } catch (err) {
            console.log(err);
            message.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        try {
            await instance.delete(`/questions/${id}`);
            message.success("Xóa câu hỏi thành công!");
            fetchQuestions();
        } catch (err) {
            console.log(err);
            message.error("Xóa thất bại");
        }
    };

    // --- COLUMNS ---
    const columns = [
        {
            title: "Câu hỏi",
            dataIndex: "content",
            key: "content",
            width: 300,
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            // SAFE GUARD: (tagIds || []) và kiểm tra tags tồn tại
            render: (tagIds) =>
                (tagIds || [])
                    .map((id) => (tags || []).find((t) => t._id === id)?.name || "Unknown")
                    .join(", "),
        },
        {
            title: "Tests",
            dataIndex: "testIds",
            key: "testIds",
            // SAFE GUARD: (testIds || []) và kiểm tra tests tồn tại
            render: (testIds) =>
                (testIds || [])
                    .map((id) => (tests || []).find((t) => t._id === id)?.title || "Unknown")
                    .join(", "),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => openEditModal(record)} type="primary" size="small">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record) => (
        <div className="bg-slate-50 p-4 rounded">
            <p><b>Options:</b> {(record.options || []).join(" | ")}</p>
            <p><b>Answer:</b> {record.answer}</p>
            <p><b>Solution:</b> {record.solution}</p>
            <p><b>Grade Level:</b> {record.gradeLevel}</p>
        </div>
    );

    return (
        <div className="p-6">
            <Card className="shadow-md rounded-xl p-6">
                <div className="flex justify-between mb-6 items-center">
                    <h2 className="text-2xl font-bold">Danh sách câu hỏi</h2>
                    <Button type="primary" onClick={openCreateModal}>
                        + Tạo câu hỏi
                    </Button>
                </div>

                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={questions}
                    loading={loading}
                    expandable={{ expandedRowRender }}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 800 }}
                />
            </Card>

            <Modal
                title={editingQuestion ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                okText={editingQuestion ? "Cập nhật" : "Tạo"}
                cancelText="Hủy"
                onOk={handleSubmit}
                width={800}
                centered
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Câu hỏi"
                        name="content"
                        rules={[{ required: true, message: "Câu hỏi không được để trống" }]}
                    >
                        <Input.TextArea rows={2} placeholder="Nhập nội dung câu hỏi..." />
                    </Form.Item>

                    {/* Options */}
                    <Form.Item label="Các lựa chọn (A, B, C, D)" style={{ marginBottom: 0 }}>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name={["options", 0]} rules={[{ required: true, message: "Nhập đáp án A" }]}>
                                <Input placeholder="Lựa chọn A" prefix={<span className="font-bold mr-2">A.</span>} />
                            </Form.Item>
                            <Form.Item name={["options", 1]} rules={[{ required: true, message: "Nhập đáp án B" }]}>
                                <Input placeholder="Lựa chọn B" prefix={<span className="font-bold mr-2">B.</span>} />
                            </Form.Item>
                            <Form.Item name={["options", 2]} rules={[{ required: true, message: "Nhập đáp án C" }]}>
                                <Input placeholder="Lựa chọn C" prefix={<span className="font-bold mr-2">C.</span>} />
                            </Form.Item>
                            <Form.Item name={["options", 3]} rules={[{ required: true, message: "Nhập đáp án D" }]}>
                                <Input placeholder="Lựa chọn D" prefix={<span className="font-bold mr-2">D.</span>} />
                            </Form.Item>
                        </div>
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Đáp án đúng"
                            name="answer"
                            rules={[{ required: true, message: "Nhập đáp án đúng" }]}
                            tooltip="Nhập chính xác nội dung của đáp án đúng (VD: Nội dung của câu A)"
                        >
                            <Input placeholder="VD: 4 (hoặc nội dung text)" />
                        </Form.Item>

                        <Form.Item
                            label="Khối lớp"
                            name="gradeLevel"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="VD: 10, 11, 12" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Giải thích (Solution)"
                        name="solution"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={2} placeholder="Giải thích chi tiết..." />
                    </Form.Item>

                    {/* FIX LỖI MAP TAGS Ở ĐÂY: Thêm (tags || []) */}
                    <Form.Item label="Tags (Danh mục)" name="tags">
                        <Checkbox.Group
                            options={(tags || []).map((t) => ({ label: t.name, value: t._id }))}
                        />
                    </Form.Item>

                    {/* FIX LỖI MAP TESTS Ở ĐÂY: Thêm (tests || []) */}
                    <Form.Item label="Thuộc bài thi (Test IDs)" name="testIds">
                        <Checkbox.Group
                            options={(tests || []).map((t) => ({ label: t.title, value: t._id }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}