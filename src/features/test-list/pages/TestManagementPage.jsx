// src/features/pages/TestManagementPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../shared/lib/axios.config";
import {
    Table, Button, Card, Tag, Modal, message, Popconfirm, Typography, Empty,
    Row, Col, Statistic, Progress, List, Avatar, Tooltip
} from "antd";
import {
    PlusOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined,
    FileTextOutlined, BankOutlined, QuestionCircleOutlined,
    BarChartOutlined, UserOutlined, TrophyOutlined, FallOutlined,
    PieChartOutlined, RightOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import useAuth from "../../../app/hooks/useAuth.js";

const { Title } = Typography;

export default function TestManagementPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // ... (Các state cũ giữ nguyên)
    const [testInfo, setTestInfo] = useState(null);
    const [currentQuestions, setCurrentQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [allTags, setAllTags] = useState([]);

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // --- STATE THỐNG KÊ ---
    const [statsVisible, setStatsVisible] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // --- STATE MỚI: CHI TIẾT TAG ---
    const [tagDetailVisible, setTagDetailVisible] = useState(false);
    const [tagDetailData, setTagDetailData] = useState({ tagName: '', students: [] });

    // ... (Các useEffect và API fetch cũ giữ nguyên không đổi) ...
    useEffect(() => {
        if (user && user.role?.toLowerCase() !== "admin") {
            message.warning("Bạn không có quyền truy cập trang này!");
            navigate("/");
            return;
        }
        fetchData();
        fetchTagsList();
    }, [testId, user]);

    const fetchTagsList = async () => { try { const res = await instance.get("/tag"); const data = res.data.data; if (Array.isArray(data)) setAllTags(data); else if (data?.tagList) setAllTags(data.tagList); } catch (e) {} };
    const fetchData = async () => { setLoading(true); try { const qRes = await instance.get(`/questions?testId=${testId}`); if (qRes.data.success) setCurrentQuestions(qRes.data.data || []); const tRes = await instance.get(`/testList/${testId}`); if (tRes.data.success) setTestInfo(tRes.data.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
    const fetchAllQuestions = async () => { try { const res = await instance.get("/questions"); if(res.data.success) { const all = res.data.data || []; const ids = currentQuestions.map(q=>q._id); setAllQuestions(all.filter(q=>!ids.includes(q._id))); } } catch(e){} };

    const handleOpenStats = async () => {
        setStatsVisible(true);
        setLoadingStats(true);
        try {
            const res = await instance.get(`/testList/${testId}/statistics`);
            if (res.data.success) {
                setStatsData(res.data.data);
            }
        } catch (err) {
            message.error("Không thể tải thống kê");
        } finally {
            setLoadingStats(false);
        }
    };

    // --- HÀM MỚI: XỬ LÝ KHI CLICK VÀO TAG ---
    const handleViewTagDetail = (tagId) => {
        // 1. Lấy tên Tag
        const tagObj = allTags.find(t => t._id === tagId || t.name === tagId);
        const tagName = tagObj ? tagObj.name : (tagId || "Không xác định");

        // 2. Lọc danh sách học sinh sai tag này
        const studentsFailed = [];

        if (statsData && statsData.leaderboard) {
            statsData.leaderboard.forEach(result => {
                // result.details chứa chi tiết từng câu trả lời của học sinh đó
                // Đếm xem học sinh này sai bao nhiêu câu thuộc tagId này
                const wrongCount = result.details.filter(detail =>
                    detail.tags && detail.tags.includes(tagId) && !detail.isCorrect
                ).length;

                if (wrongCount > 0) {
                    studentsFailed.push({
                        user: result.user,
                        wrongCount: wrongCount
                    });
                }
            });
        }

        // Sắp xếp: Ai sai nhiều nhất lên đầu
        studentsFailed.sort((a, b) => b.wrongCount - a.wrongCount);

        setTagDetailData({ tagName, students: studentsFailed });
        setTagDetailVisible(true);
    };

    // ... (Các handlers cũ handleOpenAddModal, handleAddQuestionsToTest, handleRemoveQuestion giữ nguyên) ...
    const handleOpenAddModal = () => { fetchAllQuestions(); if(allTags.length===0) fetchTagsList(); setSelectedQuestionIds([]); setModalVisible(true); };
    const handleAddQuestionsToTest = async () => { if(!selectedQuestionIds.length) return; setSaving(true); try { await Promise.all(selectedQuestionIds.map(async qId => { const q = allQuestions.find(item=>item._id===qId); if(!q) return; const newIds = [...new Set([...(q.testIds||[]), testId])]; return instance.put(`/questions/${qId}`, {testIds: newIds}); })); message.success("Đã thêm!"); setModalVisible(false); fetchData(); } catch(e){message.error("Lỗi");} finally{setSaving(false);} };
    const handleRemoveQuestion = async (qId) => { try{ const q = currentQuestions.find(item=>item._id===qId); if(!q) return; const newIds = (q.testIds||[]).filter(id=>id!==testId); await instance.put(`/questions/${qId}`, {testIds: newIds}); message.success("Đã xóa"); setCurrentQuestions(prev=>prev.filter(item=>item._id!==qId)); } catch(e){message.error("Lỗi");} };

    // ... (columns, leaderboardColumns, modalColumns giữ nguyên) ...
    const columns = [ { title: 'STT', key: 'index', width: 60, align: 'center', render: (_, __, i) => i + 1 }, { title: 'Nội dung', dataIndex: 'content', render: t => <span className="line-clamp-2">{t}</span> }, { title: 'Đáp án', dataIndex: 'solution', width: 150, render: s => <Tag color="green">{s || "Chưa có"}</Tag> }, { title: 'Tags', dataIndex: 'tags', width: 200, render: ids => ( <div className="flex flex-wrap gap-1"> {Array.isArray(ids) && ids.map((id,i) => { const t = allTags.find(tag => tag._id === id); return <Tag key={i} color="geekblue">{t ? t.name : id}</Tag> })} </div> ) }, { title: 'Hành động', width: 80, align: 'center', render: (_, r) => ( <Popconfirm title="Gỡ khỏi đề?" onConfirm={() => handleRemoveQuestion(r._id)}> <Button danger type="text" icon={<DeleteOutlined />} /> </Popconfirm> ) } ];
    const leaderboardColumns = [ { title: 'Hạng', key: 'rank', width: 80, align: 'center', render: (_, __, index) => { if (index === 0) return <TrophyOutlined className="text-yellow-500 text-2xl" />; if (index === 1) return <TrophyOutlined className="text-gray-400 text-xl" />; if (index === 2) return <TrophyOutlined className="text-orange-700 text-xl" />; return <span className="font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{index + 1}</span>; } }, { title: 'Học sinh', dataIndex: 'user', render: (u) => ( <div className="flex items-center gap-3"> <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} /> <div className="flex flex-col"> <span className="font-bold text-slate-700">{u?.fullName || u?.username}</span> <span className="text-xs text-gray-400">{u?.email}</span> </div> </div> ) }, { title: 'Điểm số', dataIndex: 'score', align: 'center', sorter: (a, b) => a.score - b.score, render: (score) => ( <Tag color={score >= 8 ? 'green' : score >= 5 ? 'blue' : 'red'} className="text-base px-3 py-1 font-bold border-0"> {score} </Tag> ) }, { title: 'Nộp lúc', dataIndex: 'completedAt', width: 180, align: 'right', render: (d) => <span className="text-slate-500">{new Date(d).toLocaleString('vi-VN')}</span> } ];
    const modalColumns = [{title:'Nội dung',dataIndex:'content'},{title:'Tags',dataIndex:'tags',render:t=>(t||[]).length+' tags'}];

    // --- COLUMNS CHO MODAL CHI TIẾT TAG ---
    const tagDetailColumns = [
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
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            {/* ... (Phần render Header và Table chính giữ nguyên) ... */}
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Button icon={<ArrowLeftOutlined />} type="text" className="mb-4 text-slate-500 hover:bg-slate-200 pl-0" onClick={() => navigate('/')}>Về danh sách</Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileTextOutlined style={{fontSize:24}}/></div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 m-0">{testInfo?.title || "Quản lý câu hỏi"}</h1>
                                <div className="text-slate-500 text-sm mt-1">{currentQuestions.length} câu hỏi &bull; {testInfo?.gradeLevel ? `Khối ${testInfo.gradeLevel}` : 'Chưa phân khối'}</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button icon={<PieChartOutlined />} size="large" onClick={handleOpenStats} className="rounded-xl border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 font-medium">Báo cáo thống kê</Button>
                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleOpenAddModal} className="bg-blue-600 rounded-xl shadow-lg shadow-blue-200">Thêm câu hỏi</Button>
                        </div>
                    </div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden" bodyStyle={{padding:0}}>
                        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">Danh sách câu hỏi</span>
                            <Tag>{currentQuestions.length} câu</Tag>
                        </div>
                        <Table rowKey="_id" columns={columns} dataSource={currentQuestions} loading={loading} pagination={false} />
                    </Card>
                </motion.div>
                <Modal title={<div className="flex items-center gap-2 text-lg font-bold"><BankOutlined className="text-blue-600"/> Ngân hàng câu hỏi</div>} open={modalVisible} onCancel={()=>setModalVisible(false)} width={900} centered footer={[<Button key="c" onClick={()=>setModalVisible(false)}>Hủy</Button>, <Button key="s" type="primary" onClick={handleAddQuestionsToTest} loading={saving}>Thêm {selectedQuestionIds.length} câu</Button>]}>
                    <Table rowKey="_id" columns={modalColumns} dataSource={allQuestions} rowSelection={{onChange: setSelectedQuestionIds}} scroll={{y:350}} pagination={{pageSize:5}} size="small" bordered/>
                </Modal>

                {/* --- MODAL THỐNG KÊ (DASHBOARD) --- */}
                <Modal
                    title={<div className="flex items-center gap-3 text-2xl text-slate-800 py-2"><div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><BarChartOutlined /></div>Báo cáo kết quả bài thi</div>}
                    width={1000} centered onCancel={() => setStatsVisible(false)} open={statsVisible} footer={null} className="rounded-2xl overflow-hidden top-5" styles={{ body: { padding: "24px", backgroundColor: "#f8fafc" } }}
                >
                    {loadingStats || !statsData ? (
                        <div className="flex flex-col items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div><p className="text-slate-500">Đang tổng hợp dữ liệu...</p></div>
                    ) : (
                        <div className="space-y-6">
                            {/* 1. General Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card bordered={false} className="shadow-sm"><Statistic title="Tổng lượt thi" value={statsData.totalAttempts} prefix={<UserOutlined className="text-blue-500"/>} valueStyle={{ fontWeight: 'bold' }} /></Card>
                                <Card bordered={false} className="shadow-sm"><Statistic title="Điểm trung bình" value={statsData.averageScore} precision={2} prefix={<TrophyOutlined className="text-yellow-500"/>} valueStyle={{ fontWeight: 'bold' }} suffix="/ 10" /></Card>
                                <Card bordered={false} className="shadow-sm"><div className="flex justify-between items-end"><Statistic title="Cao nhất" value={statsData.highestScore} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} /><div className="h-8 w-px bg-slate-200 mx-4"></div><Statistic title="Thấp nhất" value={statsData.lowestScore} valueStyle={{ color: '#cf1322', fontWeight: 'bold' }} /></div></Card>
                            </div>

                            <Row gutter={24}>
                                {/* 2. Phổ điểm */}
                                <Col span={24} md={12}>
                                    <Card title="Phổ điểm" bordered={false} className="shadow-sm h-full rounded-xl">
                                        <div className="space-y-4 pt-2">
                                            {[{ l: "Kém (0-2)", c: '#ff4d4f', idx: 0 }, { l: "Yếu (2-4)", c: '#ff7a45', idx: 1 }, { l: "Trung bình (4-6)", c: '#faad14', idx: 2 }, { l: "Khá (6-8)", c: '#13c2c2', idx: 3 }, { l: "Giỏi (8-10)", c: '#52c41a', idx: 4 }].map((item) => {
                                                const count = statsData.scoreDistribution[item.idx];
                                                const percent = statsData.totalAttempts ? (count / statsData.totalAttempts) * 100 : 0;
                                                return (<div key={item.idx} className="flex items-center gap-3"><span className="w-24 text-xs font-semibold text-slate-500">{item.l}</span><Progress percent={percent} strokeColor={item.c} showInfo={false} size="small" className="flex-1 m-0"/><span className="w-12 text-right text-xs font-bold text-slate-700">{count} HS</span></div>);
                                            })}
                                        </div>
                                    </Card>
                                </Col>

                                {/* 3. Phân tích Tag (Clickable List) */}
                                <Col span={24} md={12}>
                                    <Card
                                        title={<><FallOutlined className="text-red-500 mr-2"/>Chủ đề học sinh yếu nhất</>}
                                        bordered={false} className="shadow-sm h-full rounded-xl" bodyStyle={{ padding: '12px 24px' }}
                                    >
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={statsData.tagAnalysis}
                                            renderItem={(item) => {
                                                const tagObj = allTags.find(t => t._id === item.tag || t.name === item.tag);
                                                const tagName = tagObj ? tagObj.name : (item.tag || "Không xác định");

                                                return (
                                                    <List.Item
                                                        className="border-b-0 py-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2"
                                                        onClick={() => handleViewTagDetail(item.tag)} // BẤM VÀO ĐÂY
                                                    >
                                                        <div className="w-full">
                                                            <div className="flex justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-700">{tagName}</span>
                                                                    <Tooltip title="Bấm để xem danh sách học sinh yếu tag này">
                                                                        <RightOutlined className="text-xs text-slate-300"/>
                                                                    </Tooltip>
                                                                </div>
                                                                <span className="text-red-500 font-bold text-xs">{item.wrongRate}% sai</span>
                                                            </div>
                                                            <Progress percent={parseFloat(item.wrongRate)} status="exception" showInfo={false} size="small" strokeWidth={6} />
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                Sai {item.wrongCount} / {item.total} lần xuất hiện
                                                            </div>
                                                        </div>
                                                    </List.Item>
                                                );
                                            }}
                                            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa đủ dữ liệu phân tích" /> }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* 4. Bảng xếp hạng */}
                            <Card title={<><TrophyOutlined className="text-yellow-500 mr-2"/>Bảng xếp hạng kết quả</>} bordered={false} className="shadow-sm rounded-xl">
                                <Table dataSource={statsData.leaderboard} columns={leaderboardColumns} rowKey="_id" pagination={{ pageSize: 5 }} size="middle" />
                            </Card>
                        </div>
                    )}
                </Modal>

                {/* --- MODAL CHI TIẾT TAG (HIỆN RA KHI BẤM VÀO TAG) --- */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <FallOutlined className="text-red-500" />
                            <span>Học sinh yếu chủ đề: <span className="text-blue-600">{tagDetailData.tagName}</span></span>
                        </div>
                    }
                    open={tagDetailVisible}
                    onCancel={() => setTagDetailVisible(false)}
                    footer={[<Button key="close" onClick={() => setTagDetailVisible(false)}>Đóng</Button>]}
                    centered
                >
                    {tagDetailData.students.length === 0 ? (
                        <Empty description="Không có học sinh nào sai chủ đề này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                        <Table
                            dataSource={tagDetailData.students}
                            columns={tagDetailColumns}
                            rowKey={(r) => r.user?._id || Math.random()}
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
}