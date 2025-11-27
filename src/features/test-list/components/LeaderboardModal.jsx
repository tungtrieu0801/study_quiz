import React from "react";
import { Modal, Table, Skeleton, Avatar, Tag } from "antd";
import { TrophyOutlined, UserOutlined } from "@ant-design/icons";

const LeaderboardModal = ({ open, onCancel, loading, data, testTitle, currentUser }) => {

    const columns = [
        {
            title: 'Hạng', key: 'rank', width: 70, align: 'center',
            render: (_, __, index) => {
                if (index === 0) return <TrophyOutlined className="text-yellow-500 text-xl" />;
                if (index === 1) return <TrophyOutlined className="text-gray-400 text-lg" />;
                if (index === 2) return <TrophyOutlined className="text-orange-700 text-lg" />;
                return <span className="font-bold text-gray-500">{index + 1}</span>;
            }
        },
        {
            title: 'Học sinh', dataIndex: 'user',
            render: (u) => (
                <div className="flex items-center gap-2">
                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                    <div className="flex flex-col">
                        <span className="font-medium">{u?.fullName || "Ẩn danh"}</span>
                        {u?._id === currentUser?._id && <span className="text-[10px] text-blue-500">(Bạn)</span>}
                    </div>
                </div>
            )
        },
        {
            title: 'Điểm', dataIndex: 'score', align: 'center',
            render: (score) => <Tag color={score >= 8 ? 'green' : score >= 5 ? 'blue' : 'red'} className="font-bold">{score}</Tag>
        },
        {
            title: 'Thời gian nộp', dataIndex: 'completedAt', align: 'right',
            render: (d) => <span className="text-xs text-gray-400">{new Date(d).toLocaleString('vi-VN')}</span>
        }
    ];

    return (
        <Modal
            title={<div className="flex items-center gap-2 text-xl text-slate-800 py-2"><TrophyOutlined className="text-yellow-500"/> Bảng vàng thành tích: <span className="text-blue-600">{testTitle}</span></div>}
            open={open} onCancel={onCancel} footer={null} centered width={700} zIndex={2000}
        >
            {loading ? <div className="text-center py-10"><Skeleton active /></div> :
                <Table
                    dataSource={data}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                    size="middle"
                    scroll={{ y: 400 }}
                />
            }
        </Modal>
    );
};

export default LeaderboardModal;