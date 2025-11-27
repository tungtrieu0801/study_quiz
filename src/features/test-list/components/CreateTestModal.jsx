import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button } from "antd";

const CreateTestModal = ({ open, onCancel, onCreate, loading }) => {
    const [form] = Form.useForm();

    // Reset form khi đóng/mở modal
    useEffect(() => {
        if (!open) form.resetFields();
    }, [open, form]);

    const handleFinish = (values) => {
        onCreate(values);
    };

    return (
        <Modal title="Tạo đề thi mới" open={open} onCancel={onCancel} footer={null} centered width={600}>
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                <Form.Item label="Tên bài kiểm tra" name="title" rules={[{ required: true }]}>
                    <Input size="large" className="rounded-xl"/>
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Thời gian (phút)" name="duration" rules={[{ required: true }]}>
                        <InputNumber size="large" className="w-full rounded-xl"/>
                    </Form.Item>
                    <Form.Item label="Khối lớp" name="gradeLevel" rules={[{ required: true }]}>
                        <Select size="large" className="rounded-xl">
                            {[1,2,3,4,5].map(g=><Select.Option key={g} value={g.toString()}>Khối {g}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </div>
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={4} className="rounded-xl"/>
                </Form.Item>
                <div className="flex justify-end gap-3 pt-4">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Tạo</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTestModal;