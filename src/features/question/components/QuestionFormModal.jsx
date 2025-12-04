import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Checkbox, Button, Row, Col, Upload, message } from "antd";
import { PlusOutlined, UploadOutlined, FileImageOutlined } from "@ant-design/icons";
import questionApi from "../api/questionApi.js";
import { toast } from "react-toastify";

const QuestionFormModal = ({ open, onCancel, onSuccess, initialValues, tags, tests, refreshTags }) => {
    const [form] = Form.useForm();
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);

    // State quản lý file ảnh
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    // Reset form hoặc điền dữ liệu khi mở modal
    useEffect(() => {
        if (open) {
            setFileList([]); // Reset ảnh khi mở lại
            setPreviewImage(null);

            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    tags: initialValues.tags || [],
                    testIds: initialValues.testIds || [],
                    options: initialValues.options || ["", "", "", ""]
                });
                // Nếu có ảnh cũ (URL) thì hiển thị (nếu API trả về field image)
                if (initialValues.image) {
                    setPreviewImage(initialValues.image);
                }
            } else {
                form.resetFields();
            }
            setNewTagName("");
        }
    }, [open, initialValues, form]);

    // --- Xử lý dán ảnh (Ctrl + V) ---
    useEffect(() => {
        const handlePaste = (event) => {
            if (!open) return;
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.includes('image/')) {
                    const blob = item.getAsFile();
                    const fileObj = {
                        uid: '-1',
                        name: 'pasted_image.png',
                        status: 'done',
                        originFileObj: blob,
                    };
                    setFileList([fileObj]);
                    message.success("Đã dán ảnh từ Clipboard!");
                }
            }
        };

        // Lắng nghe sự kiện paste trên toàn bộ cửa sổ khi modal mở
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [open]);

    // --- API tạo Tag nhanh ---
    const handleCreateNewTag = async (tagName) => {
        if (!tagName.trim()) return;
        try {
            setCreatingTag(true);
            const res = await questionApi.createTag({
                name: tagName,
                description: "Tự động tạo khi thêm câu hỏi"
            });
            if (res.data.success) {
                toast.success("Tạo thành công nhóm câu hỏi mới");
                setNewTagName("");
                await refreshTags();
                return res.data.data._id;
            }
        } catch (error) {
            toast.error("Lỗi khi tạo nhóm câu hỏi");
            throw error;
        } finally {
            setCreatingTag(false);
        }
    }

    // --- Xử lý Submit ---
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            let finalTags = values.tags || [];

            // Logic: Nếu user nhập tag mới mà quên bấm nút "Thêm" thì tự tạo luôn
            if (newTagName.trim()) {
                try {
                    const newTagId = await handleCreateNewTag(newTagName);
                    if (newTagId) finalTags = [...finalTags, newTagId];
                } catch (e) {
                    return; // Dừng nếu lỗi
                }
            }

            // Chuẩn bị dữ liệu trả về cho Parent Component
            // Kèm theo file ảnh (nếu có)
            const submitData = {
                ...values,
                tags: finalTags,
                imageFile: fileList.length > 0 ? fileList[0].originFileObj : null
            };

            onSuccess(submitData);
        } catch (error) {
            // Validate failed
        }
    };

    // Props cho Upload component
    const uploadProps = {
        onRemove: () => {
            setFileList([]);
            setPreviewImage(null);
        },
        beforeUpload: (file) => {
            // Chặn auto upload, chỉ lưu vào state để submit sau
            setFileList([{ uid: file.uid, name: file.name, status: 'done', originFileObj: file }]);
            return false;
        },
        fileList,
        maxCount: 1,
        accept: "image/*"
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

                        {/* --- Khu vực Upload Ảnh --- */}
                        <Form.Item label="Hình ảnh minh họa (Chọn file hoặc Ctrl+V để dán)">
                            <Upload {...uploadProps} listType="picture-card">
                                {fileList.length < 1 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                            {/* Hiển thị ảnh cũ nếu đang edit và chưa chọn ảnh mới */}
                            {initialValues && initialValues.image && fileList.length === 0 && (
                                <div className="mt-2 text-gray-500 text-xs flex items-center gap-2">
                                    <FileImageOutlined /> Ảnh hiện tại:
                                    <a href={initialValues.image} target="_blank" rel="noreferrer" className="text-blue-600">Xem ảnh cũ</a>
                                </div>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Khối lớp" name="gradeLevel" rules={[{ required: true }]}>
                            <Input placeholder="VD: 1, 2, 3..." className="rounded-lg"/>
                        </Form.Item>
                        {/* Vị trí Select Multiple Test (đã comment trong code cũ) */}
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
                        <Form.Item label="Thuộc nhóm câu hỏi nào">
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Tên tag mới..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    onPressEnter={(e) => { e.preventDefault(); handleCreateNewTag(newTagName); }}
                                />
                                <Button onClick={() => handleCreateNewTag(newTagName)} loading={creatingTag} icon={<PlusOutlined />}>Thêm</Button>
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