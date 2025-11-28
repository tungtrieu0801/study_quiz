import React from "react";
import { Modal, Table, Button } from "antd";
import { BankOutlined } from "@ant-design/icons";

export default function AddQuestionModal({
                                             open,
                                             onCancel,
                                             allQuestions,
                                             onAdd,
                                             saving,
                                             selectedIds,
                                             setSelectedIds
                                         }) {
    const modalColumns = [
        { title: 'Nội dung', dataIndex: 'content' },
        { title: 'Tags', dataIndex: 'tags', render: t => (t || []).length + ' tags' }
    ];

    return (
        <Modal
            title={<div className="flex items-center gap-2 text-lg font-bold"><BankOutlined className="text-blue-600" /> Ngân hàng câu hỏi</div>}
            open={open}
            onCancel={onCancel}
            width={900}
            centered
            footer={[
                <Button key="c" onClick={onCancel}>Hủy</Button>,
                <Button key="s" type="primary" onClick={onAdd} loading={saving}>
                    Thêm {selectedIds.length} câu
                </Button>
            ]}
        >
            <Table
                rowKey="_id"
                columns={modalColumns}
                dataSource={allQuestions}
                rowSelection={{
                    selectedRowKeys: selectedIds,
                    onChange: setSelectedIds
                }}
                scroll={{ y: 350 }}
                pagination={{ pageSize: 5 }}
                size="small"
                bordered
            />
        </Modal>
    );
}