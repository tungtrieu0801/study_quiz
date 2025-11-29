import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Tag, message, Modal, Table, Avatar } from "antd";
import {
    PlusOutlined, ArrowLeftOutlined, FileTextOutlined, PieChartOutlined,
    TrophyOutlined, UserOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";

// --- Import Components ---
import QuestionTable from "./components/QuestionTable";
import AddQuestionModal from "./components/AddQuestionModal";
import StatisticsModal from "./components/StatisticsModal";
import TagDetailModal from "./components/TagDetailModal";
import ReviewSubmissionModal from "./components/ReviewSubmissionModal";
// >>> IMPORT WIDGET MỚI
import UnsubmittedStudentsWidget from "./components/UnsubmittedStudentsWidget";

import useAuth from "../../../../app/hooks/useAuth.js";
import instance from "../../../../shared/lib/axios.config.js";

export default function TestManagementPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- STATE CHÍNH ---
    const [testInfo, setTestInfo] = useState(null);
    const [currentQuestions, setCurrentQuestions] = useState([]);

    // --- STATE CHO MODAL THÊM CÂU HỎI (MỚI) ---
    const [modalQuestions, setModalQuestions] = useState([]); // List câu hỏi trong modal
    const [modalPagination, setModalPagination] = useState({ current: 1, pageSize: 10, total: 0 }); // Phân trang 10 câu
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

    const [allTags, setAllTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // Stats & Analysis State
    const [statsVisible, setStatsVisible] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [expandedLeaderboardVisible, setExpandedLeaderboardVisible] = useState(false);
    const [tagDetailVisible, setTagDetailVisible] = useState(false);
    const [tagDetailData, setTagDetailData] = useState({ tagName: '', students: [] });
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewData, setReviewData] = useState({ student: null, questions: [], submissionDetails: [] });

    // --- FETCH DATA ---
    useEffect(() => {
        if (user && user.role?.toLowerCase() !== "admin") {
            message.warning("Bạn không có quyền truy cập trang này!");
            navigate("/");
            return;
        }
        fetchData();
        fetchTagsList();
    }, [testId, user]);

    const fetchTagsList = async () => {
        try {
            const res = await instance.get("/tag");
            const data = res.data.data;
            if (Array.isArray(data)) setAllTags(data);
            else if (data?.tagList) setAllTags(data.tagList);
        } catch (e) {}
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const qRes = await instance.get(`/questions?testId=${testId}`);
            if (qRes.data.success) setCurrentQuestions(qRes.data.data || []);
            const tRes = await instance.get(`/testList/${testId}`);
            if (tRes.data.success) setTestInfo(tRes.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM MỚI: QUERY DATA CHO MODAL (PAGINATION) ---
    const fetchQuestionsForModal = async (page = 1, pageSize = 10) => {
        setModalLoading(true);
        try {
            const res = await instance.get(`/questions`, {
                params: { page, pageSize }
            });
            if (res.data.success) {
                setModalQuestions(res.data.data || []);
                setModalPagination({
                    current: page,
                    pageSize: pageSize,
                    total: res.data.total || 0
                });
            }
        } catch (e) {
            message.error("Lỗi tải danh sách ngân hàng câu hỏi");
        } finally {
            setModalLoading(false);
        }
    };

    // --- ACTIONS ---
    const handleOpenAddModal = () => {
        setSelectedQuestionIds([]);
        if (allTags.length === 0) fetchTagsList();
        // Mở modal là load trang 1, 10 items
        fetchQuestionsForModal(1, 10);
        setModalVisible(true);
    };

    const handleModalPageChange = (newPagination) => {
        fetchQuestionsForModal(newPagination.current, newPagination.pageSize);
    };

    const handleAddQuestionsToTest = async () => {
        if (!selectedQuestionIds.length) return;
        setSaving(true);
        try {
            // Duyệt qua các ID đã chọn để update
            await Promise.all(selectedQuestionIds.map(async qId => {
                // Kiểm tra xem câu hỏi có trong trang hiện tại không
                let qData = modalQuestions.find(q => q._id === qId);

                // Nếu user chọn ở trang khác (không có trong modalQuestions hiện tại), cần fetch lẻ để lấy testIds cũ
                if (!qData) {
                    const res = await instance.get(`/questions/${qId}`);
                    qData = res.data.data;
                }

                if (!qData) return;

                // Thêm testId hiện tại vào mảng testIds của câu hỏi
                const newIds = [...new Set([...(qData.testIds || []), testId])];
                return instance.put(`/questions/${qId}`, { testIds: newIds });
            }));

            message.success("Đã thêm câu hỏi vào đề!");
            setModalVisible(false);
            fetchData(); // Reload lại danh sách câu hỏi của đề
        } catch (e) {
            message.error("Lỗi thêm câu hỏi");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveQuestion = async (qId) => {
        try {
            const q = currentQuestions.find(item => item._id === qId);
            if (!q) return;
            const newIds = (q.testIds || []).filter(id => id !== testId);
            await instance.put(`/questions/${qId}`, { testIds: newIds });
            message.success("Đã xóa khỏi đề thi");
            setCurrentQuestions(prev => prev.filter(item => item._id !== qId));
        } catch (e) {
            message.error("Lỗi xóa câu hỏi");
        }
    };

    // --- STATS LOGIC ---
    const handleOpenStats = async () => {
        setStatsVisible(true);
        setLoadingStats(true);
        try {
            const res = await instance.get(`/testList/${testId}/statistics`);
            if (res.data.success) setStatsData(res.data.data);
        } catch (err) {
            message.error("Không thể tải thống kê");
        } finally {
            setLoadingStats(false);
        }
    };

    const handleViewTagDetail = (tagId) => {
        const tagObj = allTags.find(t => t._id === tagId || t.name === tagId);
        const tagName = tagObj ? tagObj.name : (tagId || "Không xác định");
        const studentsFailed = [];
        if (statsData && statsData.leaderboard) {
            statsData.leaderboard.forEach(result => {
                const wrongCount = result.details.filter(detail =>
                    detail.tags && detail.tags.includes(tagId) && !detail.isCorrect
                ).length;
                if (wrongCount > 0) studentsFailed.push({ user: result.user, wrongCount });
            });
        }
        studentsFailed.sort((a, b) => b.wrongCount - a.wrongCount);
        setTagDetailData({ tagName, students: studentsFailed });
        setTagDetailVisible(true);
    };

    const handleViewStudentResult = async (record) => {
        setReviewLoading(true);
        setReviewModalVisible(true);
        const questionIds = record.details.map(d => d.questionId);
        try {
            const res = await instance.post('/questions/get-by-ids', { ids: questionIds });
            if (res.data.success) {
                setReviewData({
                    student: record.user,
                    score: record.score,
                    submissionDetails: record.details,
                    questions: res.data.data
                });
            }
        } catch (error) {
            message.error("Không thể tải chi tiết bài làm.");
        } finally {
            setReviewLoading(false);
        }
    };

    // --- SHARED COLUMNS ---
    const leaderboardColumns = [
        {
            title: 'Hạng', key: 'rank', width: 150, align: 'center', render: (_, __, index) => {
                if (index === 0) return <TrophyOutlined className="text-yellow-500 text-2xl" />;
                if (index === 1) return <TrophyOutlined className="text-gray-400 text-xl" />;
                if (index === 2) return <TrophyOutlined className="text-orange-700 text-xl" />;
                return <span className="font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{index + 1}</span>;
            }
        },
        {
            title: 'Học sinh',
            dataIndex: 'user',
            align: 'center',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                    <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-700">{u?.fullName || u?.username}</span>
                        <span className="text-xs text-gray-400">{u?.email}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Điểm số',
            dataIndex: 'score',
            align: 'center',
            width: 150,
            sorter: (a, b) => a.score - b.score,
            render: (score) => (
                <Tag color={score >= 8 ? 'green' : score >= 5 ? 'blue' : 'red'} className="text-base px-3 py-1 font-bold border-0">
                    {score}
                </Tag>
            )
        },
        {
            title: 'Nộp lúc',
            dataIndex: 'completedAt',
            width: 160,
            align: 'center',
            render: (d) => <span className="text-slate-500">{new Date(d).toLocaleString('vi-VN')}</span>
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button icon={<ArrowLeftOutlined />} type="text" className="mb-4 text-slate-500 hover:bg-slate-200 pl-0" onClick={() => navigate('/')}>
                        Về danh sách
                    </Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <FileTextOutlined style={{ fontSize: 24 }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 m-0">{testInfo?.title || "Quản lý câu hỏi"}</h1>
                                <div className="text-slate-500 text-sm mt-1">
                                    {currentQuestions.length} câu hỏi &bull; {testInfo?.gradeLevel ? `Khối ${testInfo.gradeLevel}` : 'Chưa phân khối'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button icon={<PieChartOutlined />} size="large" onClick={handleOpenStats}
                                    className="rounded-xl border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 font-medium">
                                Báo cáo thống kê
                            </Button>
                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleOpenAddModal}
                                    className="bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                Thêm câu hỏi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* >>> CHÈN WIDGET HỌC SINH CHƯA NỘP BÀI <<< */}
                {testInfo && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <UnsubmittedStudentsWidget
                            testName={testInfo?.title}
                            testId={testId}
                            gradeLevel={testInfo.gradeLevel}
                        />
                    </motion.div>
                )}

                {/* Main Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden" bodyStyle={{ padding: 0 }}>
                        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">Danh sách câu hỏi</span>
                            <Tag>{currentQuestions.length} câu</Tag>
                        </div>
                        <QuestionTable
                            questions={currentQuestions}
                            loading={loading}
                            allTags={allTags}
                            onRemove={handleRemoveQuestion}
                        />
                    </Card>
                </motion.div>

                {/* --- MODALS --- */}

                {/* MODAL THÊM CÂU HỎI ĐÃ CẬP NHẬT */}
                <AddQuestionModal
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}

                    // Props dữ liệu & phân trang
                    loading={modalLoading}
                    questions={modalQuestions}
                    pagination={modalPagination}
                    onPageChange={handleModalPageChange}

                    // Logic chọn
                    existingQuestionIds={currentQuestions.map(q => q._id)}
                    selectedIds={selectedQuestionIds}
                    setSelectedIds={setSelectedQuestionIds}

                    onAdd={handleAddQuestionsToTest}
                    saving={saving}
                />

                <StatisticsModal
                    open={statsVisible}
                    onCancel={() => setStatsVisible(false)}
                    loading={loadingStats}
                    data={statsData}
                    allTags={allTags}
                    onViewTagDetail={handleViewTagDetail}
                    onExpandLeaderboard={() => setExpandedLeaderboardVisible(true)}
                    leaderboardColumns={leaderboardColumns}
                    onRowClick={handleViewStudentResult}
                />

                <TagDetailModal
                    open={tagDetailVisible}
                    onCancel={() => setTagDetailVisible(false)}
                    data={tagDetailData}
                />

                <ReviewSubmissionModal
                    open={reviewModalVisible}
                    onCancel={() => setReviewModalVisible(false)}
                    loading={reviewLoading}
                    data={reviewData}
                />

                {/* Expanded Leaderboard Modal */}
                <Modal
                    title={<div className="flex items-center gap-3 text-xl text-slate-800"><TrophyOutlined className="text-yellow-500" /> Bảng xếp hạng chi tiết</div>}
                    open={expandedLeaderboardVisible}
                    onCancel={() => setExpandedLeaderboardVisible(false)}
                    footer={null}
                    width={900}
                    centered
                    zIndex={1001}
                >
                    <Table
                        dataSource={statsData?.leaderboard || []}
                        columns={leaderboardColumns}
                        rowKey="_id"
                        pagination={false}
                        scroll={{ y: 600 }}
                        size="middle"
                        onRow={(record) => ({
                            onClick: () => handleViewStudentResult(record),
                            style: { cursor: 'pointer' },
                            className: "hover:bg-blue-50 transition-colors"
                        })}
                    />
                </Modal>
            </div>
        </div>
    );
}