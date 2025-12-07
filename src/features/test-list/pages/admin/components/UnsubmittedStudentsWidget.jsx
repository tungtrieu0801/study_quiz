import React, { useEffect, useState } from "react";
import { Card, Avatar, Button, Spin, Tooltip, Progress, Badge } from "antd";
import {
    UserOutlined,
    CopyOutlined,
    ReloadOutlined,
    WarningOutlined,
    CheckCircleFilled,
    TrophyOutlined // <--- Import thêm icon Cúp
} from "@ant-design/icons";
import instance from "../../../../../shared/lib/axios.config";
import { toast } from "react-toastify";
import useAuth from "../../../../../app/hooks/useAuth.js";

export default function UnsubmittedStudentsWidget({ testName, testId, gradeLevel }) {
    const [loading, setLoading] = useState(false);

    // State danh sách
    const [unsubmittedStudents, setUnsubmittedStudents] = useState([]);
    const [submittedList, setSubmittedList] = useState([]); // <--- State mới lưu người đã nộp

    // State thống kê số lượng
    const [totalStudents, setTotalStudents] = useState(0);
    const [submittedCount, setSubmittedCount] = useState(0);
    const { user, role, logout } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Lấy thống kê & Leaderboard
            const statsRes = await instance.get(`/testList/${testId}/statistics`);
            const leaderboard = statsRes.data.success ? statsRes.data.data.leaderboard : [];

            // Lưu danh sách đã nộp để dùng cho nút Copy mới
            setSubmittedList(leaderboard);

            // Lấy danh sách ID để lọc
            const submittedIds = leaderboard.map(item => item.user._id);
            setSubmittedCount(submittedIds.length);

            // if (gradeLevel) studentParams.gradeLevel = gradeLevel;

            const studentRes = await instance.get("/user", {
                params: {
                    role: 'student',
                    page: 0,
                    size: 1000,
                    teacherId: user.id,
                }
            });
            const allStudents = studentRes.data.data.students || [];
            setTotalStudents(allStudents.length);

            // 3. Lọc người chưa nộp
            const notSubmitted = allStudents.filter(student => !submittedIds.includes(student._id));
            setUnsubmittedStudents(notSubmitted);

        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải dữ liệu tiến độ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (testId) fetchData();
    }, [testId, gradeLevel]);

    // --- COPY DANH SÁCH CHƯA LÀM ---
    const handleCopyUnsubmittedNames = () => {
        const header = `⚠️ DANH SÁCH CHƯA LÀM BÀI - ${testName || "Kiểm tra"}:`;
        const listStudent = unsubmittedStudents
            .map((s, index) => `${index + 1}. ${s.fullName}`)
            .join("\n");
        const finalContent = `${header}\n${listStudent}`;
        navigator.clipboard.writeText(finalContent);
        toast.success("Đã copy danh sách chưa làm!");
    };

    // --- COPY DANH SÁCH ĐÃ LÀM (KÈM TUYÊN DƯƠNG) ---
    const handleCopySubmittedNames = () => {
        const header = `🎉 BẢNG VÀNG THÀNH TÍCH - ${testName || "Kiểm tra"} 🎉\n-----------------------------------`;

        const listText = submittedList.map((item, index) => {
            const studentName = item.user?.fullName || item.user?.username || "Ẩn danh";
            const score = item.score;

            // Xử lý Top 3
            if (index === 0) {
                return `🥇 QUÁN QUÂN: ${studentName} - ${score} điểm (Xuất sắc)`;
            } else if (index === 1) {
                return `🥈 Á QUÂN: ${studentName} - ${score} điểm (Tuyệt vời)`;
            } else if (index === 2) {
                return `🥉 QUÝ QUÂN: ${studentName} - ${score} điểm (Rất tốt)`;
            } else {
                // Các bạn còn lại
                return `${index + 1}. ${studentName} (${score} điểm)`;
            }
        }).join("\n");

        const finalContent = `${header}\n${listText}`;
        navigator.clipboard.writeText(finalContent);
        toast.success("Đã copy bảng thành tích!");
    };

    // Tính phần trăm
    const percent = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

    if (loading) return <div className="py-6 flex justify-center"><Spin /></div>;

    return (
        <Card
            className="mb-8 shadow-sm rounded-xl border border-slate-200 overflow-hidden"
            bodyStyle={{ padding: 0 }}
        >
            {/* --- HEADER: TIẾN ĐỘ --- */}
            <div className="bg-white p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full">
                    <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-slate-700">Tiến độ nộp bài</span>
                        </div>
                        <span className="font-semibold text-slate-500">
                            <span className="text-blue-600 text-lg">{submittedCount}</span> / {totalStudents} đã nộp
                        </span>
                    </div>
                    <Progress
                        percent={percent}
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        strokeWidth={10}
                        status="active"
                        className="m-0"
                    />
                </div>
            </div>

            {/* --- BODY: DANH SÁCH --- */}
            <div className="p-5 bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                    <div className="flex items-center gap-2 text-slate-600">
                        <WarningOutlined className="text-orange-500" />
                        <span className="font-medium">Danh sách chưa làm bài ({unsubmittedStudents.length}):</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Tooltip title="Làm mới dữ liệu">
                            <Button icon={<ReloadOutlined />} onClick={fetchData} className="bg-white border-slate-200 hover:text-blue-600" />
                        </Tooltip>

                        {/* NÚT MỚI: COPY ĐÃ LÀM */}
                        <Button
                            icon={<TrophyOutlined />}
                            onClick={handleCopySubmittedNames}
                            disabled={submittedList.length === 0}
                            className="bg-white text-yellow-600 border-yellow-200 hover:border-yellow-500 hover:text-yellow-700 hover:bg-yellow-50"
                        >
                            Copy danh sách học sinh đã làm bài bài
                        </Button>

                        {/* NÚT CŨ: COPY CHƯA LÀM */}
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleCopyUnsubmittedNames}
                            disabled={unsubmittedStudents.length === 0}
                            className="bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                        >
                            Copy danh sách học sinh chưa làm
                        </Button>
                    </div>
                </div>

                {unsubmittedStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-green-50 rounded-xl border border-green-100 border-dashed">
                        <CheckCircleFilled className="text-4xl text-green-500 mb-2" />
                        <span className="text-green-700 font-semibold">Tuyệt vời! Tất cả học sinh đã hoàn thành bài thi.</span>
                    </div>
                ) : (
                    /* GRID HỌC SINH */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {unsubmittedStudents.map((student) => (
                            <div
                                key={student._id}
                                className="group relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex items-center gap-3 cursor-default"
                            >
                                <Badge dot status="warning" offset={[-5, 30]}>
                                    <Avatar
                                        size={42}
                                        icon={<UserOutlined />}
                                        className="bg-orange-100 text-orange-600 flex-shrink-0"
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`}
                                    />
                                </Badge>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors" title={student.fullName}>
                                        {student.fullName}
                                    </div>
                                    {/* Thêm username cho dễ nhận diện */}
                                    <div className="text-xs text-slate-400">@{student.username}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}