import React from "react";
import { Table, Button, Space, Popconfirm, Tag, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const QuestionTable = ({ questions, loading, tags, pagination, onChange, onEdit, onDelete, onView }) => {

    const columns = [
        // Thêm cột STT để dễ theo dõi (tùy chọn)
        {
            title: "#",
            key: "index",
            width: 50,
            align: 'center',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {
            title: "Nội dung câu hỏi",
            dataIndex: "content",
            key: "content",
            width: "55%",
            render: (text) => <span className="font-medium text-slate-700 line-clamp-2">{text}</span>
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            width: "25%",
            render: (tagIds) => (
                <div className="flex flex-wrap gap-1">
                    {(tagIds || []).slice(0, 4).map((id) => {
                        const tagName = (tags || []).find((t) => t._id === id)?.name;
                        return tagName ? <Tag key={id} bordered={false} className="bg-slate-100 text-slate-600 m-0">{tagName}</Tag> : null;
                    })}
                    {(tagIds?.length > 4) && <Tag bordered={false}>+{tagIds.length - 4}</Tag>}
                </div>
            ),
        },
        {
            title: "",
            key: "actions",
            width: 100,
            align: 'right',
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Sửa">
                        <Button icon={<EditOutlined />} onClick={() => onEdit(record)} type="text" className="text-blue-600 hover:bg-blue-50"/>
                    </Tooltip>
                    <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => onDelete(record._id)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa">
                            <Button icon={<DeleteOutlined />} type="text" danger className="hover:bg-red-50"/>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            rowKey="_id"
            columns={columns}
            dataSource={questions}
            loading={loading}
            // Cấu hình Pagination Server-side
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true, // Cho phép chọn 10, 20, 50 dòng/trang
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Tổng ${total} câu hỏi`,
            }}
            // Gọi hàm onChange khi user bấm chuyển trang hoặc đổi số lượng dòng
            onChange={onChange}

            scroll={{ x: 800 }}
            onRow={(record) => ({
                onClick: () => onView(record),
                className: "cursor-pointer hover:bg-slate-50 transition-colors"
            })}
        />
    );
};

export default QuestionTable;