import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth.js";
import {
    LoginOutlined,
    UserOutlined,
    BellOutlined,
    MessageOutlined,
    CaretDownOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { Avatar, Dropdown, Badge, Popover, List, Button, Switch, Empty, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useChat } from "../providers/ChatProvider.jsx";
import instance from "../../shared/lib/axios.config.js";

// --- COMPONENT CIRCLE BUTTON ---
const CircleButton = ({ icon, onClick, active, count, badgeStyle }) => (
    <div
        onClick={onClick}
        className={`
            relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 select-none
            ${active
            ? 'bg-blue-100 text-blue-600 dark:bg-[#2d88ff33] dark:text-[#4599ff]'
            : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:text-gray-200 dark:hover:bg-[#4e4f50]'
        }
        `}
    >
        <Badge
            count={count}
            styles={{ indicator: badgeStyle }}
            offset={[-2, 2]}
            size="small"
        >
            <div className="text-xl flex items-center justify-center">
                {icon}
            </div>
        </Badge>
    </div>
);

// Hàm helper format thời gian đơn giản (hoặc bạn dùng moment/date-fns)
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // giây

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [openPopover, setOpenPopover] = useState(null);
    const { toggleChat, isOpen: isChatOpen } = useChat();

    // Config tab navigation
    const navItems = [
        { label: "Trang chủ", path: "/menu" },
        { label: "Kho đề thi", path: "/tests" },
        { label: "Kho câu hỏi", path: "/questions" },
        { label: "Quản lí học sinh", path: "/students" },
    ]

    // --- STATE CHO NOTIFICATION ---
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNoti, setLoadingNoti] = useState(false);

    // --- DARK MODE LOGIC ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    const [modal, contextHolder] = Modal.useModal();

    const handleMenuClick = (e) => {
        if (e.key === 'logout') {
            handleLogout();
        }
    };

    useEffect(() => {
        const html = document.documentElement;
        if (isDarkMode) {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // --- 1. FETCH NOTIFICATIONS TỪ API ---
    const fetchNotifications = async () => {
        if (!user) return;
        setLoadingNoti(true);
        try {
            // Gọi API: GET /api/notifications
            const res = await instance.get('/notifications?limit=10');
            if (res.data && res.data.success) {
                const list = res.data.data.notifications;
                setNotifications(list);
                // Cập nhật số lượng chưa đọc
                setUnreadCount(res.data.data.unreadCount);
            }
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        } finally {
            setLoadingNoti(false);
        }
    };

    // Gọi fetch khi component mount hoặc user thay đổi
    useEffect(() => {
        fetchNotifications();

        // (Optional) Có thể set interval để poll thông báo mới mỗi 1-2 phút
        // const interval = setInterval(fetchNotifications, 60000);
        // return () => clearInterval(interval);
    }, [user]);

    // --- 2. XỬ LÝ ĐỌC 1 THÔNG BÁO ---
    const handleReadNotification = async (item) => {
        // Nếu đã đọc rồi thì chỉ cần navigate (nếu có data)
        if (item.isRead) {
            // Logic điều hướng nếu cần, ví dụ:
            if (item.data?.testId) navigate(`/tests`);
            return;
        }

        try {
            // Gọi API đánh dấu đã đọc
            await instance.patch(`/notifications/${item._id}/read`);

            // Cập nhật UI ngay lập tức (Optimistic update)
            const newNotifications = notifications.map(n =>
                n._id === item._id ? { ...n, isRead: true } : n
            );
            setNotifications(newNotifications);
            setUnreadCount(prev => Math.max(0, prev - 1)); // Giảm số đỏ đi 1

            // Logic điều hướng sau khi đánh dấu đọc
            if (item.data?.testId) {
                navigate(`/tests`);
                setOpenPopover(null); // Đóng popover
            }

        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    };

    // --- 3. XỬ LÝ ĐỌC TẤT CẢ ---
    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await instance.patch('/notifications/read-all');

            // Cập nhật UI
            const newNotifications = notifications.map(n => ({ ...n, isRead: true }));
            setNotifications(newNotifications);
            setUnreadCount(0); // Xóa sạch số đỏ
            message.success("Đã đánh dấu tất cả là đã đọc");
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    // --- XỬ LÝ LOGOUT ---
    const handleLogout = () => {
        console.log("click")
        modal.confirm({
            title: 'Xác nhận đăng xuất',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okType: 'danger', // Nút OK màu đỏ để cảnh báo
            centered: true,
            onOk() {
                // Logic đăng xuất thực sự chạy khi bấm nút "Đăng xuất"
                if (isChatOpen) toggleChat();
                logout();
                navigate('/login');
            },
            onCancel() {
                // Không làm gì nếu bấm Hủy
            },
        })
    };

    const badgeStyle = {
        backgroundColor: '#e41e3f',
        color: '#fff',
        boxShadow: `0 0 0 2px ${isDarkMode ? '#242526' : '#fff'}`,
        fontSize: '11px',
        fontWeight: 'bold',
        height: '18px',
        minWidth: '18px',
        lineHeight: '18px',
        padding: '0 4px',
        borderRadius: '99px',
    };

    const userItems = [
        {
            key: "theme",
            label: (
                <div className="flex items-center justify-between min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                    <span className="flex items-center gap-2">
                        {isDarkMode ? <Moon size={16}/> : <Sun size={16}/>}
                        Giao diện {isDarkMode ? "Tối" : "Sáng"}
                    </span>
                    <Switch size="small" checked={isDarkMode} onChange={toggleTheme} />
                </div>
            ),
        },
        { type: 'divider' },
        // {
        //     key: "setting",
        //     label: (
        //         <div className="flex items-center gap-2  font-medium">
        //             {/*<LoginOutlined />*/}
        //             Setting
        //         </div>
        //     ),
        // },
        {
            key: "logout",
            label: (
                <div className="flex items-center gap-2 text-red-500 font-medium">
                    <LoginOutlined />
                    Đăng xuất
                </div>
            ),
        },
    ];

    // --- NỘI DUNG POPUP THÔNG BÁO ---
    const notificationContent = (
        <div className="w-80 max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-center px-2 mb-2 border-b dark:border-gray-700 pb-2">
                <span className="font-bold text-slate-800 dark:text-white">Thông báo</span>
                <Button
                    type="link"
                    size="small"
                    className="text-xs"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                >
                    Đánh dấu đã đọc
                </Button>
            </div>

            {loadingNoti ? (
                <div className="p-4 text-center text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
                <Empty description="Không có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => handleReadNotification(item)} // Bấm vào gọi hàm xử lý đọc
                            className={`
                                px-2 py-3 cursor-pointer rounded-lg transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0
                                hover:bg-gray-100 dark:hover:bg-[#4e4f50]
                                ${!item.isRead
                                ? 'bg-blue-50 dark:bg-[#2d88ff1a]' // Chưa đọc: Nền xanh nhạt
                                : 'bg-transparent'                  // Đã đọc: Nền trong suốt
                            }
                            `}
                        >
                            <List.Item.Meta
                                avatar={
                                    // Chấm xanh nếu chưa đọc, hoặc icon tùy loại
                                    !item.isRead ? (
                                        <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 mx-auto"></div>
                                    ) : (
                                        <div className="w-2.5"></div> // Placeholder để căn lề
                                    )
                                }
                                title={
                                    <span className={`text-sm dark:text-gray-200 ${!item.isRead ? 'font-bold text-gray-900' : 'font-normal text-gray-600'}`}>
                                        {item.title}
                                    </span>
                                }
                                description={
                                    <div className="flex flex-col">
                                        <span className={`text-xs line-clamp-2 ${!item.isRead ? 'text-slate-700 dark:text-gray-300' : 'text-slate-500 dark:text-gray-500'}`}>
                                            {item.content}
                                        </span>
                                        <span className="text-[10px] text-blue-500 mt-1">
                                            {formatTime(item.createdAt)}
                                        </span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <header className="bg-white dark:bg-[#242526] shadow-sm px-4 md:px-6 h-14 sticky top-0 z-50 flex justify-between items-center border-b border-gray-100 dark:border-[#393a3b] transition-colors duration-300">
            {/* LOGO */}
            {/*contextholder controler model*/}
            {contextHolder}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user?.role === "admin" ? "/menu" : "/")}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                    H
                </div>
                <span className="hidden md:block text-2xl font-bold text-blue-600 tracking-tight">Học Vui</span>
            </div>
            {user && (
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        // Kiểm tra xem tab hiện tại có đang active không
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                        px-4 py-2 rounded-lg cursor-pointer font-medium text-lg transition-all duration-200
                                        ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-[#2d88ff1a] dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3a3b3c] dark:hover:text-gray-100'
                                }
                                    `}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </nav>
            )}

            {/* RIGHT ACTIONS */}
            {user ? (
                <div className="flex items-center gap-2 md:gap-3">

                    {/* Theme Toggle */}
                    <div className="hidden md:block">
                        <CircleButton
                            icon={isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                            onClick={toggleTheme}
                            badgeStyle={badgeStyle}
                        />
                    </div>

                    {/* Chat Toggle */}
                    <div title="Tin nhắn">
                        <CircleButton
                            icon={<MessageOutlined style={{ fontSize: '20px' }} />}
                            count={1} // Bạn có thể làm tương tự logic fetchNoti cho tin nhắn
                            active={isChatOpen}
                            onClick={toggleChat}
                            badgeStyle={badgeStyle}
                        />
                    </div>

                    {/* Notifications */}
                    <Popover
                        content={notificationContent}
                        title={null}
                        trigger="click"
                        placement="bottomRight"
                        arrow={false}
                        open={openPopover === 'notification'} // Control trạng thái mở
                        onOpenChange={(v) => {
                            setOpenPopover(v ? 'notification' : null);
                            // Nếu muốn mở popover cái là mất hết số (mark all read) thì bỏ comment dòng dưới:
                            // if(v) handleMarkAllRead();
                        }}
                    >
                        <div>
                            <CircleButton
                                icon={<BellOutlined style={{ fontSize: '20px' }} />}
                                count={unreadCount} // Số lượng lấy từ API
                                active={openPopover === 'notification'}
                                badgeStyle={badgeStyle}
                            />
                        </div>
                    </Popover>

                    {/* User Profile */}
                    <Dropdown menu={{ items: userItems, onClick: handleMenuClick }} trigger={["click"]} placement="bottomRight">
                        <div className="ml-1 cursor-pointer flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors">
                            {/* Avatar */}
                            <div className="relative">
                                <Avatar
                                    size={40}
                                    src={user.avatar}
                                    icon={<UserOutlined />}
                                    className="border border-gray-200 dark:border-gray-600 bg-gray-200"
                                />
                                {/* Dấu mũi tên nhỏ chỉ hiện ở mobile (khi tên bị ẩn) */}
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-100 dark:bg-[#242526] rounded-full flex items-center justify-center border border-white dark:border-[#242526] md:hidden">
                                    <CaretDownOutlined className="text-[8px] text-black dark:text-white" />
                                </div>
                            </div>

                            {/* Phần hiển thị tên - Chỉ hiện trên màn hình MD trở lên */}
                            <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">
                {/* Thay user.fullName bằng trường tên trong database của bạn */}
                {user.fullName || user.username || "Người dùng"}
            </span>
                                {/* Nếu muốn hiện thêm vai trò (Admin/User) thì bỏ comment dòng dưới */}
                                {/* <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</span> */}
                            </div>
                        </div>
                    </Dropdown>
                </div>
            ) : (
                <Button type="primary" shape="round" onClick={() => navigate('/login')}>Đăng nhập</Button>
            )}
        </header>
    );
}