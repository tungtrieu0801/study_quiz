import React from "react";
import { Modal, Button, Table, Avatar, Tag, Empty } from "antd";
import { FallOutlined, UserOutlined } from "@ant-design/icons";

export default function TagDetailModal({ open, onCancel, data }) {
    const columns = [
        {
            title: 'Học sinh',
            dataIndex: 'user',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" icon={<UserOutlined />} />
                    <span className="font-medium">{u?.fullName || u?.username}</span>
                </div>
            )
        },
        {
            title: 'Số câu sai',
            dataIndex: 'wrongCount',
            align: 'center',
            render: (count) => <Tag color="red" className="font-bold text-sm px-3">{count} câu</Tag>
        }
    ];

    return (
        <Modal
            title={<div className="flex items-center gap-2"><FallOutlined className="text-red-500" /><span>Học sinh yếu chủ đề: <span className="text-blue-600">{data.tagName}</span></span></div>}
            open={open}
            onCancel={onCancel}
            footer={[<Button key="close" onClick={onCancel}>Đóng</Button>]}
            centered
            zIndex={1002}
        >
            {data.students.length === 0 ?
                <Empty description="Không có học sinh nào sai chủ đề này" image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                <Table dataSource={data.students} columns={columns} rowKey={(r) => r.user?._id || Math.random()} pagination={{ pageSize: 5 }} size="small" />
            }
        </Modal>
    );
}