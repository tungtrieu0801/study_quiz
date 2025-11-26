import React, { createContext, useContext, useState } from 'react';
// Import đường dẫn đúng tới file UI MiniChatWindow của bạn
// Nếu bạn để ở features/chat/pages thì sửa đường dẫn cho khớp
import MiniChatWindow from '../../features/chat/component/MiniChatWindow.jsx';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // State quản lý việc mở cửa sổ chat
    const [isOpen, setIsOpen] = useState(false);

    // State quản lý thông tin người đang chat cùng (để hiển thị tên, avatar trên header chat)
    const [currentChatUser, setCurrentChatUser] = useState(null);

    // Hàm mở chat - Gọi hàm này từ bất cứ đâu trong App
    const openChat = (user = null) => {
        if (user) {
            setCurrentChatUser(user);
        }
        setIsOpen(true);
    };

    // Hàm đóng chat
    const closeChat = () => {
        setIsOpen(false);
    };

    // Hàm toggle (dùng cho nút icon ở Header)
    const toggleChat = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <ChatContext.Provider value={{ isOpen, openChat, closeChat, toggleChat, currentChatUser }}>
            {children}

            {/* Cửa sổ chat Global nằm ở đây */}
            <MiniChatWindow
                isOpen={isOpen}
                onClose={closeChat}
                chatUser={currentChatUser}
            />
        </ChatContext.Provider>
    );
};

// Custom Hook để dùng nhanh ở các component khác
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};