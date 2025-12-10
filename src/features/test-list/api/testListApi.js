import instance from "../../../shared/lib/axios.config.js";
import axios from "axios";

export const getListTests = async (params = {}) => {
    try {
        const response = await instance.get("/testList");
        return response.data;
    } catch (error) {
        console.error(error);
        return {
            data: [],
            total: 0,
            page: 1,
            size: 10,
        }
    }
};

export const updateTestApi = async (testId, payload) => {
    try {
        // payload chỉ cần chứa các trường thay đổi.
        // Ví dụ: { title: "New Name" } hoặc { questions: [...] }
        const response = await axios.put(`/api/testList/${testId}`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};