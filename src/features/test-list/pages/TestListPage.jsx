// src/features/test-list/pages/TestListPage.jsx
import React, { useState } from 'react';
import { useFetchTests } from '../hooks/useFetchTests';
import TestCard from '../components/TestCard';
import TestFilter from "../components/TestFilter.jsx";

const TestListPage = () => {
    // Quản lý trạng thái lọc/tìm kiếm cục bộ bằng useState (hoặc dùng Zustand nếu phức tạp)
    const [filters, setFilters] = useState({ status: 'All', search: '' });

    // Gọi Custom Hook để fetch dữ liệu từ server
    const { data: tests, isLoading, isError } = useFetchTests(filters);

    if (isLoading) {
        return <div className="text-center mt-8">Đang tải danh sách bài thi...</div>;
    }

    if (isError) {
        return <div className="text-center mt-8 text-red-500">Lỗi khi tải danh sách.</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Danh sách Bài thi của bạn</h1>

            {/* Component lọc */}
            <TestFilter currentFilters={filters} onFilterChange={setFilters} />

            <div className="mt-8">
                {tests && tests.length > 0 ? (
                    tests.map(test => (
                        <TestCard key={test.id} test={test} />
                    ))
                ) : (
                    <div className="text-center text-gray-500 p-10 border rounded-lg">
                        Không tìm thấy bài thi nào phù hợp với điều kiện lọc.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestListPage;