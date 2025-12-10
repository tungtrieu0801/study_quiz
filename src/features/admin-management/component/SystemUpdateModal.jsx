import React, { useEffect, useState } from "react";
import { Modal, Button, List, Tag, Typography } from "antd";
import {
    RocketOutlined,
    StarOutlined,
    CheckCircleOutlined,
    ThunderboltFilled
} from "@ant-design/icons";

// Giả lập hàm gọi API (Nếu bạn đã có file API riêng thì import vào nhé)
// import { getLatestSystemUpdate } from "../services/notificationApi";
import instance from "../../../shared/lib/axios.config";

const { Text, Title } = Typography;

export default function SystemUpdateModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [updateData, setUpdateData] = useState(null);

    useEffect(() => {
        const checkUpdate = async () => {
            try {
                // 1. Gọi API lấy bản update mới nhất
                // Note: Đảm bảo bạn đã setup route /notifications/latest-update ở backend
                const res = await instance.get('/notifications/latest-update');

                if (!res.data.success || !res.data.data) return;

                const serverData = res.data.data;

                // 2. Lấy version đã lưu ở máy khách
                const localVersion = localStorage.getItem('app_system_version');

                // 3. So sánh: Nếu khác nhau -> Hiện Popup
                if (serverData.version !== localVersion) {
                    setUpdateData(serverData);
                    // Delay 1.5s để user vào dashboard ổn định rồi mới hiện
                    setTimeout(() => setIsOpen(true), 1500);
                }
            } catch (error) {
                console.error("Failed to check system update", error);
            }
        };

        checkUpdate();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // QUAN TRỌNG: Lưu version mới vào localStorage
        if (updateData) {
            localStorage.setItem('app_system_version', updateData.version);
        }
    };

    // Helper chọn màu Tag
    const getTagColor = (tag) => {
        const t = tag?.toUpperCase();
        if (t === 'HOT') return 'red';
        if (t === 'NEW') return 'green';
        if (t === 'AI') return 'purple';
        return 'blue';
    };

    if (!updateData) return null;

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            width={600}
            centered
            maskClosable={false}
            footer={[
                <Button
                    key="got-it"
                    type="primary"
                    size="large"
                    onClick={handleClose}
                    className="bg-indigo-600 w-full h-12 rounded-xl text-lg font-semibold shadow-lg hover:bg-indigo-700 border-none"
                    icon={<CheckCircleOutlined />}
                >
                    Tuyệt vời, tôi đã hiểu!
                </Button>
            ]}
            title={
                <div className="flex items-center gap-3 text-indigo-700 py-2 border-b border-indigo-50 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <RocketOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Release</span>
                        <h3 className="text-xl font-bold m-0">Cập nhật {updateData.version}</h3>
                    </div>
                </div>
            }
        >
            <div className="pb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-2xl mb-6 border border-indigo-100">
                    <div className="flex items-start gap-3">
                        <ThunderboltFilled className="text-amber-500 text-xl mt-1" />
                        <div>
                            <Title level={5} className="m-0 text-indigo-900 mb-1">{updateData.title}</Title>
                            <Text className="text-slate-600 text-sm">
                                Hệ thống vừa được nâng cấp. Xem ngay các tính năng mới bên dưới!
                            </Text>
                        </div>
                    </div>
                </div>

                <List
                    itemLayout="horizontal"
                    dataSource={updateData.features || []}
                    split={false}
                    renderItem={(item) => (
                        <List.Item className="mb-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                            <List.Item.Meta
                                avatar={
                                    <div className="mt-1 bg-white p-2 rounded-lg text-amber-500 shadow-sm border border-slate-100">
                                        <StarOutlined />
                                    </div>
                                }
                                title={
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-700 text-base">{item.title}</span>
                                        {item.tag && (
                                            <Tag color={getTagColor(item.tag)} className="rounded-full px-2 font-bold border-none">
                                                {item.tag}
                                            </Tag>
                                        )}
                                    </div>
                                }
                                description={<span className="text-slate-500 text-sm mt-1 block">{item.description}</span>}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Modal>
    );
}