// src/features/question/pages/QuestionListPage.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, Card, message, Popconfirm, Checkbox, Space } from "antd";
import instance from "../../../shared/lib/axios.config";

export default function QuestionListPage() {
    const [questions, setQuestions] = useState([]);
    const [tags, setTags] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Fetch questions
    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await instance.get("/questions");
            setQuestions(res.data.data);
        } catch (err) {
            console.log(err);
            message.error("Không thể tải danh sách câu hỏi");
        }
        setLoading(false);
    };

    // Fetch tags
    const fetchTags = async () => {
        try {
            const res = await instance.get("/tag");
            setTags(res.data.data.tagList);
        } catch (err) {
            console.log(err);
            message.error("Không thể tải danh sách tag");
        }
    };

    // Fetch tests để hiển thị tên test
    const fetchTests = async () => {
        try {
            const res = await instance.get("/testList");
            setTests(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchQuestions();
        fetchTags();
        fetchTests();
    }, []);

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
                message.warning("Cập nhật chưa được triển khai");
            }

            setModalOpen(false);
            fetchQuestions();
        } catch (err) {
            console.log(err);
            message.error("Không thể lưu câu hỏi");
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

    const columns = [
        {
            title: "Câu hỏi",
            dataIndex: "content",
            key: "content",
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (tagIds) =>
                tagIds
                    .map((id) => tags.find((t) => t._id === id)?.name || "")
                    .join(", "),
        },
        {
            title: "Tests",
            dataIndex: "testIds",
            key: "testIds",
            render: (testIds) =>
                testIds
                    .map((id) => tests.find((t) => t._id === id)?.title || "")
                    .join(", "),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => openEditModal(record)} type="primary">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record) => (
        <div>
            <p><b>Options:</b> {record.options.join(", ")}</p>
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
                    pagination={false}
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
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Câu hỏi"
                        name="content"
                        rules={[{ required: true, message: "Câu hỏi không được để trống" }]}
                    >
                        <Input.TextArea rows={2} placeholder="Nhập câu hỏi..." />
                    </Form.Item>

                    {/* Options nhập A, B, C, D */}
                    <Form.Item label="Options" style={{ marginBottom: 0 }}>
                        <Form.Item name={["options", 0]} rules={[{ required: true }]} noStyle>
                            <Input placeholder="A" style={{ marginBottom: 4 }} />
                        </Form.Item>
                        <Form.Item name={["options", 1]} rules={[{ required: true }]} noStyle>
                            <Input placeholder="B" style={{ marginBottom: 4 }} />
                        </Form.Item>
                        <Form.Item name={["options", 2]} rules={[{ required: true }]} noStyle>
                            <Input placeholder="C" style={{ marginBottom: 4 }} />
                        </Form.Item>
                        <Form.Item name={["options", 3]} rules={[{ required: true }]} noStyle>
                            <Input placeholder="D" />
                        </Form.Item>
                    </Form.Item>

                    <Form.Item
                        label="Answer"
                        name="answer"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="VD: B" />
                    </Form.Item>

                    <Form.Item
                        label="Solution"
                        name="solution"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={2} placeholder="Giải thích đáp án..." />
                    </Form.Item>

                    <Form.Item
                        label="Grade Level"
                        name="gradeLevel"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="VD: 2" />
                    </Form.Item>

                    <Form.Item label="Tags" name="tags">
                        <Checkbox.Group options={tags.map((t) => ({ label: t.name, value: t._id }))} />
                    </Form.Item>

                    <Form.Item label="Test IDs" name="testIds">
                        <Checkbox.Group options={tests.map((t) => ({ label: t.title, value: t._id }))} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
