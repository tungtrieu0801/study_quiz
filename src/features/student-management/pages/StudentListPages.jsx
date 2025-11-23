// src/features/student/pages/StudentListPages.jsx
import React, { useEffect, useState } from "react";
import { Table, Input, Select, Modal, Spin, Card } from "antd";
import instance from "../../../shared/lib/axios.config";

export default function StudentListPages() {
    const [students, setStudents] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await instance.get("/user", {
                params: {
                    page,
                    size,
                    studentName: search || undefined,
                    gradeLevel: gradeLevel || undefined,
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

    const columns = [
        {
            title: "Username",
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
    ];

    const handleRowClick = (record) => {
        setSelectedStudent(record);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <Card className="shadow-md rounded-xl p-6">

                {/* 🔎 Thanh tìm kiếm + filter */}
                <div className="flex gap-4 mb-6 items-center">
                    <Input
                        placeholder="Tìm theo tên username..."
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
                            { label: "1A", value: "1A" },
                            { label: "2A", value: "2A" },
                            { label: "3A", value: "3A" },
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

            {/* ℹ️ Popup thông tin chi tiết */}
            <Modal
                title="Thông tin học sinh"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                {selectedStudent ? (
                    <div className="space-y-3 text-base">
                        <p><strong>Username:</strong> {selectedStudent.username}</p>
                        <p><strong>Lớp:</strong> {selectedStudent.gradeLevel}</p>
                        <p>
                            <strong>Ngày tạo:</strong>{" "}
                            {new Date(selectedStudent.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                ) : (
                    <Spin />
                )}
            </Modal>
        </div>
    );
}
