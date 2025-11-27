import React, { useState, useMemo, useEffect } from "react";
import { Row, Col, Statistic, Button, Modal, Table, Tag } from "antd";
import { BarChartOutlined, CheckCircleOutlined, HistoryOutlined, EyeOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const StudentDashboard = ({ tests, onViewLeaderboard }) => {
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [chartLimit, setChartLimit] = useState(5);

    useEffect(() => {
        const handleResize = () => setChartLimit(window.innerWidth < 768 ? 3 : 5);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const takenTests = useMemo(() => {
        return tests.filter(t => t.isTaken)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [tests]);

    const totalTaken = takenTests.length;
    const avgScore = totalTaken > 0
        ? (takenTests.reduce((acc, cur) => acc + (cur.score || 0), 0) / totalTaken).toFixed(1)
        : 0;

    const chartData = takenTests.slice(0, chartLimit).reverse();

    if (totalTaken === 0) return null;

    const historyColumns = [
        {
            title: 'Tên bài thi',
            dataIndex: 'title',
            render: (t, record) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-700 line-clamp-2 md:line-clamp-1">{t}</span>
                    <span className="text-[11px] text-gray-400 md:hidden mt-0.5">
                        {new Date(record.updatedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                    </span>
                </div>
            )
        },
        {
            title: 'Điểm',
            dataIndex: 'score',
            align: 'center',
            width: 70,
            sorter: (a, b) => a.score - b.score,
            render: (score) => (
                <Tag color={score >= 8 ? 'green' : score >= 5 ? 'blue' : 'red'} className="font-bold border-0 px-1 md:px-3 mx-0">
                    {score}
                </Tag>
            )
        },
        {
            title: 'Thời gian nộp',
            dataIndex: 'updatedAt',
            align: 'right',
            width: 180,
            responsive: ['md'],
            render: (d) => <span className="text-gray-500">{new Date(d).toLocaleString('vi-VN')}</span>
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 110,
            render: (_, record) => (
                <Button type="text" onClick={() => onViewLeaderboard(record._id, record.title)} className="flex items-center justify-center text-xs md:text-sm p-0 h-auto">
                    <EyeOutlined className="text-blue-500 text-lg mr-0.5"/> <span className="font-medium text-slate-700">Xem hạng</span>
                </Button>
            )
        }
    ];

    return (
        <>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={8}>
                        <div className="flex flex-col gap-4 border-r-0 md:border-r border-slate-100 pr-0 md:pr-4">
                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <BarChartOutlined className="text-blue-500"/> Kết quả học tập
                            </h3>
                            <div className="flex gap-8">
                                <Statistic title="Bài đã làm" value={totalTaken} prefix={<CheckCircleOutlined className="text-green-500"/>} />
                                <Statistic title="Điểm trung bình" value={avgScore} valueStyle={{ color: parseFloat(avgScore) >= 8 ? '#52c41a' : '#1677ff' }} />
                            </div>
                            <Button icon={<HistoryOutlined />} onClick={() => setHistoryModalOpen(true)} className="rounded-xl border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-400 w-fit">
                                Xem lịch sử ({totalTaken})
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} md={16}>
                        {/* ... (Phần Chart giữ nguyên code cũ để ngắn gọn) ... */}
                        <div className="h-40 flex items-end justify-around gap-4 pt-4 border-b border-slate-100 pb-2">
                            {chartData.map((t, idx) => {
                                const heightPercent = Math.max((t.score / 10) * 75, 10);
                                const color = t.score >= 8 ? 'bg-green-400' : t.score >= 5 ? 'bg-blue-400' : 'bg-red-400';
                                return (
                                    <div key={idx} className="flex flex-col items-center justify-end h-full w-full group relative cursor-pointer hover:-translate-y-1 transition-transform duration-300" onClick={() => onViewLeaderboard(t._id, t.title)}>
                                        <div className={`text-sm font-bold mb-1`}>{t.score}</div>
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${heightPercent}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className={`w-full max-w-[40px] rounded-t-md ${color} opacity-80 group-hover:opacity-100 transition-all shadow-sm`} />
                                        <div className="text-[10px] text-slate-400 mt-2 truncate w-16 text-center font-medium">{t.title}</div>
                                    </div>
                                );
                            })}
                            {chartData.length === 0 && <div className="text-slate-400 w-full text-center self-center">Chưa có dữ liệu</div>}
                        </div>
                    </Col>
                </Row>
            </motion.div>

            <Modal
                title={<div className="text-lg md:text-xl font-bold text-slate-700 flex items-center gap-2"><HistoryOutlined className="text-blue-600"/> Lịch sử làm bài</div>}
                open={historyModalOpen}
                onCancel={() => setHistoryModalOpen(false)}
                footer={null}
                width={800}
                style={{ top: 20, maxWidth: 'calc(100vw - 16px)', margin: '0 auto' }}
                styles={{ body: { padding: '12px 0' } }}
            >
                <Table dataSource={takenTests} columns={historyColumns} rowKey="_id" pagination={false} size="small" scroll={{ x: 'max-content', y: 400 }} />
            </Modal>
        </>
    );
};

export default StudentDashboard;