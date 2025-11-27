import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Checkbox, Button, message, Row, Col, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import instance from "../../../shared/lib/axios.config";

const QuestionFormModal = ({ open, onCancel, onSuccess, initialValues, tags, tests, refreshTags }) => {
    const [form] = Form.useForm();
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);

    // Reset form hoặc điền dữ liệu khi mở modal
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    tags: initialValues.tags || [],
                    // Antd Select Multiple tự động hiểu mảng ID này
                    testIds: initialValues.testIds || [],
                    options: initialValues.options || ["", "", "", ""]
                });
            } else {
                form.resetFields();
            }
            setNewTagName("");
        }
    }, [open, initialValues, form]);

    // API tạo tag riêng lẻ
    const createNewTagApi = async (tagName) => {
        if (!tagName.trim()) return;
        try {
            setCreatingTag(true);
            const res = await instance.post("/tag", {
                name: tagName,
                description: "Tự động tạo khi thêm câu hỏi"
            });
            if (res.data.success) {
                message.success("Đã tạo tag mới!");
                setNewTagName("");
                await refreshTags(); // Load lại list tag từ cha để cập nhật UI
                return res.data.data._id;
            }
        } catch (error) {
            message.error("Lỗi tạo tag: " + error.message);
            throw error;
        } finally {
            setCreatingTag(false);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            let finalTags = values.tags || [];

            // Logic: Nếu user nhập tag mới mà quên bấm nút "Thêm" thì tự tạo luôn
            if (newTagName.trim()) {
                try {
                    const newTagId = await createNewTagApi(newTagName);
                    if (newTagId) finalTags = [...finalTags, newTagId];
                } catch (e) {
                    return; // Dừng nếu lỗi
                }
            }

            // Trả data về component cha xử lý
            onSuccess({ ...values, tags: finalTags });
        } catch (error) {
            // Validate failed
        }
    };

    return (
        <Modal
            title={initialValues ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText={initialValues ? "Lưu thay đổi" : "Tạo mới"}
            width={800}
            centered
            maskClosable={false}
        >
            <Form form={form} layout="vertical" className="pt-2">
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true, message: "Nhập câu hỏi" }]}>
                            <Input.TextArea rows={3} placeholder="Nhập nội dung câu hỏi..." className="rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Khối lớp" name="gradeLevel" rules={[{ required: true }]}>
                            <Input placeholder="VD: 1, 2, 3..." className="rounded-lg"/>
                        </Form.Item>

                        {/* UPDATE: SELECT MULTIPLE CHO BÀI THI */}
                        {/*<Form.Item*/}
                        {/*    label="Thuộc bài thi (Chọn nhiều)"*/}
                        {/*    name="testIds"*/}
                        {/*    tooltip="Tìm kiếm và chọn các đề thi chứa câu hỏi này"*/}
                        {/*>*/}
                        {/*    <Select*/}
                        {/*        mode="multiple" // Cho phép chọn nhiều*/}
                        {/*        allowClear*/}
                        {/*        placeholder="Chọn các bài thi..."*/}
                        {/*        options={(tests || []).map(t => ({ label: t.title, value: t._id }))}*/}
                        {/*        maxTagCount="responsive"*/}
                        {/*        filterOption={(input, option) =>*/}
                        {/*            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())*/}
                        {/*        }*/}
                        {/*    />*/}
                        {/*</Form.Item>*/}
                    </Col>
                </Row>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                    <Form.Item label="Các lựa chọn đáp án" style={{marginBottom: 8}} required>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["A", "B", "C", "D"].map((opt, idx) => (
                                <Form.Item key={opt} name={["options", idx]} rules={[{ required: true, message: "Nhập đáp án" }]} noStyle>
                                    <Input prefix={<span className="font-bold text-blue-600 mr-2 w-4">{opt}.</span>} placeholder={`Lựa chọn ${opt}`} className="rounded-md" />
                                </Form.Item>
                            ))}
                        </div>
                    </Form.Item>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Đáp án đúng" name="answer" rules={[{ required: true }]}>
                            <Input placeholder="Nhập chính xác nội dung đáp án đúng" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Thuộc nhóm câu hỏi nào (Thêm mới hoặc chọn bên dưới)">
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Tên tag mới..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    onPressEnter={(e) => { e.preventDefault(); createNewTagApi(newTagName); }}
                                />
                                <Button onClick={() => createNewTagApi(newTagName)} loading={creatingTag} icon={<PlusOutlined />}>Thêm</Button>
                            </div>
                            <div className="border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto bg-white">
                                <Form.Item name="tags" noStyle>
                                    <Checkbox.Group className="w-full">
                                        <div className="flex flex-wrap gap-2">
                                            {(tags || []).map((t) => (
                                                <Checkbox key={t._id} value={t._id} className="select-none text-xs">{t.name}</Checkbox>
                                            ))}
                                        </div>
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Giải thích chi tiết" name="solution" rules={[{ required: true }]}>
                    <Input.TextArea rows={2} placeholder="Tại sao lại chọn đáp án này..." className="rounded-lg"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuestionFormModal;