import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Checkbox, Button, Row, Col, Upload, Radio, Select, message, Alert } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import questionApi from "../api/questionApi.js";
import { toast } from "react-toastify";

const QuestionFormModal = ({ open, onCancel, onSuccess, initialValues, questionType, tags, refreshTags }) => {
    const [form] = Form.useForm();
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);
    const [fileList, setFileList] = useState([]);

    // Title động
    const getTitle = () => {
        const labels = {
            'SINGLE_CHOICE': 'Trắc nghiệm 1 đáp án',
            'MULTIPLE_SELECT': 'Trắc nghiệm nhiều đáp án',
            'TRUE_FALSE': 'Đúng / Sai',
            'SHORT_ANSWER': 'Trả lời ngắn',
            'FILL_IN_THE_BLANK': 'Điền từ vào chỗ trống'
        };
        const typeLabel = labels[questionType] || questionType;
        return initialValues ? `Cập nhật: ${typeLabel}` : `Tạo mới: ${typeLabel}`;
    };

    // --- Reset & Load Data ---
    useEffect(() => {
        if (open) {
            setFileList([]);
            if (initialValues) {
                // Xử lý logic parse dữ liệu cũ
                let parsedAnswer = initialValues.answer;

                // True/False cần convert về Boolean
                if (initialValues.type === 'TRUE_FALSE') {
                    parsedAnswer = String(initialValues.answer).toLowerCase() === 'true';
                }

                form.setFieldsValue({
                    ...initialValues,
                    type: initialValues.type,
                    tags: initialValues.tags || [],
                    options: initialValues.options || ["", "", "", ""],
                    answer: parsedAnswer
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    type: questionType,
                    options: ["", "", "", ""],
                    // Fill in blank cần mảng rỗng ban đầu để hiện 1 dòng input
                    answer: questionType === 'FILL_IN_THE_BLANK' ? [""] : undefined
                });
            }
            setNewTagName("");
        }
    }, [open, initialValues, questionType, form]);

    // --- Paste Ảnh ---
    useEffect(() => {
        const handlePaste = (e) => {
            if (!open) return;
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.includes('image/')) {
                    const blob = item.getAsFile();
                    setFileList([{ uid: '-1', name: 'pasted.png', status: 'done', originFileObj: blob }]);
                    message.success("Đã dán ảnh!");
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [open]);

    const handleCreateNewTag = async (tagName) => {
        if (!tagName.trim()) return;
        setCreatingTag(true);
        try {
            await questionApi.createTag({ name: tagName, description: "Quick add" });
            toast.success("Đã thêm tag");
            setNewTagName("");
            await refreshTags();
        } catch (e) { toast.error("Lỗi tạo tag"); }
        finally { setCreatingTag(false); }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const submitData = {
                ...values,
                tags: values.tags || [],
                type: initialValues ? initialValues.type : questionType,
                imageFile: fileList.length > 0 ? fileList[0].originFileObj : null
            };
            onSuccess(submitData);
        } catch (error) { console.error("Validate failed:", error); }
    };

    const uploadProps = {
        onRemove: () => setFileList([]),
        beforeUpload: (file) => {
            setFileList([{ uid: file.uid, name: file.name, status: 'done', originFileObj: file }]);
            return false;
        },
        fileList, maxCount: 1, accept: "image/*"
    };

    // --- RENDER DYNAMIC FIELDS ---
    const renderSpecificFields = () => {
        const currentType = initialValues ? initialValues.type : questionType;

        switch (currentType) {
            case 'SINGLE_CHOICE':
                return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <p className="font-semibold text-slate-700 mb-2">Lựa chọn & Đáp án đúng</p>
                        {["A", "B", "C", "D"].map((opt, idx) => (
                            <Row gutter={8} key={opt} className="mb-2">
                                <Col flex="30px" className="flex items-center justify-center font-bold text-blue-600">{opt}.</Col>
                                <Col flex="auto">
                                    <Form.Item name={["options", idx]} rules={[{ required: true }]} noStyle>
                                        <Input placeholder={`Lựa chọn ${opt}`} />
                                    </Form.Item>
                                </Col>
                                <Col flex="40px" className="flex items-center justify-center">
                                    <Form.Item shouldUpdate noStyle>
                                        {({ getFieldValue, setFieldsValue }) => (
                                            <Radio
                                                checked={getFieldValue('answer') === getFieldValue(['options', idx]) && !!getFieldValue(['options', idx])}
                                                onChange={() => setFieldsValue({ answer: getFieldValue(['options', idx]) })}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}
                        <Form.Item name="answer" rules={[{ required: true, message: "Chọn đáp án đúng" }]}>
                            <Input placeholder="Nội dung đáp án đúng (tự động điền khi chọn radio)" readOnly />
                        </Form.Item>
                    </div>
                );

            case 'MULTIPLE_SELECT':
                return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <p className="font-semibold text-slate-700 mb-2">Nhập lựa chọn & Chọn các đáp án đúng</p>
                        {["A", "B", "C", "D"].map((opt, idx) => (
                            <Row gutter={8} key={opt} className="mb-2">
                                <Col flex="30px" className="font-bold text-blue-600 pt-1">{opt}.</Col>
                                <Col flex="auto">
                                    <Form.Item name={["options", idx]} rules={[{ required: true }]} noStyle>
                                        <Input placeholder={`Lựa chọn ${opt}`} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}

                        <div className="mt-4">
                            <Form.Item shouldUpdate={(prev, curr) => prev.options !== curr.options} noStyle>
                                {({ getFieldValue }) => {
                                    const options = getFieldValue('options') || [];
                                    return (
                                        <Form.Item
                                            name="answer"
                                            label="Các đáp án đúng"
                                            rules={[{ required: true, type: 'array', min: 1, message: 'Chọn ít nhất 1 đáp án' }]}
                                        >
                                            <Select mode="multiple" placeholder="Chọn các đáp án đúng..." allowClear>
                                                {options.map((opt, idx) => (
                                                    opt ? <Select.Option key={idx} value={opt}>{String.fromCharCode(65+idx)}. {opt}</Select.Option> : null
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    );
                                }}
                            </Form.Item>
                        </div>
                    </div>
                );

            case 'TRUE_FALSE':
                return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <Form.Item label="Mệnh đề này là Đúng hay Sai?" name="answer" rules={[{ required: true }]}>
                            <Radio.Group buttonStyle="solid" className="w-full text-center">
                                <Radio.Button value={true} className="w-1/2 h-10 leading-9 font-bold text-green-700">Đúng (True)</Radio.Button>
                                <Radio.Button value={false} className="w-1/2 h-10 leading-9 font-bold text-red-700">Sai (False)</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name="options" hidden initialValue={["True", "False"]}><Input /></Form.Item>
                    </div>
                );

            case 'FILL_IN_THE_BLANK':
                return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <Alert message={<span>Dùng ký tự <b>___</b> (3 dấu gạch dưới) để tạo chỗ trống trong câu hỏi.</span>} type="info" showIcon className="mb-3" />
                        <p className="font-semibold mb-2">Danh sách từ điền vào chỗ trống (theo thứ tự):</p>

                        <Form.List name="answer">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <div key={field.key} className="flex gap-2 mb-2 items-center">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                                            <Form.Item
                                                {...field}
                                                rules={[{ required: true, message: "Nhập từ cần điền" }]}
                                                noStyle
                                            >
                                                <Input placeholder={`Từ cần điền vị trí ${index + 1}`} />
                                            </Form.Item>
                                            {fields.length > 1 && <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />}
                                        </div>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm chỗ trống</Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item name="options" hidden initialValue={[]}><Input /></Form.Item>
                    </div>
                );

            case 'SHORT_ANSWER':
                return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <Form.Item label="Đáp án mẫu (Text)" name="answer" rules={[{ required: true }]}>
                            <Input.TextArea rows={2} placeholder="Nhập câu trả lời chính xác..." />
                        </Form.Item>
                        <Form.Item name="options" hidden initialValue={[]}><Input /></Form.Item>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu câu hỏi"
            width={800}
            centered
            maskClosable={false}
        >
            <Form form={form} layout="vertical" className="pt-2">
                <Form.Item name="type" hidden><Input /></Form.Item>

                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true }]}>
                            <Input.TextArea rows={3} placeholder="Nhập nội dung câu hỏi..." />
                        </Form.Item>
                        <Form.Item label="Hình ảnh minh họa">
                            <Upload {...uploadProps} listType="picture-card">
                                {fileList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Khối lớp" name="gradeLevel" rules={[{ required: true }]}>
                            <Input placeholder="VD: 10, 11, 12" />
                        </Form.Item>
                        <Form.Item label="Tag / Chủ đề">
                            <div className="flex gap-2 mb-2">
                                <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag mới..." />
                                <Button onClick={() => handleCreateNewTag(newTagName)} loading={creatingTag} icon={<PlusOutlined />} />
                            </div>
                            <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto">
                                <Form.Item name="tags" noStyle>
                                    <Checkbox.Group className="flex flex-col">
                                        {(tags || []).map((t) => <Checkbox key={t._id} value={t._id}>{t.name}</Checkbox>)}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                {renderSpecificFields()}

                <Form.Item label="Giải thích chi tiết" name="solution">
                    <Input.TextArea rows={2} placeholder="Giải thích đáp án..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuestionFormModal;