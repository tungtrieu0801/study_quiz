/**
 * Chuyển đổi một chuỗi thời gian UTC thành định dạng giờ địa phương HH:MM AM/PM.
 * * @param {string} utcDateString - Chuỗi thời gian UTC hợp lệ (ví dụ: '2025-11-18T10:30:00.000Z').
 * @returns {string} Định dạng thời gian (ví dụ: '05:30 PM' nếu múi giờ là GMT+7).
 */
export const convertUtcToTimeAmPm = (utcDateString) => {
    if (!utcDateString) {
        return '';
    }

    // 1. Tạo đối tượng Date từ chuỗi UTC
    const date = new Date(utcDateString);

    // Kiểm tra tính hợp lệ
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    // 2. Sử dụng Intl.DateTimeFormat để định dạng giờ theo múi giờ địa phương
    // locale: 'en-US' thường dùng để đảm bảo định dạng AM/PM
    const options = {
        hour: '2-digit', // Giờ (ví dụ: 05)
        minute: '2-digit', // Phút (ví dụ: 30)
        hour12: true, // Dùng định dạng 12 giờ (AM/PM)
        // timezone: 'current' (mặc định sẽ dùng múi giờ của trình duyệt)
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Ví dụ về cách dùng (Bạn có thể xoá phần này khi đưa vào dự án)
/*
const sampleUtcTime = '2025-11-18T10:30:00.000Z';
const localTime = convertUtcToTimeAmPm(sampleUtcTime);
console.log(localTime); // Kết quả sẽ thay đổi tùy theo múi giờ của bạn (ví dụ: '5:30 PM' nếu ở Việt Nam GMT+7)
*/