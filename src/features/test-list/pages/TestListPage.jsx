import React, { useEffect, useState } from "react";
import { message, Card, Button, Skeleton, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, AppstoreOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Hooks & Libs
import instance from "../../../shared/lib/axios.config";
import useAuth from "../../../app/hooks/useAuth";
import useTestManagement from "../../../app/hooks/useTestManagement";

// Import Components
import StudentDashboard from "../components/StudentDashboard";
import TestCard from "../components/TestCard";
import CreateTestModal from "../components/CreateTestModal";
import LeaderboardModal from "../components/LeaderboardModal";
import EditTestModal from "../components/EditTestModal"; // <--- IMPORT MODAL VỪA TẠO

export default function TestListPage() {
    // --- State Management ---
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activatingId, setActivatingId] = useState(null);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // --- STATE CHO EDIT MODAL ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState(null); // Lưu object bài thi đang sửa
    const [updating, setUpdating] = useState(false); // Loading khi đang lưu

    // Leaderboard State
    const [leaderboardVisible, setLeaderboardVisible] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [selectedTestTitle, setSelectedTestTitle] = useState("");

    const { user, isTeacher } = useAuth();
    const navigate = useNavigate();
    const { createTest, creating } = useTestManagement();

    useEffect(() => { fetchTests(); }, []);

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

    // --- XỬ LÝ ACTIVE ĐỀ THI ---
    const handleActivateTest = async (testId) => {
        setActivatingId(testId);
        try {
            const res = await instance.put(`/testList/${testId}`, { status: 'activate' });
            if (res.data.success) {
                message.success("Đã công khai đề thi thành công!");
                setTests(prevTests => prevTests.map(t =>
                    t._id === testId ? { ...t, status: 'activate' } : t
                ));
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi kích hoạt đề thi");
        } finally {
            setActivatingId(null);
        }
    };

    // --- [SỬA] MỞ MODAL EDIT ---
    const handleEditTest = (test) => {
        setEditingTest(test);     // Lưu thông tin bài cần sửa vào state
        setIsEditModalOpen(true); // Mở Modal
    };

    // --- [MỚI] GỌI API UPDATE TỪ MODAL ---
    const handleUpdateTest = async (testId, updatedValues) => {
        setUpdating(true);
        try {
            // Gọi API PUT update
            const res = await instance.put(`/testList/${testId}`, updatedValues);

            if (res.data.success) {
                message.success("Cập nhật thành công!");

                // Cập nhật lại danh sách tests ở Local (không cần load lại trang)
                setTests(prevTests => prevTests.map(t =>
                    t._id === testId ? { ...t, ...updatedValues } : t
                ));

                // Đóng modal
                setIsEditModalOpen(false);
                setEditingTest(null);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi cập nhật");
        } finally {
            setUpdating(false);
        }
    };

    const handleClickTest = (test) => {
        if (isTeacher) {
            navigate(`/teacher/test/${test._id}`);
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

    const visibleTests = isTeacher || isExpanded ? tests : tests.slice(0, 6);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* HEADER... (Giữ nguyên) */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <AppstoreOutlined className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Kho đề thi</h1>
                            <p className="text-slate-500">{isTeacher ? "Quản lý ngân hàng đề thi" : "Học tập và kiểm tra trực tuyến"}</p>
                        </div>
                    </div>
                    {isTeacher && (
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 rounded-xl shadow-lg">
                            Tạo đề thi mới
                        </Button>
                    )}
                </div>

                {/* STUDENT DASHBOARD... (Giữ nguyên) */}
                {!isTeacher && !loading && (
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
                                        <TestCard
                                            test={test}
                                            isTeacher={isTeacher}
                                            onActivate={handleActivateTest}
                                            isActivating={activatingId === test._id}

                                            // Prop này giờ đây gọi hàm mở Modal
                                            onEdit={handleEditTest}

                                            onClick={() => handleClickTest(test)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {!isTeacher && tests.length > 6 && (
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

                {/* --- THÊM MODAL SỬA VÀO ĐÂY --- */}
                <EditTestModal
                    open={isEditModalOpen}
                    testData={editingTest}
                    loading={updating}
                    onCancel={() => setIsEditModalOpen(false)}
                    onUpdate={handleUpdateTest}
                />
            </div>
        </div>
    );
}