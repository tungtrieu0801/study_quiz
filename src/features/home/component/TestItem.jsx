import React from "react";
import { useNavigate } from "react-router-dom";

export default function TestItem({ test }) {
    const navigate = useNavigate();

    const handleClick = () => {
        // Chuyển tới trang làm bài kèm testId
        navigate(`/test/${test._id}`);
    };

    return (
        <div
            className="p-4 mb-4 bg-white rounded shadow hover:shadow-lg cursor-pointer"
            onClick={handleClick}
        >
            <h3 className="text-lg font-semibold">{test.title}</h3>
            <p className="text-gray-600">{test.description}</p>
        </div>
    );
}
