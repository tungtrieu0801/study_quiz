// src/features/tag/pages/TagListPage.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, Card, message, Popconfirm } from "antd";
import instance from "../../../shared/lib/axios.config";

export default function TagListPage() {
    const [tags, setTags] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingTag, setEditingTag] = useState(null); // null = create mode

    // Fetch list tags
    const fetchTags = async () => {
        setLoading(true);
        try {
            const res = await instance.get("/tag", {
                params: {
                    tagName: search || undefined,
                },
            });

            setTags(res.data.data.tagList);
            setTotal(res.data.data.total);
        } catch (err) {
            message.error("Không thể tải danh sách tag");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTags();
    }, [search]);

    // Open Create Modal
    const openCreateModal = () => {
        setEditingTag(null);
        form.resetFields();
        setModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (tag) => {
        setEditingTag(tag);
        form.setFieldsValue(tag);
        setModalOpen(true);
    };

    // Submit Create/Update
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingTag) {
                // UPDATE
                await instance.put(`/tag/${editingTag._id}`, values);
                message.success("Cập nhật tag thành công!");
            } else {
                // CREATE
                await instance.post("/tag", values);
                message.success("Tạo tag thành công!");
            }

            setModalOpen(false);
            fetchTags();

        } catch (err) {
            console.log(err);
            message.error("Không thể lưu tag");
        }
    };

    // DELETE Tag
    const handleDelete = async (id) => {
        try {
            await instance.delete(`/tag/${id}`);
            message.success("Xóa tag thành công!");
            fetchTags();
        } catch (err) {
            console.log(err);
            message.error("Xóa tag thất bại");
        }
    };

    const columns = [
        {
            title: "Tên Tag",
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <span className="font-medium text-blue-600">{text}</span>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div className="flex gap-3">
                    <Button
                        className="bg-yellow-500 text-white"
                        onClick={() => openEditModal(record)}
                    >
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
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Card className="shadow-md rounded-xl p-6">

                {/* Top bar: Search + Create */}
                <div className="flex justify-between mb-6 items-center gap-2">
                    <Input
                        placeholder="Tìm theo tên tag..."
                        className="w-1/3"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <Button
                        type="primary"
                        className="bg-blue-600"
                        onClick={openCreateModal}
                    >
                        + Tạo Tag
                    </Button>
                </div>

                {/* List table */}
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={tags}
                    loading={loading}
                    pagination={false}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingTag ? "Cập nhật Tag" : "Tạo Tag mới"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                okText={editingTag ? "Cập nhật" : "Tạo"}
                cancelText="Hủy"
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên Tag"
                        name="name"
                        rules={[{ required: true, message: "Tên tag không được để trống" }]}
                    >
                        <Input placeholder="VD: Hình học" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: "Mô tả không được để trống" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn về tag..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
