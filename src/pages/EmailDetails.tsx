import { useEffect, useState } from "react";
import { Table, Input, DatePicker, Tag, Typography, Space, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import Header from "../components/Header";
import { listIncomingEmailsService, type IncomingEmailRow } from "../services/incomingEmailServices";

const { RangePicker } = DatePicker;
const { Text, Paragraph } = Typography;

export default function EmailDetails() {
  const [rows, setRows] = useState<IncomingEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await listIncomingEmailsService({
        page,
        limit,
        search: search || undefined,
        dateFrom: dateRange?.[0],
        dateTo: dateRange?.[1],
      });
      setRows(result.data);
      setTotal(result.pagination.total);
    } catch (err: any) {
      message.error(err.message || "Failed to load email details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, dateRange]);

  const columns: ColumnsType<IncomingEmailRow> = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Property", dataIndex: "property_name", width: 190, ellipsis: true, render: (name: string | null, r) => name || r.property_code || <Text type="secondary">—</Text> },
    { title: "Sender", dataIndex: "sender", width: 220, ellipsis: true },
    { title: "Recipient", dataIndex: "recipient", width: 220, ellipsis: true },
    { title: "Subject", dataIndex: "subject", width: 220, ellipsis: true },
    { title: "Reservation No.", dataIndex: "reservation_number", width: 150 },
    { title: "Guest Name", dataIndex: "guest_name", width: 170, ellipsis: true },
    { title: "Check In", dataIndex: "check_in", width: 110 },
    { title: "Check Out", dataIndex: "check_out", width: 110 },
    {
      title: "Status",
      dataIndex: "email_sent_status",
      width: 110,
      render: (status: string | null) => {
        if (status === "success") return <Tag color="green">Success</Tag>;
        if (status === "failed") return <Tag color="red">Failed</Tag>;
        return <Tag>Unknown</Tag>;
      },
    },
    {
      title: "Error Remarks",
      dataIndex: "error_remarks",
      width: 220,
      render: (remarks: string | null) =>
        remarks ? (
          <Tooltip title={remarks}>
            <Text type="danger" ellipsis style={{ maxWidth: 200, display: "inline-block" }}>
              {remarks}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Received At",
      dataIndex: "created_at",
      width: 170,
      render: (val: string) => dayjs(val).format("DD MMM YYYY, HH:mm"),
    },
  ];

  return (
    <>
      <div className="glass-header">
        <Header />
      </div>
      <div style={{ paddingTop: 64, padding: "84px 24px 24px" }}>
        <Space style={{ marginBottom: 16, flexWrap: "wrap" }} size="middle">
          <Input.Search
            placeholder="Search sender, recipient, reservation no, guest name"
            allowClear
            style={{ width: 340 }}
            onSearch={(val) => {
              setPage(1);
              setSearch(val);
            }}
          />
          <RangePicker
            onChange={(_, dateStrings) => {
              setPage(1);
              setDateRange(dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null);
            }}
          />
        </Space>

        <Table<IncomingEmailRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 1950 }}
          expandable={{
            expandedRowRender: (record) => (
              <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12 }}>
                {JSON.stringify(record.raw_data, null, 2)}
              </Paragraph>
            ),
            rowExpandable: (record) => Boolean(record.raw_data),
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
        />
      </div>
    </>
  );
}
