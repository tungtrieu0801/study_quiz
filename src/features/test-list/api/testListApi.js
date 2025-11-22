import instance from "../../../shared/lib/axios.config.js";

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