import { Card } from "antd";
import { PlusCircleOutlined, UnorderedListOutlined, TagsOutlined, TeamOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import {useNavigate} from "react-router-dom";

export default function MenuPage() {
    const navigate = useNavigate();
    const items = [
        { label: "Danh sách bài kiểm tra", icon: <UnorderedListOutlined className="text-4xl" />, action: "tests" },
        { label: "Danh sách câu hỏi", icon: <UnorderedListOutlined className="text-4xl" />, action: "question-list" },
        { label: "Danh sách thẻ tag", icon: <TagsOutlined className="text-4xl" />, action: "tag-list" },
        { label: "Danh sách học sinh", icon: <TeamOutlined className="text-4xl" />, action: "student-list" },
        { label: "Thêm bài kiểm tra", icon: <PlusCircleOutlined className="text-4xl" />, action: "add-test" },
        { label: "Thêm câu hỏi", icon: <PlusCircleOutlined className="text-4xl" />, action: "add-question" },
    ];

    const handleClick = (action) => {
        switch (action) {
            case "tests":
                navigate("/tests");
                break;
            case "student-list":
                navigate("/students");
                break;
            case "tag-list":
                navigate("/tags");
            case "question-list":
                navigate("/questions");
        }
    }

    return (
        <div className="min-h-screen bg-gray-200 p-10">
            <h1 className="text-center text-4xl font-bold mb-10">Menu Quản Lý</h1>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card
                            hoverable
                            className="rounded-2xl flex flex-col items-center gap-4 p-6"
                            onClick={() => handleClick(item.action)}
                        >
                            {item.icon}
                            <p className="text-lg font-semibold text-center">{item.label}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
