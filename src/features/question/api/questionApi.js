import instance from "../../../shared/lib/axios.config";

const questionApi = {
    // --- QUESTION CRUD ---
    // Lấy danh sách câu hỏi (có phân trang & lọc)
    getAll: (params) => {
        return instance.get("/questions", { params });
    },

    create: (data) => {
        return instance.post("/questions", data);
    },

    update: (id, data) => {
        return instance.put(`/questions/${id}`, data);
    },

    delete: (id) => {
        return instance.delete(`/questions/${id}`);
    },

    getTags: () => {
        return instance.get("/tag");
    },

    createTag: (data) => {
        return instance.post("/tag", data);
    },

    getTests: () => {
        return instance.get("/testList");
    }
};

export default questionApi;