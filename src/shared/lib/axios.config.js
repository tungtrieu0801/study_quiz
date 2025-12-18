import axios from 'axios'
import {toast} from "react-toastify";

const instance = axios.create({
    // baseURL: '/api',
    baseURL: 'http://localhost:5000/api',
});

instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Nếu gặp lỗi 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            if (error.response.data.message === 'Invalid token') {
                console.log("Token hết hạn hoặc không hợp lệ. Đang đăng xuất...");

                // 1. Xóa token cũ đi để tránh gửi lại token sai
                localStorage.removeItem('authToken');
                localStorage.removeItem('user'); // Xóa cả user info nếu có

                // 2. Đá về trang login
                // Dùng window.location để force reload lại trang, xóa sạch state cũ
                toast.warn("Hệ thống đang quá tải, vui lòng đăng nhập lại, xin cảm ơn!!!")
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);

                // Không return Promise.reject để tránh các lỗi đỏ lòm hiện lên UI
                // Tuy nhiên nếu code của bạn cần catch, hãy giữ dòng dưới
                return Promise.reject(error);
            }
            if (error.response.data.message === 'Mật khẩu không chính xác') {
                toast.warn('Mật khẩu không chính xác');
            }
            if (error.response.data.message === 'Nhập sai thông tin tài khoản') {
                toast.warn('Nhập sai thông tin tài khoản');
            }
        }
        return Promise.reject(error);
    }
);

export default instance;