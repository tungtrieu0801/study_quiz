import React from "react";
import { Card, Tag } from "antd";
import { CheckCircleOutlined, ReadOutlined, SettingOutlined, ClockCircleOutlined, TrophyOutlined, ArrowRightOutlined } from "@ant-design/icons";

const TestCard = ({ test, isAdmin, onClick }) => {
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
            {test.isTaken && <div className="absolute top-0 right-0 bg-slate-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1"><CheckCircleOutlined /> ĐÃ LÀM</div>}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex justify-between items-start mb-4">
                <Tag color={getGradeColor(test.gradeLevel)} className="px-3 py-1 rounded-full border-none bg-slate-100 m-0">
                    <ReadOutlined /> {test.gradeLevel ? `Khối ${test.gradeLevel}` : "Đại trà"}
                </Tag>
                {isAdmin && <div className="text-slate-400 bg-slate-100 p-1.5 rounded-md"><SettingOutlined /></div>}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {test.title || "Không có tên"}
            </h3>
            <div className="flex-grow">
                <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">{test.description || "Không có mô tả."}</p>
            </div>
            <div className="h-px w-full bg-slate-100 my-4" />

            <div className="flex items-center justify-between text-slate-400 text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <ClockCircleOutlined className="text-blue-500" /> <span className="font-medium text-slate-600">{test.duration || "N/A"}</span>
                    </div>
                </div>
                {test.isTaken ? (
                    <div className="font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                        <TrophyOutlined className="text-yellow-500"/> {test.score} điểm
                    </div>
                ) : (
                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 text-blue-600 font-medium flex items-center gap-1">
                        {isAdmin ? "Quản lý" : "Làm bài"} <ArrowRightOutlined />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TestCard;