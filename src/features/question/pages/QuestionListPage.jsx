// src/features/question/pages/QuestionListPage.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, Card, message, Popconfirm, Checkbox, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import instance from "../../../shared/lib/axios.config";

export default function QuestionListPage() {
    const [questions, setQuestions] = useState([]);
    const [tags, setTags] = useState([]);
    const [tests, setTests] = useState([]);

    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingQuestion, setEditingQuestion] = useState(null);

    // State cho tạo tag nhanh
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);

    // --- FETCH DATA ---
    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await instance.get("/questions");
            const data = res.data.data;
            setQuestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    const fetchTags = async () => {
        try {
            const res = await instance.get("/tag");
            const data = res.data.data;
            if (Array.isArray(data)) setTags(data);
            else if (data?.tagList) setTags(data.tagList);
            else setTags([]);
        } catch (err) {
            setTags([]);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await instance.get("/testList");
            const data = res.data.data;
            setTests(Array.isArray(data) ? data : []);
        } catch (err) {
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
        setNewTagName("");
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);
        setNewTagName("");
        form.setFieldsValue({
            ...question,
            tags: question.tags || [],
            testIds: question.testIds || [],
            options: question.options || ["", "", "", ""]
        });
        setModalOpen(true);
    };

    // Hàm tạo tag riêng lẻ (để tái sử dụng)
    const createNewTagApi = async (tagName) => {
        const res = await instance.post("/tag", {
            name: tagName,
            description: "Tự động tạo khi thêm câu hỏi"
        });
        if (res.data.success) {
            // Reload lại list tags để UI cập nhật
            await fetchTags();
            // Trả về ID của tag mới tạo
            return res.data.data._id;
        }
        throw new Error(res.data.message || "Lỗi tạo tag");
    };

    // Handler cho nút "Thêm nhanh" (người dùng bấm chủ động)
    const handleCreateQuickTag = async () => {
        if (!newTagName.trim()) return;
        setCreatingTag(true);
        try {
            await createNewTagApi(newTagName);
            message.success("Đã thêm tag mới!");
            setNewTagName("");
        } catch (err) {
            message.error("Lỗi tạo tag: " + err.message);
        } finally {
            setCreatingTag(false);
        }
    };

    // --- LOGIC SUBMIT CHÍNH (QUAN TRỌNG) ---
    const handleSubmit = async () => {
        try {
            // 1. Validate Form trước
            const values = await form.validateFields();

            // 2. Xử lý Tag mới (nếu người dùng nhập mà quên bấm thêm)
            let finalTags = values.tags || [];

            if (newTagName.trim()) {
                try {
                    // Gọi API tạo tag ngay lập tức
                    const newTagId = await createNewTagApi(newTagName);

                    // Thêm ID tag mới vào danh sách tag của câu hỏi
                    finalTags = [...finalTags, newTagId];

                    // Clear ô input tag
                    setNewTagName("");
                    message.success(`Đã tự động tạo tag: "${newTagName}"`);
                } catch (tagErr) {
                    // Nếu tạo tag lỗi thì dừng lại, báo user sửa
                    message.error("Không thể tạo tag mới: " + tagErr.message);
                    return;
                }
            }

            // Gán lại tags đã update vào values
            values.tags = finalTags;

            // 3. Gửi API tạo/sửa câu hỏi
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
            // Nếu lỗi là do validate form thì không hiện message lỗi server
            if (!err.errorFields) {
                message.error("Có lỗi xảy ra khi lưu câu hỏi");
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await instance.delete(`/questions/${id}`);
            message.success("Xóa câu hỏi thành công!");
            fetchQuestions();
        } catch (err) {
            message.error("Xóa thất bại");
        }
    };

    // --- COLUMNS ---
    const columns = [
        { title: "Câu hỏi", dataIndex: "content", key: "content", width: 300 },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (tagIds) => (tagIds || []).map((id) => (tags || []).find((t) => t._id === id)?.name || "").filter(Boolean).join(", "),
        },
        {
            title: "Tests",
            dataIndex: "testIds",
            key: "testIds",
            render: (testIds) => (testIds || []).map((id) => (tests || []).find((t) => t._id === id)?.title || "").filter(Boolean).join(", "),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => openEditModal(record)} type="primary" size="small">Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
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
                    <Button type="primary" onClick={openCreateModal}>+ Tạo câu hỏi</Button>
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
                    <Form.Item label="Câu hỏi" name="content" rules={[{ required: true, message: "Nhập câu hỏi" }]}>
                        <Input.TextArea rows={2} placeholder="Nhập nội dung câu hỏi..." />
                    </Form.Item>

                    <Form.Item label="Các lựa chọn (A, B, C, D)" style={{ marginBottom: 0 }}>
                        <div className="grid grid-cols-2 gap-4">
                            {["A", "B", "C", "D"].map((opt, idx) => (
                                <Form.Item key={opt} name={["options", idx]} rules={[{ required: true, message: `Nhập ${opt}` }]}>
                                    <Input placeholder={`Lựa chọn ${opt}`} prefix={<span className="font-bold mr-2">{opt}.</span>} />
                                </Form.Item>
                            ))}
                        </div>
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Đáp án đúng" name="answer" rules={[{ required: true }]} tooltip="Nhập chính xác nội dung đáp án">
                            <Input placeholder="VD: Nội dung câu A" />
                        </Form.Item>
                        <Form.Item label="Khối lớp" name="gradeLevel" rules={[{ required: true }]}>
                            <Input placeholder="VD: 10, 11, 12" />
                        </Form.Item>
                    </div>

                    <Form.Item label="Giải thích" name="solution" rules={[{ required: true }]}>
                        <Input.TextArea rows={2} placeholder="Giải thích chi tiết..." />
                    </Form.Item>

                    {/* TAGS SECTION */}
                    <Form.Item label="Tags (Danh mục)">
                        {/* Input tạo nhanh */}
                        <div className="flex gap-2 mb-3">
                            <Input
                                placeholder="Nhập tên tag mới (nếu có)..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                className="w-1/2"
                                onPressEnter={(e) => { e.preventDefault(); handleCreateQuickTag(); }} // Enter thì thêm nhanh luôn
                            />
                            <Button onClick={handleCreateQuickTag} loading={creatingTag} icon={<PlusOutlined />}>Thêm nhanh</Button>
                        </div>

                        {/* Danh sách Tags (Wrap) */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto custom-scrollbar">
                            <Form.Item name="tags" noStyle>
                                <Checkbox.Group className="w-full">
                                    <div className="flex flex-wrap gap-3">
                                        {(tags || []).map((t) => (
                                            <Checkbox key={t._id} value={t._id}>
                                                <span className="select-none">{t.name}</span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </Checkbox.Group>
                            </Form.Item>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">* Mẹo: Nếu bạn nhập tên tag ở trên và bấm "Tạo" (nút xanh dưới cùng), hệ thống sẽ tự động tạo tag đó và gắn vào câu hỏi.</div>
                    </Form.Item>

                    <Form.Item label="Thuộc bài thi (Test IDs)" name="testIds">
                        <Checkbox.Group options={(tests || []).map((t) => ({ label: t.title, value: t._id }))} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}