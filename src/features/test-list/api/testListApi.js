// src/features/test-list/api/testListApi.js

// Giả định bạn có một client Axios đã cấu hình
// import api from '../../../shared/lib/axios';

const mockTests = [
    { id: 1, name: "Kiểm tra Giữa kỳ Toán", subject: "Toán", duration: 60, startTime: "2025-11-18T20:00:00.000Z", endTime: "2025-11-18T21:00:00.000Z" },
    { id: 2, name: "Ôn tập Chương 3 Lý", subject: "Lý", duration: 45, startTime: "2025-11-20T14:30:00.000Z", endTime: "2025-11-20T15:15:00.000Z" },
    { id: 3, name: "Thực hành Văn", subject: "Văn", duration: 90, startTime: "2025-11-17T09:00:00.000Z", endTime: "2025-11-17T10:30:00.000Z" },
];

/**
 * Lấy danh sách các bài thi đã được giao cho học sinh.
 * @param {object} filters - Các tham số lọc (ví dụ: status, search).
 */
export const getStudentTests = async (filters) => {
    // Trong thực tế: const response = await api.get('/student/tests', { params: filters });
    // return response.data;

    // Simulate API delay and return mock data
    return new Promise(resolve => {
        setTimeout(() => {
            const now = new Date();
            const filteredData = mockTests.map(test => {
                const isExpired = now > new Date(test.endTime);
                const isPending = now < new Date(test.startTime);
                const isActive = !isExpired && !isPending;

                return {
                    ...test,
                    status: isExpired ? 'Expired' : (isActive ? 'Active' : 'Pending')
                };
            }).filter(test => {
                if (filters.status && filters.status !== 'All' && test.status !== filters.status) return false;
                if (filters.search) return test.name.toLowerCase().includes(filters.search.toLowerCase());
                return true;
            });
            resolve(filteredData);
        }, 500);
    });
};