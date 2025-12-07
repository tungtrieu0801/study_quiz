import {useState} from "react";
import useAuth from "../hooks/useAuth.js";
import { message } from "antd";
import instance from "../../shared/lib/axios.config.js";
import {toast} from "react-toastify";

const useTestManagement = () => {
    const [creating, setCreating] = useState(false);
    const { isTeacher } = useAuth();
    /**
     * Create test for student
     * @param values - data form input
     * @param onSuccess - callback function after test was created successfully
     * @returns {Promise<void>}
     */
    const createTest = async (values, onSuccess) => {
        if (!isTeacher) {
            message.error("Bạn không có quyền thực hiện thao tác này");
            return;
        }
        setCreating(true);
        try {
            const payload = { ...values, duration: `${values.duration}` };
            const res = await instance.post("/testList", payload);
            if (res.data.data) {
                toast.success("🎉 Tạo bài kiểm tra thành công!");
                if (onSuccess) onSuccess(res.data.data);
            }
        } catch (error) {
            console.log(error);
            toast.success("Đã có lỗi xảy ra!");
        } finally {
            setCreating(false);
        }
    }
    return {
        createTest,
        creating
    }
}

export default useTestManagement;