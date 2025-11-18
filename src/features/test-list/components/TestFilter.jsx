// src/features/test-list/components/TestFilter.jsx
import React from 'react';

const TestFilter = ({ currentFilters, onFilterChange }) => {
    const handleStatusChange = (e) => {
        onFilterChange({ ...currentFilters, status: e.target.value });
    };

    const handleSearchChange = (e) => {
        onFilterChange({ ...currentFilters, search: e.target.value });
    };

    return (
        <div className="flex items-center gap-4 mb-6">
            {/* Filter trạng thái */}
            <select
                value={currentFilters.status}
                onChange={handleStatusChange}
                className="border rounded p-2"
            >
                <option value="All">Tất cả</option>
                <option value="Active">Đang diễn ra</option>
                <option value="Pending">Sắp diễn ra</option>
                <option value="Expired">Đã hết hạn</option>
            </select>

            {/* Input tìm kiếm */}
            <input
                type="text"
                placeholder="Tìm theo tên bài thi..."
                value={currentFilters.search}
                onChange={handleSearchChange}
                className="border rounded p-2 flex-1"
            />
        </div>
    );
};

export default TestFilter;
