import React, { useState, useEffect } from "react";
import { CloseOutlined, MinusOutlined, SendOutlined } from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";

const MiniChatWindow = ({ isOpen, onClose, chatUser }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    // Reset minimize khi mở lại chat
    useEffect(() => {
        if (isOpen) setIsMinimized(false);
    }, [isOpen]);

    if (!isOpen) return null;

    // Dữ liệu người chat mặc định (nếu không truyền vào)
    const displayUser = chatUser || {
        name: "Hỗ trợ viên",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Support",
        status: "Sẵn sàng"
    };

    // --- GIAO DIỆN KHI THU NHỎ ---
    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-20 w-48 bg-white shadow-lg rounded-t-lg border border-gray-300 z-[1000] cursor-pointer hover:bg-gray-50 transition-all font-sans"
                 onClick={() => setIsMinimized(false)}>
                <div className="flex items-center justify-between p-3 border-b-2 border-blue-500">
                    <span className="font-bold text-slate-700 truncate text-sm">{displayUser.name}</span>
                </div>
            </div>
        );
    }

    // --- GIAO DIỆN FULL ---
    return (
        <div className="fixed bottom-0 right-4 md:right-20 w-80 h-[450px] bg-white shadow-2xl rounded-t-xl border border-gray-200 z-[1000] flex flex-col animate-slide-up font-sans">
            {/* HEADER */}
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-t-xl border-b shadow-sm cursor-pointer" onClick={() => setIsMinimized(true)}>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Avatar src={displayUser.avatar} size="small" />
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 m-0 leading-none">{displayUser.name}</h4>
                        <span className="text-[10px] text-green-600">Đang hoạt động</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button type="text" size="small" icon={<MinusOutlined />} onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="text-blue-500" />
                    <Button type="text" size="small" icon={<CloseOutlined />} onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-red-500 hover:bg-red-50" />
                </div>
            </div>

            {/* BODY CHAT */}
            <div className="flex-1 overflow-y-auto p-3 bg-slate-50 flex flex-col gap-3">
                <div className="text-xs text-center text-slate-400 my-2">Hôm nay 10:30</div>
                {/* Mock tin nhắn */}
                <div className="flex items-end gap-2">
                    <Avatar src={displayUser.avatar} size="small" />
                    <div className="bg-white p-2.5 rounded-2xl rounded-bl-none shadow-sm text-sm text-slate-700 max-w-[80%] border border-slate-100">
                        Chức năng đang trong quá trình phát triển!!!
                    </div>
                </div>
            </div>

            {/* FOOTER INPUT */}
            <div className="p-3 bg-white border-t flex items-center gap-2">
                <Input
                    placeholder="Nhập tin nhắn..."
                    variant="filled"
                    className="rounded-full bg-slate-100 hover:bg-slate-200 focus:bg-white transition-colors"
                    suffix={<SendOutlined className="text-blue-600 cursor-pointer"/>}
                    onPressEnter={() => {}}
                />
            </div>
        </div>
    );
};

export default MiniChatWindow;