import React from "react";
import { Card, Tag, Switch, Popconfirm, Tooltip } from "antd";
import {
    CheckCircleOutlined,
    ReadOutlined,
    SettingOutlined,
    CalendarOutlined, // Đổi icon Clock thành Calendar cho ngày tạo
    TrophyOutlined,
    ArrowRightOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    FireOutlined // Icon cho hiệu ứng pháo hoa/nổi bật
} from "@ant-design/icons";

const TestCard = ({ test, isTeacher, onClick, onActivate, isActivating, onEdit }) => {

    const isLive = test.status === 'activate' || !test.status;

    const getGradeColor = (grade) => {
        if (!grade) return "blue";
        if (grade.toString().includes("12")) return "purple";
        if (grade.toString().includes("10")) return "cyan";
        return "blue";
    };

    // Hàm format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "Mới cập nhật";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN'); // Hiển thị dạng dd/mm/yyyy
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
            {/* Ribbon trạng thái đã làm */}
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

            {/* Header Area */}
            <div className="flex justify-between items-start mb-4">
                {/* Left: Grade Tag */}
                <Tag color={getGradeColor(test.gradeLevel)} className="px-3 py-1 rounded-full border-none bg-slate-100 m-0 font-medium h-fit">
                    <ReadOutlined /> {test.gradeLevel ? `Khối ${test.gradeLevel}` : "Đại trà"}
                </Tag>

                {/* Right: Edit Button & Fireworks Duration */}
                <div className="flex flex-col items-end gap-2 z-20">
                    {/* --- NÚT SỬA (EDIT BUTTON) + TEXT --- */}
                    {isTeacher && (
                        <div
                            className="text-slate-500 bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-sm cursor-pointer px-2 py-1 rounded-lg transition-all flex items-center gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(test);
                            }}
                        >
                            <SettingOutlined />
                            <span className="text-xs font-semibold">Chỉnh sửa</span>
                        </div>
                    )}
                </div>
            </div>
            {/* --- HIỆU ỨNG PHÁO HOA (THỜI GIAN LÀM BÀI) --- */}
            {/* Nằm ngay bên dưới nút cài đặt */}
            <div className="h-10 bg-gradient-to-r from-fuchsia-500 via-red-500 to-orange-400 text-white text-sm font-bold px-2 py-1 rounded-2xl shadow-md flex items-center gap-1 animate-pulse mb-6">
                <FireOutlined /> {'Thời gian làm bài: ' + test.duration || 15} phút
            </div>
            {/* Content */}
            <h3 className="text-2xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors mt-[-10px]">
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

                {/* --- Left Side: NGÀY TẠO ĐỀ (Thay cho số phút cũ) --- */}
                <div className="flex items-center gap-1.5" title="Ngày tạo đề">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="font-medium text-slate-500">
                        {formatDate(test.createdAt || test.created_at)}
                    </span>
                </div>

                {/* Right Side: Action Button */}
                {isTeacher ? (
                    // --- GIAO DIỆN CHO TEACHER ---
                    <div
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className={`text-xs font-semibold flex items-center gap-1 ${isLive ? 'text-green-600' : 'text-orange-500'}`}>
                            {isLive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            {isLive ? "Đã kích hoạt" : "Đang ẩn"}
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
                                description="Học sinh sẽ nhìn thấy đề này ngay lập tức."
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