import React, { useEffect, useState } from "react";
import { message, Card, Button, Skeleton, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, AppstoreOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

// Hooks & Libs
import instance from "../../../shared/lib/axios.config";
import useAuth from "../../../app/hooks/useAuth";
import useTestManagement from "../../../app/hooks/useTestManagement";

// Import Components đã tách
import StudentDashboard from "../components/StudentDashboard";
import TestCard from "../components/TestCard";
import CreateTestModal from "../components/CreateTestModal";
import LeaderboardModal from "../components/LeaderboardModal";

export default function TestListPage() {
    // --- State Management ---
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Leaderboard State
    const [leaderboardVisible, setLeaderboardVisible] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [selectedTestTitle, setSelectedTestTitle] = useState("");

    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { createTest, creating } = useTestManagement();

    // --- Effects ---
    useEffect(() => { fetchTests(); }, []);

    // --- Logic Handlers ---
    const fetchTests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await instance.get("/testList", { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) setTests(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const handleClickTest = (test) => {
        if (isAdmin) {
            navigate(`/admin/test/${test._id}`);
        } else {
            test.isTaken ? handleViewLeaderboard(test._id, test.title) : navigate(`/test/${test._id}`);
        }
    };

    const handleViewLeaderboard = async (testId, title) => {
        setSelectedTestTitle(title);
        setLeaderboardVisible(true);
        setLoadingLeaderboard(true);
        try {
            const res = await instance.get(`/testList/${testId}/statistics`);
            if (res.data.success) setLeaderboardData(res.data.data.leaderboard || []);
        } catch (err) { message.error("Không tải được bảng xếp hạng"); }
        finally { setLoadingLeaderboard(false); }
    };

    const handleCreateTest = (values) => {
        createTest(values, (newTestData) => {
            setTests([newTestData, ...tests]);
            setIsCreateModalOpen(false);
        });
    };

    const visibleTests = isAdmin || isExpanded ? tests : tests.slice(0, 6);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <AppstoreOutlined className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Kho đề thi</h1>
                            <p className="text-slate-500">{isAdmin ? "Quản lý ngân hàng đề thi" : "Học tập và kiểm tra trực tuyến"}</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 rounded-xl shadow-lg">
                            Tạo đề thi mới
                        </Button>
                    )}
                </div>

                {/* STUDENT DASHBOARD */}
                {!isAdmin && !loading && (
                    <StudentDashboard tests={tests} onViewLeaderboard={handleViewLeaderboard} />
                )}

                {/* TEST LIST GRID */}
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
                                        <TestCard test={test} isAdmin={isAdmin} onClick={() => handleClickTest(test)} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {!isAdmin && tests.length > 6 && (
                            <div className="flex justify-center mt-10">
                                <Button type="text" icon={isExpanded ? <UpOutlined /> : <DownOutlined />} onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-6 py-2 h-auto rounded-full font-medium transition-all">
                                    {isExpanded ? "Thu gọn danh sách" : `Xem thêm ${tests.length - 6} bài kiểm tra khác`}
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* MODALS */}
                <CreateTestModal
                    open={isCreateModalOpen}
                    onCancel={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateTest}
                    loading={creating}
                />

                <LeaderboardModal
                    open={leaderboardVisible}
                    onCancel={() => setLeaderboardVisible(false)}
                    loading={loadingLeaderboard}
                    data={leaderboardData}
                    testTitle={selectedTestTitle}
                    currentUser={user}
                />
            </div>
        </div>
    );
}