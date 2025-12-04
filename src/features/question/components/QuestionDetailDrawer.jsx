import React from "react";
import {Drawer, Tag, Divider, Typography, Button, Image} from "antd";
import { CheckCircleOutlined, BookOutlined, EditOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuestionDetailDrawer = ({ open, onClose, question, tags, tests, onEdit }) => {
    if (!question) return null;

    const getTagName = (id) => tags.find(t => t._id === id)?.name;
    const getTestTitle = (id) => tests.find(t => t._id === id)?.title;

    // Xử lý khi bấm nút sửa: Đóng Drawer -> Mở Modal sửa
    const handleEditClick = () => {
        onClose();
        onEdit(question);
    };

    return (
        <Drawer
            title="Chi tiết câu hỏi"
            placement="right"
            onClose={onClose}
            open={open}
            width={600}
            extra={
                <Button type="primary" onClick={handleEditClick} icon={<EditOutlined />}>
                    Chỉnh sửa
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Header Info */}
                <div>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {question.gradeLevel && <Tag color="blue">Khối {question.gradeLevel}</Tag>}
                        {question.tags?.map(id => {
                            const name = getTagName(id);
                            return name ? <Tag key={id} color="cyan">#{name}</Tag> : null;
                        })}
                    </div>
                    <Title level={4} className="text-slate-800 mt-2">
                        {question.content}
                    </Title>
                    { question.imageUrl && (
                        <div className="bg-slate-50 rounded-lg border border-slate-100">
                            <Image
                                src={question.imageUrl}
                                alt={question.imageUrl}
                                style={{ maxHeight: '250px', objectFit: 'contain' }}
                                className="rounded-lg"
                                placeholder={
                                    <div className="flex items-center justify-center h-full bg-slate-200">
                                        Loading...
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Options */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <Title level={5} className="mb-4">Các lựa chọn:</Title>
                    <div className="flex flex-col gap-3">
                        {question.options?.map((opt, idx) => {
                            const labels = ['A', 'B', 'C', 'D'];
                            // Logic so sánh đáp án (giả sử lưu text)
                            const isCorrect = question.answer === opt;

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-md border 
                                        ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}
                                >
                                    <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs
                                        ${isCorrect ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {labels[idx]}
                                    </span>
                                    <Text className={isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}>
                                        {opt}
                                    </Text>
                                    {isCorrect && <CheckCircleOutlined className="text-green-500 ml-auto" />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Solution */}
                <div>
                    <Title level={5} className="flex items-center gap-2">
                        <BookOutlined className="text-blue-500"/> Giải thích chi tiết
                    </Title>
                    <div className="bg-blue-50 p-4 rounded-lg text-slate-700 italic border border-blue-100">
                        {question.solution || "Chưa có giải thích cho câu hỏi này."}
                    </div>
                </div>

                {/* Metadata - Bài thi liên quan */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                        <FileTextOutlined /> Thuộc các đề thi:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {question.testIds && question.testIds.length > 0 ? (
                            question.testIds.map(id => (
                                <Tag key={id} bordered={false} className="bg-gray-100 text-slate-600 m-0 py-1 px-2">
                                    {getTestTitle(id) || id}
                                </Tag>
                            ))
                        ) : (
                            <span className="text-slate-400 italic text-sm">Chưa gán vào đề thi nào</span>
                        )}
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

export default QuestionDetailDrawer;