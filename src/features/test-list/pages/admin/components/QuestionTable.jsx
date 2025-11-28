import React from "react";
import { Table, Tag, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function QuestionTable({ questions, loading, allTags, onRemove }) {
    const columns = [
        { title: 'STT', key: 'index', width: 60, align: 'center', render: (_, __, i) => i + 1 },
        { title: 'Nội dung', dataIndex: 'content', render: t => <span className="line-clamp-2">{t}</span> },
        { title: 'Đáp án', dataIndex: 'solution', width: 150, render: s => <Tag color="green">{s || "Chưa có"}</Tag> },
        {
            title: 'Tags',
            dataIndex: 'tags',
            width: 200,
            render: ids => (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(ids) && ids.map((id, i) => {
                        const t = allTags.find(tag => tag._id === id);
                        return <Tag key={i} color="geekblue">{t ? t.name : id}</Tag>
                    })}
                </div>
            )
        },
        {
            title: 'Hành động',
            width: 80,
            align: 'center',
            render: (_, r) => (
                <Popconfirm title="Gỡ khỏi đề?" onConfirm={() => onRemove(r._id)}>
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <Table
            rowKey="_id"
            columns={columns}
            dataSource={questions}
            loading={loading}
            pagination={false}
        />
    );
}