import React from "react";
import { Modal, Card, Statistic, Row, Col, Progress, List, Empty, Tooltip, Button, Table } from "antd";
import { BarChartOutlined, UserOutlined, TrophyOutlined, FallOutlined, RightOutlined, FullscreenOutlined } from "@ant-design/icons";

export default function StatisticsModal({
                                            open,
                                            onCancel,
                                            loading,
                                            data,
                                            allTags,
                                            onViewTagDetail,
                                            onExpandLeaderboard,
                                            leaderboardColumns,
                                            onRowClick
                                        }) {
    return (
        <Modal
            title={<div className="flex items-center gap-3 text-2xl text-slate-800 py-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><BarChartOutlined /></div>
                Báo cáo kết quả bài thi</div>}
            width={1000}
            centered
            onCancel={onCancel}
            open={open}
            footer={null}
            className="rounded-2xl overflow-hidden top-5"
            styles={{ body: { padding: "24px", backgroundColor: "#f8fafc" } }}
        >
            {loading || !data ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500">Đang tổng hợp dữ liệu...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card bordered={false} className="shadow-sm"><Statistic title="Tổng lượt thi" value={data.totalAttempts} prefix={<UserOutlined className="text-blue-500" />} valueStyle={{ fontWeight: 'bold' }} /></Card>
                        <Card bordered={false} className="shadow-sm"><Statistic title="Điểm trung bình" value={data.averageScore} precision={2} prefix={<TrophyOutlined className="text-yellow-500" />} valueStyle={{ fontWeight: 'bold' }} /></Card>
                        <Card bordered={false} className="shadow-sm">
                            <div className="flex justify-between items-end">
                                <Statistic title="Cao nhất" value={data.highestScore} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} />
                                <div className="h-8 w-px bg-slate-200 mx-4"></div>
                                <Statistic title="Thấp nhất" value={data.lowestScore} valueStyle={{ color: '#cf1322', fontWeight: 'bold' }} />
                            </div>
                        </Card>
                    </div>

                    <Row gutter={24}>
                        {/* Score Distribution */}
                        <Col span={24} md={12}>
                            <Card title="Phổ điểm" bordered={false} className="shadow-sm h-full rounded-xl">
                                <div className="space-y-4 pt-2">
                                    {[{ l: "Kém (0-2)", c: '#ff4d4f', idx: 0 }, { l: "Yếu (2-4)", c: '#ff7a45', idx: 1 }, { l: "Trung bình (4-6)", c: '#faad14', idx: 2 }, { l: "Khá (6-8)", c: '#13c2c2', idx: 3 }, { l: "Giỏi (8-10)", c: '#52c41a', idx: 4 }].map((item) => {
                                        const count = data.scoreDistribution[item.idx];
                                        const percent = data.totalAttempts ? (count / data.totalAttempts) * 100 : 0;
                                        return (<div key={item.idx} className="flex items-center gap-3"><span className="w-24 text-xs font-semibold text-slate-500">{item.l}</span><Progress percent={percent} strokeColor={item.c} showInfo={false} size="small" className="flex-1 m-0" /><span className="w-12 text-right text-xs font-bold text-slate-700">{count} HS</span></div>);
                                    })}
                                </div>
                            </Card>
                        </Col>

                        {/* Tag Analysis */}
                        <Col span={24} md={12}>
                            <Card
                                title={<><FallOutlined className="text-red-500 mr-2" />Chủ đề học sinh yếu nhất</>}
                                bordered={false} className="shadow-sm h-full rounded-xl"
                                bodyStyle={{ padding: '12px 24px' }}
                            >
                                <List
                                    itemLayout="horizontal"
                                    dataSource={data.tagAnalysis}
                                    renderItem={(item) => {
                                        const tagObj = allTags.find(t => t._id === item.tag || t.name === item.tag);
                                        const tagName = tagObj ? tagObj.name : (item.tag || "Không xác định");
                                        return (
                                            <List.Item
                                                className="border-b-0 py-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2"
                                                onClick={() => onViewTagDetail(item.tag)}>
                                                <div className="w-full">
                                                    <div className="flex justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-700">{tagName}</span>
                                                            <Tooltip title="Bấm để xem danh sách học sinh yếu tag này"><RightOutlined className="text-xs text-slate-300" /></Tooltip>
                                                        </div>
                                                        <span className="text-red-500 font-bold text-xs">{item.wrongRate}% sai</span>
                                                    </div>
                                                    <Progress percent={parseFloat(item.wrongRate)} status="exception" showInfo={false} size="small" strokeWidth={6} />
                                                    <div className="text-xs text-gray-400 mt-1">Sai {item.wrongCount} / {item.total} lần xuất hiện</div>
                                                </div>
                                            </List.Item>
                                        );
                                    }}
                                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa đủ dữ liệu phân tích" /> }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Compact Leaderboard */}
                    <Card
                        title={<><TrophyOutlined className="text-yellow-500 mr-2" />Bảng xếp hạng kết quả</>}
                        bordered={false}
                        className="shadow-sm rounded-xl"
                        extra={
                            <Button type="text" icon={<FullscreenOutlined />} className="text-blue-600 hover:bg-blue-50" onClick={onExpandLeaderboard}>
                                Mở rộng
                            </Button>
                        }
                    >
                        <Table
                            dataSource={data.leaderboard}
                            columns={leaderboardColumns}
                            rowKey="_id"
                            pagination={false}
                            scroll={{ y: 300 }}
                            size="middle"
                            onRow={(record) => ({
                                onClick: () => onRowClick(record),
                                style: { cursor: 'pointer' },
                                className: "hover:bg-blue-50 transition-colors"
                            })}
                        />
                    </Card>
                </div>
            )}
        </Modal>
    );
}