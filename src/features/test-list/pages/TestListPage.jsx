// src/features/pages/HomePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import instance from "../../../shared/lib/axios.config";
import {
    message, Card, Button, Tag, Skeleton, Empty, Modal, Form, Input, Select, InputNumber,
    Statistic, Row, Col, Avatar, Table
} from "antd";
import { useNavigate } from "react-router-dom";
import {
    PlusOutlined, ClockCircleOutlined, ReadOutlined, ArrowRightOutlined,
    AppstoreOutlined, FormOutlined, SettingOutlined, DownOutlined, UpOutlined,
    TrophyOutlined, BarChartOutlined, CheckCircleOutlined, UserOutlined, HistoryOutlined, EyeOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth";

// --- COMPONENT: STUDENT DASHBOARD ---
const StudentDashboard = ({ tests, onViewLeaderboard }) => {
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // 1. Lọc các bài đã thi & Sắp xếp mới nhất
    const takenTests = useMemo(() => {
        return tests.filter(t => t.isTaken)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [tests]);

    // 2. Tính toán chỉ số
    const totalTaken = takenTests.length;
    const avgScore = totalTaken > 0
        ? (takenTests.reduce((acc, cur) => acc + (cur.score || 0), 0) / totalTaken).toFixed(1)
        : 0;

    // 3. Lấy 5 bài gần nhất cho biểu đồ (Đảo ngược lại để bài mới nhất nằm bên phải)
    const chartData = takenTests.slice(0, 5).reverse();

    if (totalTaken === 0) return null;

    // Columns cho Modal Lịch sử
    const historyColumns = [
        {
            title: 'Tên bài thi', dataIndex: 'title',
            render: (t) => <span className="font-medium text-slate-700">{t}</span>
        },
        {
            title: 'Điểm số', dataIndex: 'score', align: 'center', sorter: (a, b) => a.score - b.score,
            render: (score) => (
                <Tag color={score >= 8 ? 'green' : score >= 5 ? 'blue' : 'red'} className="font-bold border-0 px-3">
                    {score}
                </Tag>
            )
        },
        {
            title: 'Thời gian nộp', dataIndex: 'updatedAt', align: 'right', width: 200,
            render: (d) => <span className="text-gray-500">{new Date(d).toLocaleString('vi-VN')}</span>
        },
        {
            title: 'Chi tiết', key: 'action', align: 'center', width: 120,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined className="text-blue-500"/>}
                    onClick={() => onViewLeaderboard(record._id, record.title)}
                >
                    Xem hạng
                </Button>
            )
        }
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-200"
            >
                <Row gutter={[24, 24]} align="middle">
                    {/* Cột Thống kê số */}
                    <Col xs={24} md={8}>
                        <div className="flex flex-col gap-4 border-r border-slate-100 pr-4">
                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <BarChartOutlined className="text-blue-500"/> Kết quả học tập
                            </h3>
                            <div className="flex gap-8">
                                <Statistic
                                    title="Bài đã làm"
                                    value={totalTaken}
                                    prefix={<CheckCircleOutlined className="text-green-500"/>}
                                />
                                <Statistic
                                    title="Điểm trung bình"
                                    value={avgScore}
                                    suffix="/ 10"
                                    valueStyle={{ color: parseFloat(avgScore) >= 8 ? '#52c41a' : '#1677ff' }}
                                />
                            </div>
                            <Button
                                icon={<HistoryOutlined />}
                                onClick={() => setHistoryModalOpen(true)}
                                className="rounded-xl border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-400 w-fit"
                            >
                                Xem toàn bộ lịch sử ({totalTaken})
                            </Button>
                        </div>
                    </Col>

                    {/* Cột Biểu đồ */}
                    <Col xs={24} md={16}>
                        <div className="text-xs text-slate-400 mb-2 text-center">Biểu đồ điểm 5 bài thi gần nhất</div>
                        {/* Tăng chiều cao lên h-40 để chứa điểm số thoải mái */}
                        <div className="h-40 flex items-end justify-around gap-4 pt-4 border-b border-slate-100 pb-2">
                            {chartData.map((t, idx) => {
                                // Tính chiều cao cột (Max 75% để chừa chỗ cho text điểm số)
                                const heightPercent = Math.max((t.score / 10) * 75, 10);
                                const color = t.score >= 8 ? 'bg-green-400' : t.score >= 5 ? 'bg-blue-400' : 'bg-red-400';
                                const scoreColor = t.score >= 8 ? 'text-green-600' : t.score >= 5 ? 'text-blue-600' : 'text-red-500';

                                return (
                                    <div key={idx} className="flex flex-col items-center justify-end h-full w-full group relative cursor-pointer hover:-translate-y-1 transition-transform duration-300" onClick={() => onViewLeaderboard(t._id, t.title)}>

                                        {/* ĐIỂM SỐ (Hiển thị luôn trên đầu) */}
                                        <div className={`text-sm font-bold mb-1 ${scoreColor}`}>
                                            {t.score}
                                        </div>

                                        {/* Cột điểm */}
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercent}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                            className={`w-full max-w-[40px] rounded-t-md ${color} opacity-80 group-hover:opacity-100 transition-all shadow-sm`}
                                        />

                                        {/* Tên bài */}
                                        <div className="text-[10px] text-slate-400 mt-2 truncate w-16 text-center font-medium" title={t.title}>
                                            {t.title}
                                        </div>
                                    </div>
                                );
                            })}
                            {chartData.length === 0 && <div className="text-slate-400 w-full text-center self-center">Chưa có dữ liệu</div>}
                        </div>
                    </Col>
                </Row>
            </motion.div>

            {/* MODAL LỊCH SỬ CHI TIẾT */}
            <Modal
                title={<div className="text-xl font-bold text-slate-700 flex items-center gap-2"><HistoryOutlined className="text-blue-600"/> Lịch sử làm bài</div>}
                open={historyModalOpen}
                onCancel={() => setHistoryModalOpen(false)}
                footer={null}
                width={800}
                centered
                zIndex={1000}
            >
                <Table
                    dataSource={takenTests}
                    columns={historyColumns}
                    rowKey="_id"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>
        </>
    );
};

export default function TestListPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();

    const [leaderboardVisible, setLeaderboardVisible] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [selectedTestTitle, setSelectedTestTitle] = useState("");

    const [isExpanded, setIsExpanded] = useState(false);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { fetchTests(); }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await instance.get("/testList", { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) setTests(res.data.data || []);
        } catch (err) {} finally { setLoading(false); }
    };

    const handleClickTest = (test) => {
        if (isAdmin) {
            navigate(`/admin/test/${test._id}`);
        } else {
            if (test.isTaken) {
                handleViewLeaderboard(test._id, test.title);
            } else {
                navigate(`/test/${test._id}`);
            }
        }
    };

    const handleViewLeaderboard = async (testId, title) => {
        setSelectedTestTitle(title);
        setLeaderboardVisible(true);
        setLoadingLeaderboard(true);
        try {
            const res = await instance.get(`/testList/${testId}/statistics`);
            if (res.data.success) {
                setLeaderboardData(res.data.data.leaderboard || []);
            }
        } catch (err) {
            message.error("Không tải được bảng xếp hạng");
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCancelModal = () => { setIsModalOpen(false); form.resetFields(); };
    const handleCreateTest = async (values) => {
        setCreating(true);
        try {
            const token = localStorage.getItem("authToken");
            const payload = { ...values, duration: `${values.duration}p` };
            const res = await instance.post("/testList", payload, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) {
                message.success("Tạo thành công!");
                setTests([res.data.data, ...tests]);
                handleCancelModal();
            }
        } catch (error) { message.error("Lỗi tạo bài"); } finally { setCreating(false); }
    };

    const getGradeColor = (grade) => {
        if (!grade) return "blue";
        if (grade.toString().includes("12")) return "purple";
        if (grade.toString().includes("10")) return "cyan";
        return "blue";
    };

    const visibleTests = isAdmin || isExpanded ? tests : tests.slice(0, 6);

    const leaderboardColumns = [
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
                        {u?._id === user?._id && <span className="text-[10px] text-blue-500">(Bạn)</span>}
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
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200"><AppstoreOutlined className="text-2xl text-white" /></div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Kho đề thi</h1>
                            <p className="text-slate-500">{isAdmin ? "Quản lý ngân hàng đề thi" : "Học tập và kiểm tra trực tuyến"}</p>
                        </div>
                    </div>
                    {isAdmin && <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleOpenModal} className="bg-blue-600 rounded-xl shadow-lg">Tạo đề thi mới</Button>}
                </div>

                {!isAdmin && !loading && (
                    <StudentDashboard tests={tests} onViewLeaderboard={handleViewLeaderboard} />
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (<Card key={i} className="rounded-2xl h-48"><Skeleton active avatar paragraph={{ rows: 3 }} /></Card>))}
                    </div>
                ) : tests.length === 0 ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-200"><Empty description="Chưa có bài kiểm tra nào" /></div>
                ) : (
                    <>
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <AnimatePresence>
                                {visibleTests.map((test) => (
                                    <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
                                        <Card
                                            hoverable
                                            className={`h-full rounded-2xl border transition-all duration-300 group overflow-hidden flex flex-col relative
                                                ${test.isTaken ? 'bg-gray-50 border-gray-200' : 'bg-white border-slate-200 hover:shadow-xl hover:-translate-y-1'}
                                            `}
                                            onClick={() => handleClickTest(test)}
                                            styles={{ body: { padding: "24px", height: "100%", display: "flex", flexDirection: "column" } }}
                                        >
                                            {test.isTaken && <div className="absolute top-0 right-0 bg-slate-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1"><CheckCircleOutlined /> ĐÃ LÀM</div>}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="flex justify-between items-start mb-4">
                                                <Tag color={getGradeColor(test.gradeLevel)} className="px-3 py-1 rounded-full border-none bg-slate-100 m-0"><ReadOutlined /> {test.gradeLevel ? `Khối ${test.gradeLevel}` : "Đại trà"}</Tag>
                                                {isAdmin && <div className="text-slate-400 bg-slate-100 p-1.5 rounded-md"><SettingOutlined /></div>}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{test.title || "Không có tên"}</h3>
                                            <div className="flex-grow"><p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">{test.description || "Không có mô tả."}</p></div>
                                            <div className="h-px w-full bg-slate-100 my-4" />
                                            <div className="flex items-center justify-between text-slate-400 text-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5"><ClockCircleOutlined className="text-blue-500" /> <span className="font-medium text-slate-600">{test.duration || "N/A"}</span></div>
                                                </div>
                                                {test.isTaken ? (
                                                    <div className="font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><TrophyOutlined className="text-yellow-500"/> {test.score} điểm</div>
                                                ) : (
                                                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-blue-600 font-medium flex items-center gap-1">{isAdmin ? "Quản lý" : "Làm bài"} <ArrowRightOutlined /></div>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                        {!isAdmin && tests.length > 6 && (
                            <div className="flex justify-center mt-10"><Button type="text" icon={isExpanded ? <UpOutlined /> : <DownOutlined />} onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-6 py-2 h-auto rounded-full font-medium transition-all">{isExpanded ? "Thu gọn danh sách" : `Xem thêm ${tests.length - 6} bài kiểm tra khác`}</Button></div>
                        )}
                    </>
                )}

                <Modal title="Tạo đề thi mới" open={isModalOpen} onCancel={handleCancelModal} footer={null} centered width={600}>
                    <Form form={form} layout="vertical" onFinish={handleCreateTest} className="mt-4">
                        <Form.Item label="Tên bài kiểm tra" name="title" rules={[{ required: true }]}><Input size="large" className="rounded-xl"/></Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Thời gian (phút)" name="duration" rules={[{ required: true }]}><InputNumber size="large" className="w-full rounded-xl"/></Form.Item>
                            <Form.Item label="Khối lớp" name="gradeLevel" rules={[{ required: true }]}><Select size="large" className="rounded-xl">{[10,11,12].map(g=><Select.Option key={g} value={g.toString()}>Khối {g}</Select.Option>)}</Select></Form.Item>
                        </div>
                        <Form.Item label="Mô tả" name="description"><Input.TextArea rows={4} className="rounded-xl"/></Form.Item>
                        <div className="flex justify-end gap-3 pt-4"><Button onClick={handleCancelModal}>Hủy</Button><Button type="primary" htmlType="submit" loading={creating}>Tạo</Button></div>
                    </Form>
                </Modal>

                <Modal
                    title={<div className="flex items-center gap-2 text-xl text-slate-800 py-2"><TrophyOutlined className="text-yellow-500"/> Bảng vàng thành tích: <span className="text-blue-600">{selectedTestTitle}</span></div>}
                    open={leaderboardVisible} onCancel={() => setLeaderboardVisible(false)} footer={null} centered width={700}
                    zIndex={2000}
                >
                    {loadingLeaderboard ? <div className="text-center py-10"><Skeleton active /></div> : <Table dataSource={leaderboardData} columns={leaderboardColumns} rowKey="_id" pagination={{ pageSize: 5 }} size="middle"/>}
                </Modal>
            </div>
        </div>
    );
}