import React from "react";
import { Result, Tag, Button } from "antd";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const SummaryResult = ({ result, onReview, onBack, testTitle }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200"
        >
            <Result
                status="success"
                title="Nộp bài thành công!"
                subTitle={<span>Kết quả bài thi: <strong>{testTitle}</strong> đã được ghi nhận.</span>}
                extra={[
                    <div key="score" className="mb-6">
                        <div className="text-slate-500 mb-2">Điểm số cuối cùng</div>
                        <div className="text-6xl font-bold text-blue-600 mb-2">
                            {result.score}<span className="text-2xl text-slate-400">/10</span>
                        </div>
                        <div className="flex justify-center gap-4 text-sm font-medium">
                            <Tag color="green" className="px-3 py-1 text-base">Đúng: {result.correctCount}</Tag>
                            <Tag color="default" className="px-3 py-1 text-base">Tổng: {result.total}</Tag>
                        </div>
                    </div>,
                    <Button key="review" type="primary" size="large" icon={<EyeOutlined />} className="w-full mb-3 bg-blue-600 h-12 rounded-xl" onClick={onReview}>
                        Xem chi tiết đáp án
                    </Button>,
                    <Button key="back" size="large" icon={<ArrowLeftOutlined />} className="w-full h-12 rounded-xl" onClick={onBack}>
                        Quay về trang chủ
                    </Button>
                ]}
            />
        </motion.div>
    </div>
);

export default SummaryResult;