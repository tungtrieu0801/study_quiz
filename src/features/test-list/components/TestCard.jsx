import React from "react";
import { Card, Tag, Switch, Popconfirm, Tooltip } from "antd";
import {
    CheckCircleOutlined,
    ReadOutlined,
    SettingOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    ArrowRightOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from "@ant-design/icons";

// Thêm prop onEdit vào đây
const TestCard = ({ test, isTeacher, onClick, onActivate, isActivating, onEdit }) => {

    // Logic: Đề được coi là Active nếu status = 'activate' HOẶC không có trường status (đề cũ)
    const isLive = test.status === 'activate' || !test.status;

    const getGradeColor = (grade) => {
        if (!grade) return "blue";
        if (grade.toString().includes("12")) return "purple";
        if (grade.toString().includes("10")) return "cyan";
        return "blue";
    };

    return (
        <Card
            hoverable
            className={`h-full rounded-2xl border transition-all duration-300 group overflow-hidden flex flex-col relative
                ${test.isTaken ? 'bg-gray-50 border-gray-200' : 'bg-white border-slate-200 hover:shadow-xl hover:-translate-y-1'}
            `}
            onClick={onClick}
            styles={{ body: { padding: "24px", height: "100%", display: "flex", flexDirection: "column" } }}
        >
            {/* Ribbon trạng thái đã làm (cho học sinh) */}
            {test.isTaken && !isTeacher && (
                <div className="absolute top-0 right-0 bg-slate-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                    <CheckCircleOutlined /> ĐÃ LÀM
                </div>
            )}

            {/* Decoration Bar */}
            <div className={`absolute top-0 left-0 w-full h-1 transition-opacity duration-300
                ${isLive ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-orange-300'}
                ${isTeacher ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
            `} />

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <Tag color={getGradeColor(test.gradeLevel)} className="px-3 py-1 rounded-full border-none bg-slate-100 m-0 font-medium">
                    <ReadOutlined /> {test.gradeLevel ? `Khối ${test.gradeLevel}` : "Đại trà"}
                </Tag>

                {/* --- NÚT SỬA (EDIT BUTTON) --- */}
                {isTeacher && (
                    <div
                        className="text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 cursor-pointer p-1.5 rounded-md transition-all"
                        onClick={(e) => {
                            e.stopPropagation(); // Chặn click lan ra Card cha
                            onEdit(test); // Gọi hàm sửa
                        }}
                    >
                        <SettingOutlined />
                    </div>
                )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {test.title || "Không có tên"}
            </h3>
            <div className="flex-grow">
                <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {test.description || "Không có mô tả."}
                </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-100 my-4" />

            {/* Footer */}
            <div className="flex items-center justify-between text-slate-400 text-sm">
                {/* Left Side: Duration */}
                <div className="flex items-center gap-1.5">
                    <ClockCircleOutlined className={isLive ? "text-blue-500" : "text-orange-400"} />
                    <span className="font-medium text-slate-600">{test.duration || "--"}</span>
                </div>

                {/* Right Side: Action Button */}
                {isTeacher ? (
                    // --- GIAO DIỆN CHO TEACHER (TOGGLE) ---
                    <div
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()} // Chặn click lan ra Card
                    >
                        <span className={`text-xs font-semibold flex items-center gap-1 ${isLive ? 'text-green-600' : 'text-orange-500'}`}>
                            {isLive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            {isLive ? "Đã kích hoạt" : "Đang ẩn với học sinh"}
                        </span>

                        {isLive ? (
                            <Tooltip title="Đề thi đang hiển thị công khai">
                                <Switch
                                    checked={true}
                                    disabled
                                    size="small"
                                    className="bg-green-500 opacity-80"
                                />
                            </Tooltip>
                        ) : (
                            <Popconfirm
                                title="Bật hiển thị đề thi?"
                                description="Sau khi bật, học sinh sẽ nhìn thấy đề này ngay lập tức."
                                onConfirm={() => onActivate(test._id)}
                                okText="Bật ngay"
                                cancelText="Hủy"
                                placement="topRight"
                                okButtonProps={{ loading: isActivating }}
                            >
                                <Switch
                                    checked={false}
                                    size="small"
                                    loading={isActivating}
                                />
                            </Popconfirm>
                        )}
                    </div>
                ) : (
                    // --- GIAO DIỆN CHO HỌC SINH ---
                    test.isTaken ? (
                        <div className="font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <TrophyOutlined className="text-yellow-500"/> {test.score} điểm
                        </div>
                    ) : (
                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-blue-600 font-medium flex items-center gap-1">
                            Làm bài <ArrowRightOutlined />
                        </div>
                    )
                )}
            </div>
        </Card>
    );
};

export default TestCard;