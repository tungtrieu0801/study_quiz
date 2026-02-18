import React from "react";
import { Drawer, Tag, Typography, Button, Image, Alert } from "antd";
import { CheckCircleOutlined, BookOutlined, EditOutlined, FileTextOutlined, AppstoreOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const QuestionDetailDrawer = ({ open, onClose, question, tags, tests, onEdit }) => {
    if (!question) return null;

    const getTagName = (id) => tags.find(t => t._id === id)?.name;
    const getTestTitle = (id) => tests.find(t => t._id === id)?.title;

    const handleEditClick = () => {
        onClose();
        onEdit(question);
    };

    // Helper: Preview Fill Blank
    const renderFillBlankPreview = (content, answers) => {
        if (!content) return "";
        const parts = content.split('___');
        const ansArray = Array.isArray(answers) ? answers : [answers];

        return (
            <span className="leading-8 text-base">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < parts.length - 1 && (
                            <span className="mx-1 px-2 py-0.5 bg-green-100 text-green-700 font-bold border-b-2 border-green-500 rounded">
                                {ansArray[index] || "..."}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </span>
        );
    };

    // Helper: Render Option Row
    const renderOptionRow = (label, text, isCorrect) => (
        <div key={label} className={`flex items-center gap-3 p-3 rounded-md border transition-all ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'}`}>
            <span className={`font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {label}
            </span>
            <div className="flex-1 text-slate-700 font-medium">{text}</div>
            {isCorrect && <CheckCircleOutlined className="text-green-500 text-xl" />}
        </div>
    );

    const renderAnswerSection = () => {
        const { type, options, answer } = question;

        switch (type) {
            case 'SINGLE_CHOICE':
                return (
                    <div className="flex flex-col gap-2">
                        {options?.map((opt, idx) => renderOptionRow(['A','B','C','D'][idx], opt, answer === opt))}
                    </div>
                );

            case 'MULTIPLE_SELECT':
                return (
                    <div className="flex flex-col gap-2">
                        <Alert message="Câu hỏi chọn nhiều đáp án" type="info" showIcon className="mb-2" />
                        {options?.map((opt, idx) => {
                            const isCorrect = Array.isArray(answer) ? answer.includes(opt) : answer === opt;
                            return renderOptionRow(['A','B','C','D'][idx], opt, isCorrect);
                        })}
                    </div>
                );

            case 'TRUE_FALSE':
                const boolAns = String(answer).toLowerCase() === 'true';
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border text-center font-bold text-lg ${boolAns ? 'bg-green-100 border-green-500 text-green-700' : 'opacity-50 border-slate-200'}`}>
                            ĐÚNG (TRUE)
                        </div>
                        <div className={`p-4 rounded-lg border text-center font-bold text-lg ${!boolAns ? 'bg-green-100 border-green-500 text-green-700' : 'opacity-50 border-slate-200'}`}>
                            SAI (FALSE)
                        </div>
                    </div>
                );

            case 'FILL_IN_THE_BLANK':
                return (
                    <div className="flex flex-col gap-3">
                        <Alert
                            message="Xem trước đáp án"
                            description={renderFillBlankPreview(question.content, answer)}
                            type="success"
                        />
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                            <p className="text-sm text-slate-500 mb-1">Các từ cần điền:</p>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(answer) ? answer : [answer]).map((ans, idx) => (
                                    <Tag key={idx} color="blue" className="text-sm py-1 px-2">#{idx+1}: <b>{ans}</b></Tag>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'SHORT_ANSWER':
                return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-semibold mb-1">Đáp án mẫu:</p>
                        <Text className="text-lg text-slate-800">{answer}</Text>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <Drawer
            title={<div className="flex items-center gap-2"><AppstoreOutlined /> Chi tiết câu hỏi</div>}
            placement="right"
            onClose={onClose}
            open={open}
            width={700}
            extra={<Button type="primary" onClick={handleEditClick} icon={<EditOutlined />}>Chỉnh sửa</Button>}
        >
            <div className="flex flex-col gap-6">
                <div>
                    <div className="flex gap-2 mb-3 flex-wrap">
                        <Tag color="purple" className="font-bold">{question.type?.replace('_', ' ')}</Tag>
                        {question.gradeLevel && <Tag color="blue">Lớp {question.gradeLevel}</Tag>}
                        {question.tags?.map(id => <Tag key={id} color="cyan">#{getTagName(id)}</Tag>)}
                    </div>
                    <Paragraph className="text-lg font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {question.content}
                    </Paragraph>
                    {question.imageUrl && (
                        <div className="mt-3 flex justify-center bg-slate-100 rounded-lg p-2 border border-slate-200">
                            <Image src={question.imageUrl} style={{ maxHeight: '300px', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <Title level={5} className="mb-3 text-slate-700">Đáp án:</Title>
                    {renderAnswerSection()}
                </div>

                {question.solution && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <Title level={5} className="flex items-center gap-2 text-blue-700 m-0 mb-2"><BookOutlined /> Lời giải:</Title>
                        <Text className="text-slate-700 italic">{question.solution}</Text>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100 text-slate-400 text-xs">
                    ID: {question._id} | Ngày tạo: {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                </div>
            </div>
        </Drawer>
    );
};

export default QuestionDetailDrawer;