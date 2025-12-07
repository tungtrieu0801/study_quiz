// src/features/student/pages/StudentListPages.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Select, Modal, Spin, Card, Button, Form, message } from "antd";
import { EditOutlined } from "@ant-design/icons"; // Import icon sửa
import instance from "../../../shared/lib/axios.config";
import useAuth from "../../../app/hooks/useAuth.js";

export default function StudentListPages() {
    const [students, setStudents] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");

    // State cho chức năng xem chi tiết
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State cho chức năng SỬA
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [form] = Form.useForm(); // Hook của Antd
    const { user, role, logout } = useAuth();

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await instance.get("/user", {
                params: {
                    page,
                    size,
                    studentName: search,
                    gradeLevel: gradeLevel,
                    role: 'student',
                    teacherId: user.id
                },
            });

            setStudents(res.data.data.students);
            setTotal(res.data.data.total);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, [page, size, search, gradeLevel]);

    // Xử lý khi nhấn nút Sửa
    const handleEditClick = (record, e) => {
        e.stopPropagation(); // Ngăn không cho sự kiện click row kích hoạt
        setEditingStudent(record);
        // Fill dữ liệu cũ vào form
        form.setFieldsValue({
            fullName: record.fullName,
            username: record.username,
            gradeLevel: record.gradeLevel,
            password: "", // Mật khẩu để trống, chỉ nhập khi muốn đổi
        });
        setIsEditModalOpen(true);
    };

    // Xử lý submit Form cập nhật
    const handleUpdateUser = async (values) => {
        setUpdateLoading(true);
        try {
            // Gọi API update (giả sử endpoint là PUT /user/update hoặc tương tự)
            // Bạn cần điều chỉnh đường dẫn API cho khớp với Backend của bạn
            await instance.put("/user", {
                userId: editingStudent._id,
                username: values.username,
                gradeLevel: values.gradeLevel,
                fullName: values.fullName,
                password: values.password, // Backend sẽ check, nếu rỗng thì không đổi
            });

            message.success("Cập nhật thành công!");
            setIsEditModalOpen(false);
            fetchStudents(); // Load lại danh sách
        } catch (error) {
            message.error("Cập nhật thất bại!");
            console.error(error);
        }
        setUpdateLoading(false);
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (_, __, index) => page * size + index + 1,
            width: 60,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
        },
        {
            title: "Tài khoản",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Lớp",
            dataIndex: "gradeLevel",
            key: "gradeLevel",
            render: (text) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg">
                    {text}
                </span>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    ghost
                    icon={<EditOutlined />}
                    onClick={(e) => handleEditClick(record, e)}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    const handleRowClick = (record) => {
        setSelectedStudent(record);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="p-6">
            <Card className="shadow-md rounded-xl p-6">
                {/* 🔎 Thanh tìm kiếm + filter */}
                <div className="flex gap-4 mb-6 items-center">
                    <Input
                        placeholder="Tìm theo tên tài khoản..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-1/3"
                    />
                    <Select
                        placeholder="Chọn lớp"
                        allowClear
                        className="w-40"
                        value={gradeLevel || undefined}
                        onChange={(value) => setGradeLevel(value || "")}
                        options={[
                            { label: "1", value: "1" },
                            { label: "2", value: "2" },
                            { label: "3", value: "3" },
                        ]}
                    />
                </div>

                {/* 📋 Bảng danh sách học sinh */}
                <Table
                    columns={columns}
                    dataSource={students}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        current: page + 1,
                        pageSize: size,
                        total: total,
                        onChange: (p, s) => {
                            setPage(p - 1);
                            setSize(s);
                        }
                    }}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                    })}
                    className="cursor-pointer"
                />
            </Card>

            {/* ℹ️ Modal: Xem chi tiết (Chỉ xem) */}
            <Modal
                title="Thông tin chi tiết"
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
            >
                {selectedStudent ? (
                    <div className="space-y-3 text-base">
                        <p><strong>Họ tên:</strong> {selectedStudent.fullName}</p>
                        <p><strong>Username:</strong> {selectedStudent.username}</p>
                        <p><strong>Lớp:</strong> {selectedStudent.gradeLevel}</p>
                        <p>
                            <strong>Ngày tạo:</strong>{" "}
                            {new Date(selectedStudent.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                ) : <Spin />}
            </Modal>

            {/* ✏️ Modal: Sửa thông tin (Có form update) */}
            <Modal
                title="Cập nhật học sinh"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null} // Tắt footer mặc định để dùng nút trong Form
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateUser}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                        <Input placeholder="Nhập họ và tên mới" />
                    </Form.Item>

                    <Form.Item
                        label="Tài khoản"
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
                    >
                        <Input placeholder="Nhập tài khoản mới" />
                    </Form.Item>

                    <Form.Item
                        label="Lớp"
                        name="gradeLevel"
                        rules={[{ required: true, message: "Vui lòng nhập lớp!" }]}
                    >
                        <Input placeholder="Nhập lớp mới" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới (Để trống nếu không đổi)"
                        name="password"
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={updateLoading}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}