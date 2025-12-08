import React from "react";
import { Avatar, Button, Card, Tag, Typography, message, Tooltip } from "antd";
import {
    ArrowLeftOutlined,
    GithubOutlined,
    LinkedinOutlined,
    MailOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    CodeOutlined,
    HeartFilled,
    BankOutlined,
    RocketOutlined,
    LaptopOutlined,
    ToolOutlined, // Icon cho CNC
    CopyOutlined,
    DownloadOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

export default function AuthorAndSupportPage() {
    const navigate = useNavigate();

    // 1. Dữ liệu cá nhân
    const personalInfo = {
        name: "Triệu Thanh Tùng",
        role: "Backend Developer",
        subRole: "Java Spring Boot • NestJS",
        major: "Lập trình viên",
        hometown: "Bắc Từ Liêm, Hà Nội",
        university: "Đại học công nghiệp hà nội",
        email: "tungtrieu@example.com",
        github: "https://github.com/tungtrieu0801",
        linkedin: "https://linkedin.com/in/tungtrieu"
    };

    // 2. Dữ liệu Skills
    const skills = [
        { name: "Java Core", color: "blue" },
        { name: "Spring Boot", color: "green" },
        { name: "NestJS", color: "red" },
        { name: "Microservices", color: "purple" },
        { name: "Docker/K8s", color: "cyan" },
        { name: "Oracle/Postgres", color: "orange" },
        { name: "Flutter", color: "geekblue" },
        { name: "ReactJS", color: "magenta" },
    ];

    // 3. Dữ liệu kinh nghiệm (Đã bao gồm CNC Operator)
    const experiences = [
        {
            role: "Java Backend Developer",
            company: "VietnamPost",
            time: "Apr 2025 - Present",
            type: "Full-time",
            desc: "Xây dựng core system xử lý vận đơn, tối ưu hóa truy vấn Oracle DB, phát triển API Microservices.",
            tech: ["Java 17", "Spring Boot 3", "Oracle", "Redis"],
            color: "bg-blue-500",
            shadow: "shadow-blue-300",
            icon: <RocketOutlined />
        },
        {
            role: "Java Backend Developer",
            company: "BzCom Co., Ltd",
            time: "Jun 2024 - May 2025",
            type: "Full-time",
            desc: "Phát triển hệ thống ERP nội bộ, tích hợp thanh toán, build APIs cho Mobile App.",
            tech: ["Java", "Spring Security", "Flutter", "MySQL"],
            color: "bg-emerald-500",
            shadow: "shadow-emerald-300",
            icon: <CodeOutlined />
        },
        {
            role: "Flutter Developer",
            company: "HTA High Technology Access Solution",
            time: "Feb 2024 - May 2024",
            type: "Full-time",
            desc: "Lập trình ứng dụng IoT điều khiển thiết bị thông minh qua Bluetooth/Wifi.",
            tech: ["Flutter", "Dart", "Firebase", "MQTT"],
            color: "bg-amber-500",
            shadow: "shadow-amber-300",
            icon: <LaptopOutlined />
        },
        {
            role: "Flutter Developer (Internship)",
            company: "Vietnam Academy of Science and Technology",
            time: "Sep 2023 - Feb 2024",
            type: "Internship",
            desc: "Nghiên cứu công nghệ xử lý ảnh trên mobile, tham gia dự án chuyển đổi số.",
            tech: ["Flutter", "TensorFlow Lite"],
            color: "bg-indigo-500",
            shadow: "shadow-indigo-300",
            icon: <BankOutlined />
        },
        {
            role: "CNC Operator",
            company: "NEWEB VIETNAM CO., LTD",
            time: "May 2022 - Sep 2022",
            type: "Full-time",
            desc: "Vận hành máy CNC. Rèn luyện tính kỷ luật, chính xác, tỉ mỉ và an toàn lao động trong môi trường công nghiệp.",
            tech: ["CNC Operation", "Mechanics", "Safety"],
            color: "bg-slate-500",
            shadow: "shadow-slate-400",
            icon: <ToolOutlined />
        },
    ];

    const handleCopyBank = () => {
        navigator.clipboard.writeText("0386278621"); // Thay STK thật của bạn
        message.success("Đã sao chép số tài khoản!");
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring" } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 pb-20 overflow-x-hidden">
            {/* Background Blob Effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 relative z-10">
                {/* Navbar */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-between items-center mb-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white sticky top-4 z-50"
                >
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/")}
                        className="font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                    >
                        Quay lại Menu
                    </Button>
                    <div className="flex gap-3">
                        <Button icon={<DownloadOutlined />} className="rounded-xl border-slate-300 hidden sm:inline-flex hover:border-indigo-500 hover:text-indigo-500">
                            Tải CV
                        </Button>
                        <Button type="primary" className="bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 border-none font-semibold px-6 hover:bg-indigo-700">
                            Liên hệ
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* --- CỘT TRÁI (Sticky) --- */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">

                        {/* 1. Profile Card */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-white rounded-[24px] overflow-hidden shadow-lg shadow-slate-200/60 border border-white group hover:shadow-xl transition-all duration-300">
                                <div className="h-20 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                                </div>
                                <div className="px-6 pb-8 text-center relative">
                                    <div className="relative -mt-16 mb-4 inline-block">
                                        <div className="relative w-[180px] h-[180px]">
                                            <img
                                                src="/images/avatar.jpg"
                                                className="w-full h-full rounded-full object-contain bg-white border-[1px] border-white shadow-md"
                                            />
                                        </div>

                                        <Tooltip title="Đang tìm việc / Open to work">
                                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full animate-pulse"></div>
                                        </Tooltip>
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{personalInfo.name}</h2>
                                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-5 tracking-wide uppercase">
                                        {personalInfo.role}
                                    </div>

                                    <div className="text-left space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-500"><CalendarOutlined /></div>
                                            <span className="font-medium">{personalInfo.major}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500"><EnvironmentOutlined /></div>
                                            <span className="font-medium">{personalInfo.hometown}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500"><BankOutlined /></div>
                                            <span className="font-medium truncate">{personalInfo.university}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-3">
                                        {[
                                            { icon: <GithubOutlined />, link: personalInfo.github, color: "hover:bg-gray-800" },
                                            { icon: <LinkedinOutlined />, link: personalInfo.linkedin, color: "hover:bg-blue-600" },
                                            { icon: <MailOutlined />, link: `mailto:${personalInfo.email}`, color: "hover:bg-red-500" }
                                        ].map((item, idx) => (
                                            <a key={idx} href={item.link} target="_blank" rel="noreferrer"
                                               className={`w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center ${item.color} hover:text-white transition-all duration-300 shadow-sm hover:scale-110`}>
                                                {item.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Donate Box (Vị trí thứ 2 - Cao dễ thấy) */}
                        <motion.div variants={itemVariants}>
                            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white text-center shadow-xl shadow-rose-200 transform transition-transform hover:-translate-y-1">
                                {/* Decor circles */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>

                                <HeartFilled className="text-4xl mb-3 animate-pulse drop-shadow-md relative z-10" />
                                <h3 className="text-xl font-bold mb-1 relative z-10">Ủng hộ tác giả</h3>
                                <p className="text-white/90 text-sm mb-4 relative z-10">Tiếp thêm năng lượng cho mình nhé! ☕</p>

                                <div className="bg-white p-3 rounded-2xl mx-auto shadow-inner mb-4 relative z-10">
                                    {/* THAY ẢNH QR CỦA BẠN VÀO ĐÂY */}
                                    <img src="/images/qr.jpg" alt="QR Donate" className="w-full h-full object-contain rounded-lg"/>
                                </div>

                                <Button
                                    icon={<CopyOutlined />}
                                    className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-rose-600 w-full rounded-xl font-semibold backdrop-blur-sm h-10 relative z-10"
                                    onClick={handleCopyBank}
                                >
                                    Sao chép STK Ngân hàng
                                </Button>
                            </div>
                        </motion.div>

                        {/* 3. Tech Stack (Đẩy xuống dưới cùng) */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <CodeOutlined className="text-indigo-500"/> Kỹ năng công nghệ
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, idx) => (
                                        <Tag key={idx} color={skill.color} className="px-3 py-1.5 rounded-lg m-0 border-0 font-medium text-sm">
                                            {skill.name}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* --- CỘT PHẢI (Timeline) --- */}
                    <div className="lg:col-span-8">
                        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 md:p-10 border border-white shadow-sm">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200 transform rotate-90">
                                    <RocketOutlined />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 m-0">Hành trình sự nghiệp</h2>
                                    <p className="text-slate-500 mt-1">Các cột mốc quan trọng & kinh nghiệm làm việc</p>
                                </div>
                            </div>

                            {/* --- CUSTOM TIMELINE (Fix lỗi lệch icon) --- */}
                            <div className="relative">
                                {/* ĐƯỜNG KẺ DỌC (Absolute Position) - Nằm cố định ở left-4 (mobile) hoặc left-10 (desktop) */}
                                <div className="absolute left-4 md:left-10 top-2 bottom-2 w-[2px] bg-slate-200 rounded-full"></div>

                                <div className="space-y-12">
                                    {experiences.map((exp, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="relative pl-12 md:pl-24" // Padding trái lớn để chừa chỗ cho Icon
                                        >
                                            {/* ICON TRÒN (Absolute Position) */}
                                            {/* left-4/left-10 trùng với đường kẻ, -translate-x-1/2 để tâm icon trùng tâm đường kẻ */}
                                            <div
                                                className={`absolute left-4 md:left-10 top-0 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full ${exp.color} ${exp.shadow} flex items-center justify-center text-white text-lg shadow-lg z-10 ring-4 ring-[#f8fafc] group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                {exp.icon}
                                            </div>

                                            {/* CARD NỘI DUNG */}
                                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-100 relative top-[-6px] group">
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                            {exp.role}
                                                        </h3>
                                                        <div className="text-indigo-600 font-medium flex items-center gap-2 mt-1">
                                                            <BankOutlined /> {exp.company}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-start md:items-end gap-1 mt-2 md:mt-0">
                                                        <Tag color="geekblue" className="rounded-full px-3 border-0 bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider m-0">
                                                            {exp.type}
                                                        </Tag>
                                                        <span className="text-xs text-slate-400 font-mono mt-1 bg-slate-50 px-2 py-0.5 rounded">
                                                            {exp.time}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Paragraph className="text-slate-600 text-justify leading-relaxed mb-4 text-[15px]">
                                                    {exp.desc}
                                                </Paragraph>

                                                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50/50">
                                                    {exp.tech.map((t, i) => (
                                                        <span key={i} className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md hover:bg-white hover:border-indigo-200 transition-colors cursor-default">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Education Section (Nối tiếp timeline) */}
                            <div className="relative mt-12">
                                <div className="absolute left-4 md:left-10 top-[-20px] h-full w-[2px] bg-gradient-to-b from-slate-200 to-transparent"></div>
                                <div className="relative pl-12 md:pl-24">
                                    <div className="absolute left-4 md:left-10 top-0 -translate-x-1/2 w-4 h-4 bg-slate-300 rounded-full border-4 border-[#f8fafc] z-10"></div>

                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-dashed border-slate-300 flex items-center gap-4 hover:bg-white hover:border-indigo-200 transition-all cursor-default">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm p-1">
                                            <img src="/images/haui_logo.webp" alt="HaUI" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-700 m-0 text-lg">Đại học công nghiệp hà nội</h4>
                                            <p className="text-slate-500 text-sm m-0">Computer Engineering • 2020 - 2024</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}