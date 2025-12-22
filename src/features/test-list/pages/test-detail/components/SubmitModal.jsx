import React from "react";
import { Modal } from "antd";
import { WarningOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const SubmitModal = ({ config, onCancel, onOk }) => {
    return (
        <Modal
            title={<div className="flex items-center gap-2 text-lg font-bold text-slate-800">{config.type === 'block' ? <WarningOutlined className="text-red-500 text-xl"/> : <ExclamationCircleOutlined className="text-orange-500 text-xl"/>}{config.type === 'block' ? "Chưa hoàn thành bài thi" : "Xác nhận nộp bài"}</div>}
            open={config.visible}
            onCancel={onCancel}
            onOk={onOk}
            okText={config.type === 'block' ? "Đã hiểu, làm tiếp" : "Nộp ngay"}
            cancelText={config.type === 'block' ? null : "Làm tiếp"}
            okButtonProps={{ className: config.type === 'block' ? "bg-blue-600" : "bg-green-600 hover:bg-green-500 border-none", size: "large" }}
            cancelButtonProps={{ style: { display: config.type === 'block' ? 'none' : 'inline-block' }, size: "large" }}
            centered zIndex={3000}
        >
            <div className="py-4 text-base">
                {config.type === 'block' ? (
                    <div><p className="mb-2">Bạn vẫn còn <strong className="text-red-600 text-lg">{config.count}</strong> câu hỏi chưa hoàn thành.</p><p className="text-slate-500 text-sm">Vui lòng kiểm tra lại các câu hỏi (đặc biệt là câu điền từ/chọn nhiều).</p></div>
                ) : (
                    <p>Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài và kết thúc phiên làm việc này không?</p>
                )}
            </div>
        </Modal>
    );
};

export default SubmitModal;