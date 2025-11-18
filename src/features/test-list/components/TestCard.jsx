// src/features/test-list/components/TestCard.jsx
import React from 'react';
import { useTestStatus } from '../hooks/useTestStatus';
// Giả định có hàm định dạng thời gian từ shared
import { convertUtcToTimeAmPm } from '../../../shared/utils/timeUtils';

const STATUS_COLORS = {
    Active: 'bg-green-500',
    Pending: 'bg-blue-500',
    Expired: 'bg-red-500',
};

const TestCard = ({ test }) => {
    const { status, timeLeftMsg } = useTestStatus(test.startTime, test.endTime);

    // Giả định hàm chuyển hướng
    const handleStartTest = () => {
        if (status === 'Active') {
            // Chuyển hướng đến trang làm bài
            console.log(`Bắt đầu làm bài thi ID: ${test.id}`);
        }
    };

    const actionText = status === 'Active' ? 'Bắt đầu làm bài' : (status === 'Pending' ? 'Chờ đợi' : 'Xem kết quả');

    return (
        <div className="border p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold">{test.name}</h3>
                <p className="text-sm text-gray-600">Môn học: {test.subject}</p>
                <p className="text-sm text-gray-600">Thời gian: {test.duration} phút</p>
                <p className="text-sm text-gray-600">Bắt đầu: {convertUtcToTimeAmPm(test.startTime)}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${STATUS_COLORS[status]}`}>
                    {status}
                </span>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium mb-2">{timeLeftMsg}</p>
                <button
                    onClick={handleStartTest}
                    disabled={status !== 'Active'}
                    className={`px-4 py-2 rounded text-white ${status === 'Active' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {actionText}
                </button>
            </div>
        </div>
    );
};

export default TestCard;