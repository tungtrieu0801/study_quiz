// src/features/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import instance from "../../../shared/lib/axios.config";
import { message, Card, Spin } from "antd";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("authToken");
                const res = await instance.get("/testList", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.success) {
                    setTests(res.data.data);
                } else {
                    message.error(res.data.message || "Không tải được dữ liệu");
                }
            } catch (err) {
                message.error("Lỗi server, thử lại!");
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const handleClickTest = (testId) => {
        navigate(`/test/${testId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
                <Card
                    key={test._id}
                    title={test.title}
                    hoverable
                    onClick={() => handleClickTest(test._id)}
                >
                    <p>{test.description}</p>
                    <p>Duration: {test.duration}</p>
                    <p>Grade: {test.gradeLevel}</p>
                </Card>
            ))}
        </div>
    );
}
