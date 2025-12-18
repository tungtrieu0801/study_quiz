import React from 'react';
import { Modal, Card, Typography } from 'antd';
import {
    CheckCircleOutlined,
    OrderedListOutlined,
    EditOutlined,
    DashOutlined,
    CheckSquareOutlined
} from '@ant-design/icons';

const { Meta } = Card;
const { Title } = Typography;

const QUESTION_TYPES = [
    { type: 'SINGLE_CHOICE', label: 'Trắc nghiệm 1 đáp án', icon: <CheckCircleOutlined />, desc: 'Chọn 1 đáp án đúng trong 4 lựa chọn' },
    { type: 'MULTIPLE_SELECT', label: 'Trắc nghiệm nhiều đáp án', icon: <OrderedListOutlined />, desc: 'Chọn nhiều đáp án đúng' },
    { type: 'TRUE_FALSE', label: 'Đúng / Sai', icon: <CheckSquareOutlined />, desc: 'Xác định mệnh đề là Đúng hay Sai' },
    { type: 'SHORT_ANSWER', label: 'Trả lời ngắn', icon: <EditOutlined />, desc: 'Học sinh nhập câu trả lời chính xác' },
    { type: 'FILL_IN_THE_BLANK', label: 'Điền vào chỗ trống', icon: <DashOutlined />, desc: 'Điền từ còn thiếu vào đoạn văn' },
];

const QuestionTypeModal = ({ open, onCancel, onSelect }) => {
    return (
        <Modal
            title={<Title level={4}>Chọn loại câu hỏi muốn tạo</Title>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {QUESTION_TYPES.map((item) => (
                    <Card
                        key={item.type}
                        hoverable
                        className="text-center border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                        onClick={() => onSelect(item.type)}
                    >
                        <div className="text-3xl text-blue-600 mb-2">{item.icon}</div>
                        <Meta title={item.label} description={item.desc} />
                    </Card>
                ))}
            </div>
        </Modal>
    );
};

export default QuestionTypeModal;