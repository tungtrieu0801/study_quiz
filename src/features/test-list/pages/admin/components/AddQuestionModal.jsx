import React from "react";
import { Modal, Table, Button, Badge } from "antd";
import { PlusOutlined, DatabaseOutlined, CheckCircleOutlined } from "@ant-design/icons";

export default function AddQuestionModal({
                                             open,
                                             onCancel,
                                             loading,
                                             questions,
                                             pagination, // { current, pageSize, total }
                                             onPageChange,
                                             existingQuestionIds = [],
                                             selectedIds,
                                             setSelectedIds,
                                             onAdd,
                                             saving
                                         }) {
    // --- CẤU HÌNH CỘT ---
    const columns = [
        {
            title: "Danh sách câu hỏi",
            dataIndex: "content",
            key: "content",
            render: (content, record) => {
                const isSelected = selectedIds.includes(record._id);

                // Logic check đáp án đúng
                const checkIsCorrect = (opt) => {
                    if (Array.isArray(record.answer)) return record.answer.includes(opt);
                    return record.answer === opt;
                };

                return (
                    <div className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-2 text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>

                        {/* Phần Câu hỏi */}
                        <div className="flex items-baseline gap-1 min-w-0 flex-1">
                            <span className="font-bold text-slate-900 shrink-0">Câu hỏi:</span>
                            <span
                                className="truncate-2-lines" // CSS class tự tạo hoặc để mặc định
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </div>

                        {/* Phần Đáp án (Hiển thị ngang hàng) */}
                        <div className="flex items-baseline gap-1 shrink-0 md:max-w-[40%] text-slate-500">
                            <span className="font-bold text-slate-900 shrink-0">Đáp án:</span>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {record.options && record.options.map((opt, idx) => {
                                    const isCorrect = checkIsCorrect(opt);
                                    if (!isCorrect) return null; // Mẹo: Nếu chỉ muốn hiện đáp án đúng thì dùng dòng này.
                                    // Còn nếu muốn hiện tất cả đáp án dạng text thì dùng code dưới:

                                    /* Nếu bạn muốn hiện TẤT CẢ đáp án nằm ngang:
                                     return (
                                        <span key={idx} className={isCorrect ? "font-bold text-green-600 underline" : ""}>
                                            {String.fromCharCode(65 + idx)}. {opt}
                                        </span>
                                     )
                                    */

                                    // HIỆN TẠI: Tôi để hiển thị chỉ ĐÁP ÁN ĐÚNG cho gọn nhất (theo ý "đáp án câu hỏi")
                                    // Hoặc hiển thị list nhưng highlight cái đúng:
                                    return (
                                        <span key={idx} className="font-bold text-green-600 flex items-center gap-1">
                                            {opt} <CheckCircleOutlined />
                                        </span>
                                    );
                                })}

                                {/* Fallback nếu muốn hiện full options dạng text rút gọn:
                                    Bỏ comment đoạn dưới nếu muốn hiện kiểu: A. 1  B. 2 ...
                                */}
                                {/* {record.options.map((opt, idx) => {
                                     const isCorrect = checkIsCorrect(opt);
                                     return (
                                         <span key={idx} className={isCorrect ? "text-green-600 font-bold" : "text-slate-400"}>
                                             {String.fromCharCode(65 + idx)}. {opt}
                                         </span>
                                     )
                                })} */}
                            </div>
                        </div>
                    </div>
                );
            }
        }
    ];

    // --- XỬ LÝ CLICK DÒNG ---
    const onRowClick = (record) => {
        if (existingQuestionIds.includes(record._id)) return;
        const isSelected = selectedIds.includes(record._id);
        setSelectedIds(isSelected ? selectedIds.filter(id => id !== record._id) : [...selectedIds, record._id]);
    };

    // --- CẤU HÌNH CHECKBOX ---
    const rowSelection = {
        selectedRowKeys: selectedIds,
        onChange: (newSelectedRowKeys) => setSelectedIds(newSelectedRowKeys),
        preserveSelectedRowKeys: true,
        columnWidth: 40,
        getCheckboxProps: (record) => ({ disabled: existingQuestionIds.includes(record._id) }),
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-lg text-slate-800">
                    <DatabaseOutlined className="text-blue-600" />
                    <span className="font-bold">Ngân hàng câu hỏi</span>
                    <Badge count={pagination.total} showZero style={{ backgroundColor: '#f5f5f5', color: '#999' }} />
                </div>
            }
            open={open}
            onCancel={onCancel}
            width={1000} // Tăng chiều rộng chút để hiển thị 1 dòng đẹp hơn
            centered
            className="top-5"
            footer={[
                <div key="footer" className="flex justify-between items-center w-full px-2">
                    <span className="text-slate-500">Đã chọn: <b className="text-blue-600">{selectedIds.length}</b> câu</span>
                    <div className="flex gap-2">
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" onClick={onAdd} loading={saving} disabled={selectedIds.length === 0} icon={<PlusOutlined />} className="bg-blue-600">
                            Thêm vào đề
                        </Button>
                    </div>
                </div>
            ]}
        >
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={questions}
                loading={loading}
                rowSelection={rowSelection}
                onRow={(record) => ({
                    onClick: () => onRowClick(record),
                    className: `cursor-pointer transition-colors ${existingQuestionIds.includes(record._id) ? 'bg-slate-100 opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`
                })}
                pagination={{
                    current: pagination.current,
                    pageSize: 10,
                    total: pagination.total,
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} câu`
                }}
                onChange={onPageChange}
                scroll={{ y: 500 }}
                size="small" // Dùng size small cho gọn
                bordered
            />
        </Modal>
    );
}