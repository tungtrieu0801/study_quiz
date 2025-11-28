import React, { useEffect, useState } from "react";
import { Card, Avatar, Tag, Button, Spin, Tooltip, Progress, Empty, Badge } from "antd";
import {
    UserOutlined,
    CopyOutlined,
    ReloadOutlined,
    WarningOutlined,
    CheckCircleFilled
} from "@ant-design/icons";
import instance from "../../../../../shared/lib/axios.config";
import {toast} from "react-toastify"; // Kiểm tra lại đường dẫn import này nhé

export default function UnsubmittedStudentsWidget({ testName, testId, gradeLevel }) {
    const [loading, setLoading] = useState(false);
    const [unsubmittedStudents, setUnsubmittedStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [submittedCount, setSubmittedCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Lấy thống kê
            const statsRes = await instance.get(`/testList/${testId}/statistics`);
            const leaderboard = statsRes.data.success ? statsRes.data.data.leaderboard : [];
            const submittedIds = leaderboard.map(item => item.user._id);
            setSubmittedCount(submittedIds.length);

            // 2. Lấy danh sách học sinh
            const studentParams = { page: 0, size: 1000 };
            // if (gradeLevel) studentParams.gradeLevel = gradeLevel;

            const studentRes = await instance.get("/user", { params: studentParams });
            const allStudents = studentRes.data.data.students || [];
            setTotalStudents(allStudents.length);

            // 3. Lọc người chưa nộp
            const notSubmitted = allStudents.filter(student => !submittedIds.includes(student._id));
            setUnsubmittedStudents(notSubmitted);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (testId) fetchData();
    }, [testId, gradeLevel]);

    const handleCopyNames = () => {
        const header = "Học sinh chưa làm đề kiểm tra " + testName + ":";
        const listStudent = unsubmittedStudents
            .map((s, index) => `${index + 1}. ${s.fullName}`)
            .join("\n");
        const finalContent = `${header}\n${listStudent}`;
        navigator.clipboard.writeText(finalContent);
        toast.success("Đã copy danh sách!");
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
                            {/*{gradeLevel && <Tag color="blue" className="rounded-full px-3">Khối {gradeLevel}</Tag>}*/}
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
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                        <WarningOutlined className="text-orange-500" />
                        <span className="font-medium">Danh sách chưa làm bài ({unsubmittedStudents.length}):</span>
                    </div>

                    <div className="flex gap-2">
                        <Tooltip title="Làm mới dữ liệu">
                            <Button icon={<ReloadOutlined />} onClick={fetchData} className="bg-white border-slate-200 hover:text-blue-600" />
                        </Tooltip>
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleCopyNames}
                            disabled={unsubmittedStudents.length === 0}
                            className="bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                        >
                            Copy danh sách để gửi vào nhóm
                        </Button>
                    </div>
                </div>

                {unsubmittedStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-green-50 rounded-xl border border-green-100 border-dashed">
                        <CheckCircleFilled className="text-4xl text-green-500 mb-2" />
                        <span className="text-green-700 font-semibold">Tuyệt vời! Tất cả học sinh đã hoàn thành bài thi.</span>
                    </div>
                ) : (
                    /* GRID HỌC SINH - Sử dụng CSS Grid của Tailwind */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
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
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`} // (Optional) Thêm avatar ngẫu nhiên cho sinh động
                                    />
                                </Badge>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors" title={student.fullName}>
                                        {student.fullName}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}