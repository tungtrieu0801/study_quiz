import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Card,
    message,
    Popconfirm,
    Tag,
    Tooltip
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    TagsOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import instance from "../../../shared/lib/axios.config";
import { motion } from "framer-motion";

export default function TagListPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingTag, setEditingTag] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // --- FETCH DATA ---
    const fetchTags = async (page = 1, size = 10, search = "") => {
        setLoading(true);
        try {
            const res = await instance.get("/tag", {
                params: {
                    page: page - 1, // Backend dùng 0-index, Frontend dùng 1-index
                    size: size,
                    tagName: search || undefined,
                },
            });
            // Mapping theo controller: res.data.data chứa { tagList, total }
            const dataApi = res.data.data;

            if (Array.isArray(dataApi)) {
                setTags(dataApi);

                // Cập nhật phân trang
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    // Vì API trả về mảng trực tiếp, total chính là độ dài mảng (hoặc bạn cần check lại API xem field total nằm ở đâu)
                    // Tạm thời lấy độ dài mảng hiện tại nếu API không trả về tổng số bản ghi riêng
                    total: dataApi.length,
                }));
            } else {
                // Trường hợp API trả về dạng { tagList: [], total: 100 } như code cũ của bạn dự đoán
                setTags(dataApi.tagList || []);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: size,
                    total: dataApi.total || 0,
                }));
            }

        } catch (err) {
            console.error(err);
            message.error("Không thể tải danh sách thẻ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags(1, pagination.pageSize, searchText);
    }, [searchText]);

    const handleTableChange = (newPagination) => {
        fetchTags(newPagination.current, newPagination.pageSize, searchText);
    };

    // --- ACTIONS ---
    const openCreateModal = () => {
        setEditingTag(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (tag) => {
        setEditingTag(tag);
        form.setFieldsValue({
            name: tag.name,
            description: tag.description
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const values = await form.validateFields();

            if (editingTag) {
                // UPDATE: PUT /tag/:id
                await instance.put(`/tag/${editingTag._id}`, values);
                message.success("Cập nhật thẻ thành công!");
            } else {
                // CREATE: POST /tag
                await instance.post("/tag", values);
                message.success("Tạo thẻ mới thành công!");
            }

            setModalOpen(false);
            // Reload data giữ nguyên trang hiện tại nếu sửa, về trang 1 nếu tạo mới
            fetchTags(editingTag ? pagination.current : 1, pagination.pageSize, searchText);

        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Có lỗi xảy ra";
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await instance.delete(`/tag/${id}`);
            message.success("Đã xóa thẻ thành công!");
            // Reload data
            fetchTags(pagination.current, pagination.pageSize, searchText);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Xóa thất bại";
            message.error(errorMsg);
        }
    };

    // --- TABLE COLUMNS ---
    const columns = [
        {
            title: "Tên Thẻ (Tag)",
            dataIndex: "name",
            key: "name",
            width: 200,
            fixed: 'left', // Cố định cột tên trên mobile khi cuộn
            render: (text) => (
                <div className="font-semibold text-blue-600 flex items-center gap-2">
                    <TagsOutlined /> {text}
                </div>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: 300,
            render: (text) => (
                <Tooltip title={text}>
                    <div className="truncate max-w-[250px] text-slate-500">
                        {text || <span className="italic text-slate-300">Không có mô tả</span>}
                    </div>
                </Tooltip>
            )
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 150,
            render: (date) => (
                <span className="text-slate-500 text-sm">
                    {date ? new Date(date).toLocaleDateString("vi-VN") : "-"}
                </span>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            width: 120,
            fixed: 'right', // Cố định nút hành động bên phải
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-yellow-600" />}
                            className="bg-yellow-50 hover:bg-yellow-100"
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Xóa thẻ này?"
                        description="Các câu hỏi đang gắn thẻ này sẽ bị gỡ bỏ tag."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                className="bg-red-50 hover:bg-red-100"
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
            <div className="max-w-6xl mx-auto">

                {/* PAGE HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-blue-600 text-white p-2 rounded-lg text-xl shadow-lg shadow-blue-200">
                            <TagsOutlined />
                        </span>
                        Quản lý Danh mục (Tags)
                    </h1>
                    <p className="text-slate-500 mt-1 ml-12">Phân loại câu hỏi để dễ dàng quản lý đề thi</p>
                </motion.div>

                <Card className="shadow-md border-slate-200 rounded-2xl overflow-hidden">
                    {/* TOOLBAR: SEARCH & CREATE */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                        <Input
                            prefix={<SearchOutlined className="text-slate-400" />}
                            placeholder="Tìm kiếm tag..."
                            className="w-full md:w-1/3 h-10 rounded-xl"
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => fetchTags(pagination.current, pagination.pageSize, searchText)}
                                className="h-10 rounded-xl hidden md:flex items-center"
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl shadow-md w-full md:w-auto flex items-center justify-center font-medium"
                                onClick={openCreateModal}
                            >
                                Tạo Tag Mới
                            </Button>
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={tags}
                        loading={loading}
                        onChange={handleTableChange}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} thẻ`,
                            position: ["bottomCenter"],
                        }}
                        scroll={{ x: 800 }} // Cho phép cuộn ngang trên mobile
                        rowClassName="hover:bg-slate-50 transition-colors cursor-pointer"
                        className="overflow-hidden rounded-lg"
                    />
                </Card>
            </div>

            {/* MODAL CREATE/EDIT */}
            <Modal
                title={
                    <div className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        {editingTag ? <EditOutlined className="text-yellow-600" /> : <PlusOutlined className="text-blue-600" />}
                        {editingTag ? "Cập nhật Thẻ" : "Tạo Thẻ Mới"}
                    </div>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                okText={editingTag ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy bỏ"
                onOk={handleSubmit}
                confirmLoading={submitting}
                centered
                className="rounded-2xl overflow-hidden"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        label={<span className="font-medium text-slate-600">Tên Tag (Duy nhất)</span>}
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên tag" },
                            { whitespace: true, message: "Tên không được để trống" }
                        ]}
                    >
                        <Input
                            placeholder="VD: Đại số 10, Hình học không gian..."
                            className="h-10 rounded-lg"
                            maxLength={50}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-medium text-slate-600">Mô tả chi tiết</span>}
                        name="description"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Mô tả ý nghĩa của tag này..."
                            className="rounded-lg resize-none"
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}