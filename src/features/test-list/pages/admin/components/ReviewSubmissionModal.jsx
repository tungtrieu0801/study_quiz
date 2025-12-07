import React from "react";
import {Modal, Button, Avatar, Tag, Image} from "antd";
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export default function ReviewSubmissionModal({ open, onCancel, loading, data }) {
    const { student, score, questions, submissionDetails } = data;

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 border-b pb-3">
                    <Avatar size="large" style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                    <div>
                        <div className="text-lg font-bold text-slate-800">
                            {student?.fullName || student?.username || "Chi tiết bài làm"}
                        </div>
                        <div className="text-sm text-slate-500">
                            Điểm số: <Tag color={score >= 5 ? 'green' : 'red'} className="font-bold">{score}</Tag>
                        </div>
                    </div>
                </div>
            }
            open={open}
            onCancel={onCancel}
            width={800}
            centered
            footer={[<Button key="close" onClick={onCancel}>Đóng</Button>]}
            bodyStyle={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}
            zIndex={2000}
        >
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {questions.map((q, index) => {
                        const detail = submissionDetails.find(d => d.questionId === q._id);
                        const userAnswer = detail?.userAnswer;
                        const isCorrect = detail?.isCorrect;
                        const correctAnswer = q.answer || q.solution;

                        return (
                            <div key={q._id} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-700 text-base">Câu {index + 1}: <span className="font-normal">{q.content}</span></h4>
                                    {isCorrect ? <Tag color="success" icon={<CheckCircleOutlined />}>Đúng</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>Sai</Tag>}
                                </div>
                                {q.imageUrl && (
                                    <div className="mb-4">
                                        <Image
                                            className="bg-slate-50 rounded-lg border border-slate-100"
                                            src={q.imageUrl}
                                            height={300}
                                        />
                                    </div>
                                )}
                                {q.options && q.options.length > 0 && (
                                    <div className="ml-4 mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {q.options.map((opt, i) => {
                                            let optionStyle = "text-slate-600";
                                            if (opt === userAnswer && !isCorrect) optionStyle = "text-red-600 font-bold";
                                            if (opt === correctAnswer) optionStyle = "text-green-600 font-bold";
                                            return (<div key={i} className={`text-sm ${optionStyle}`}>{String.fromCharCode(65 + i)}. {opt}</div>)
                                        })}
                                    </div>
                                )}

                                <div className="mt-2 pt-2 border-t border-slate-200/50 text-sm flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-500 w-24">Học sinh chọn:</span>
                                        <span className={isCorrect ? 'text-green-700 font-bold' : 'text-red-600 font-bold line-through'}>{userAnswer || "(Bỏ trống)"}</span>
                                    </div>
                                    {!isCorrect && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-500 w-24">Đáp án đúng:</span>
                                            <span className="text-green-700 font-bold">{correctAnswer}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
}