// src/features/test-list/hooks/useTestStatus.js

/**
 * Tính toán trạng thái thời gian và khoảng cách thời gian cho bài thi.
 * @param {string} startTime - Chuỗi thời gian bắt đầu UTC.
 * @param {string} endTime - Chuỗi thời gian kết thúc UTC.
 */
export const useTestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    let status = 'Pending';
    let timeLeftMsg = '';

    if (now > end) {
        status = 'Expired';
        timeLeftMsg = 'Đã hết hạn';
    } else if (now >= start && now <= end) {
        status = 'Active';
        const msRemaining = end - now;
        const minutes = Math.floor(msRemaining / (1000 * 60));
        const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
        timeLeftMsg = `Còn lại: ${minutes} phút ${seconds} giây`;
    } else {
        // Pending
        const msUntilStart = start - now;
        const days = Math.floor(msUntilStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((msUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timeLeftMsg = `Sắp diễn ra: ${days} ngày ${hours} giờ`;
    }

    return { status, timeLeftMsg };
};