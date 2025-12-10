import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const EditTestModal = ({ open, onCancel, onUpdate, loading, testData }) => {
    const [form] = Form.useForm();

    // Khi testData thay đổi (khi bấm sửa bài khác), reset form về giá trị cũ
    useEffect(() => {
        if (open && testData) {
            form.setFieldsValue({
                title: testData.title,
                description: testData.description,
                duration: testData.duration,
                gradeLevel: testData.gradeLevel,
                // Thêm các trường khác nếu cần
            });
        }
    }, [open, testData, form]);

    const handleFinish = (values) => {
        // Gọi hàm update ở component cha
        onUpdate(testData._id, values);
    };

    return (
        <Modal
            title="Cập nhật thông tin đề thi"
            open={open}
            onCancel={onCancel}
            footer={null} // Tắt footer mặc định để dùng nút trong Form
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
            >
                <Form.Item
                    label="Tên đề thi"
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề thi!' }]}
                >
                    <Input placeholder="Nhập tên đề thi..." />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Thời gian (phút)"
                        name="duration"
                        rules={[{ required: true, message: 'Nhập thời gian!' }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <Form.Item
                        label="Khối lớp"
                        name="gradeLevel"
                        rules={[{ required: true, message: 'Chọn khối lớp!' }]}
                    >
                        <Select placeholder="Chọn khối">
                            <Option value={10}>Khối 10</Option>
                            <Option value={11}>Khối 11</Option>
                            <Option value={12}>Khối 12</Option>
                            <Option value="Đại trà">Đại trà</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    label="Mô tả"
                    name="description"
                >
                    <TextArea rows={4} placeholder="Mô tả nội dung bài thi..." />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu thay đổi
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditTestModal;