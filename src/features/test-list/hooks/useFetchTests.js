// src/features/test-list/hooks/useFetchTests.js
import { useQuery } from '@tanstack/react-query';
import { getStudentTests } from '../api/testListApi';

/**
 * Hook tùy chỉnh để lấy danh sách bài thi của học sinh.
 * @param {object} filters - Bộ lọc hiện tại (status, search).
 */
export const useFetchTests = (filters) => {
    const mockTests = [
        { id: 1, name: "Kiểm tra Giữa kỳ Toán", subject: "Toán", duration: 60, startTime: "2025-11-18T20:00:00.000Z", endTime: "2025-11-18T21:00:00.000Z" },
        { id: 2, name: "Ôn tập Chương 3 Lý", subject: "Lý", duration: 45, startTime: "2025-11-20T14:30:00.000Z", endTime: "2025-11-20T15:15:00.000Z" },
        { id: 3, name: "Thực hành Văn", subject: "Văn", duration: 90, startTime: "2025-11-17T09:00:00.000Z", endTime: "2025-11-17T10:30:00.000Z" },
    ];

    // Fake dữ liệu luôn load xong ngay lập tức
    return { data: mockTests, isLoading: false, isError: false };
};
