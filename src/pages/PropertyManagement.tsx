import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, Modal, Select, Table, Tag, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  listPropertiesService,
  setBulkPropertyExpiryService,
  setPropertyExpiryService,
  type ManagedProperty,
} from "../services/propertyServices";
import "../css/UserManagement.css";
import "../css/PropertyManagement.css";

dayjs.extend(relativeTime);

const { Text } = Typography;

// Properties expiring within this many days are flagged.
const EXPIRING_SOON_DAYS = 7;

type ExpiryState = "expired" | "soon" | "active" | "none";

const expiryState = (p: ManagedProperty): ExpiryState => {
  if (!p.expiry_date) return "none";
  const expiry = dayjs(p.expiry_date);
  if (expiry.isBefore(dayjs())) return "expired";
  if (expiry.diff(dayjs(), "day") < EXPIRING_SOON_DAYS) return "soon";
  return "active";
};

const STATE_META: Record<ExpiryState, { label: string; className: string }> = {
  expired: { label: "Expired", className: "inactive" },
  soon: { label: "Expiring soon", className: "soon" },
  active: { label: "Active", className: "active" },
  none: { label: "No expiry", className: "active" },
};

// Who the expiry modal applies to: one property, the selected rows, or all.
type ExpiryTarget = { kind: "one"; property: ManagedProperty } | { kind: "selected"; codes: string[] } | { kind: "all" };

export default function PropertyManagement() {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<ExpiryState | undefined>();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const [target, setTarget] = useState<ExpiryTarget | null>(null);
  const [expiryDate, setExpiryDate] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();

  const fetchProperties = async () => {
    setLoading(true);
    try {
      setProperties(await listPropertiesService());
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (stateFilter && expiryState(p) !== stateFilter) return false;
      if (!term) return true;
      return [p.property_code, p.property_name].some((f) => f.toLowerCase().includes(term));
    });
  }, [properties, search, stateFilter]);

  const stats = useMemo(() => {
    const count = (s: ExpiryState) => properties.filter((p) => expiryState(p) === s).length;
    return { total: properties.length, expired: count("expired"), soon: count("soon"), none: count("none") };
  }, [properties]);

  const targetLabel = (t: ExpiryTarget) =>
    t.kind === "one"
      ? `${t.property.property_name} (${t.property.property_code})`
      : t.kind === "selected"
        ? `${t.codes.length} selected propert${t.codes.length === 1 ? "y" : "ies"}`
        : `all ${properties.length} properties`;

  const openExpiryModal = (t: ExpiryTarget) => {
    setExpiryDate(t.kind === "one" && t.property.expiry_date ? dayjs(t.property.expiry_date) : null);
    setTarget(t);
  };

  // `date` null removes the expiry.
  const applyExpiry = async (t: ExpiryTarget, date: Dayjs | null) => {
    // The property keeps working through the whole of the chosen day.
    const iso = date ? date.endOf("day").toISOString() : null;
    setSubmitting(true);
    try {
      const msg =
        t.kind === "one"
          ? await setPropertyExpiryService(t.property.property_code, iso)
          : await setBulkPropertyExpiryService(iso, t.kind === "selected" ? t.codes : undefined);
      message.success(msg);
      setTarget(null);
      if (t.kind === "selected") setSelectedCodes([]);
      fetchProperties();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => {
    if (!target || !expiryDate) return;
    const isPast = expiryDate.endOf("day").isBefore(dayjs());
    modal.confirm({
      title: `Set expiry for ${targetLabel(target)}?`,
      content: isPast
        ? `This date is in the past — booking confirmation emails will stop immediately for ${targetLabel(target)}.`
        : `Booking confirmation emails will stop after ${expiryDate.format("DD MMM YYYY")}.`,
      okText: "Set Expiry",
      okButtonProps: { danger: isPast },
      centered: true,
      onOk: () => applyExpiry(target, expiryDate),
    });
  };

  const handleRemove = (t: ExpiryTarget) => {
    modal.confirm({
      title: `Remove expiry for ${targetLabel(t)}?`,
      content: "The service will run with no end date, and emails will start sending again if it had expired.",
      okText: "Remove Expiry",
      centered: true,
      onOk: () => applyExpiry(t, null),
    });
  };

  const columns: ColumnsType<ManagedProperty> = [
    {
      title: "Property",
      dataIndex: "property_name",
      width: 320,
      sorter: (a, b) => a.property_name.localeCompare(b.property_name),
      render: (_, p) => (
        <span className="um-property">
          <span className="um-property-code">{p.property_code}</span>
          <span className="um-property-name">{p.property_name}</span>
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 150,
      render: (_, p) => {
        const meta = STATE_META[expiryState(p)];
        return (
          <span className={`um-status ${meta.className}`}>
            <span className="um-status-dot" />
            {meta.label}
          </span>
        );
      },
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      width: 220,
      sorter: (a, b) => dayjs(a.expiry_date ?? "9999-12-31").valueOf() - dayjs(b.expiry_date ?? "9999-12-31").valueOf(),
      render: (val: string | null, p) =>
        val ? (
          <div className="um-date-cell">
            <span>{dayjs(val).format("DD MMM YYYY")}</span>
            <span className={`um-date-sub ${expiryState(p) !== "active" ? "stale" : ""}`}>
              {p.is_expired ? `expired ${dayjs(val).fromNow()}` : `expires ${dayjs(val).fromNow()}`}
            </span>
          </div>
        ) : (
          <Tag color="default">Never</Tag>
        ),
    },
    {
      title: "Last Updated",
      dataIndex: "updated_at",
      width: 230,
      render: (val: string | null, p) =>
        val ? (
          <div className="um-date-cell">
            <span>{dayjs(val).format("DD MMM YYYY, HH:mm")}</span>
            {p.updated_by_email && <span className="um-date-sub">by {p.updated_by_email}</span>}
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_, p) => (
        <div className="um-actions">
          <Tooltip title="Set expiry">
            <Button shape="circle" icon={<EditOutlined />} className="um-action-btn edit" onClick={() => openExpiryModal({ kind: "one", property: p })} />
          </Tooltip>
          <Tooltip title={p.expiry_date ? "Remove expiry" : "No expiry set"}>
            <Button
              shape="circle"
              disabled={!p.expiry_date}
              icon={<DeleteOutlined />}
              className="um-action-btn deactivate"
              onClick={() => handleRemove({ kind: "one", property: p })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      {modalContextHolder}
      <div className="glass-header">
        <Header />
      </div>

      <div className="um-page">
        <div className="um-hero">
          <div>
            <h1 className="um-title">
              <HomeOutlined /> Property Management
            </h1>
            <p className="um-subtitle">
              Set a service expiry per property or for all at once. Once a property expires, its booking confirmation emails stop sending.
            </p>
          </div>
          <div className="um-hero-actions">
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchProperties} loading={loading} className="um-refresh-btn" />
            </Tooltip>
            <Button onClick={() => handleRemove({ kind: "all" })}>Remove All Expiries</Button>
            <Button type="primary" icon={<CalendarOutlined />} className="um-primary-btn" onClick={() => openExpiryModal({ kind: "all" })}>
              Set Expiry for All
            </Button>
          </div>
        </div>

        <div className="um-stats">
          <div className="um-stat total">
            <span className="um-stat-icon"><HomeOutlined /></span>
            <div><span className="um-stat-value">{stats.total}</span><span className="um-stat-label">Properties</span></div>
          </div>
          <div className="um-stat inactive">
            <span className="um-stat-icon"><StopOutlined /></span>
            <div><span className="um-stat-value">{stats.expired}</span><span className="um-stat-label">Expired</span></div>
          </div>
          <div className="um-stat stale">
            <span className="um-stat-icon"><ClockCircleOutlined /></span>
            <div><span className="um-stat-value">{stats.soon}</span><span className="um-stat-label">Expiring in {EXPIRING_SOON_DAYS} days</span></div>
          </div>
          <div className="um-stat active">
            <span className="um-stat-icon"><CheckCircleOutlined /></span>
            <div><span className="um-stat-value">{stats.none}</span><span className="um-stat-label">No expiry set</span></div>
          </div>
        </div>

        <div className="um-card">
          <div className="um-toolbar">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search property name or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="um-search"
            />
            <Select
              allowClear
              placeholder="All statuses"
              value={stateFilter}
              onChange={setStateFilter}
              options={(Object.keys(STATE_META) as ExpiryState[]).map((s) => ({ value: s, label: STATE_META[s].label }))}
              className="um-filter"
            />
            {selectedCodes.length > 0 && (
              <div className="pm-bulk">
                <span>{selectedCodes.length} selected</span>
                <Button size="small" icon={<CalendarOutlined />} onClick={() => openExpiryModal({ kind: "selected", codes: selectedCodes })}>
                  Set Expiry
                </Button>
                <Button size="small" danger onClick={() => handleRemove({ kind: "selected", codes: selectedCodes })}>
                  Remove Expiry
                </Button>
              </div>
            )}
          </div>

          <Table<ManagedProperty>
            rowKey="property_code"
            columns={columns}
            dataSource={filtered}
            loading={loading}
            scroll={{ x: 1030 }}
            rowSelection={{ selectedRowKeys: selectedCodes, onChange: (keys) => setSelectedCodes(keys as string[]) }}
            rowClassName={(p) => (p.is_expired ? "um-row-inactive" : "")}
            pagination={false}
            locale={{ emptyText: loading ? " " : "No properties match these filters" }}
          />
        </div>
      </div>

      <Modal
        open={!!target}
        title={
          <span className="um-modal-title">
            <CalendarOutlined /> Set Expiry
          </span>
        }
        okText="Save"
        onOk={handleSave}
        onCancel={() => setTarget(null)}
        okButtonProps={{ className: "um-primary-btn", disabled: !expiryDate }}
        confirmLoading={submitting}
        centered
        width={440}
      >
        {target && (
          <div className="um-form">
            <p className="um-cred-note">
              Applies to <strong>{targetLabel(target)}</strong>. Emails keep sending until the end of the chosen day.
            </p>
            <DatePicker
              className="pm-date"
              format="DD MMM YYYY"
              value={expiryDate}
              onChange={setExpiryDate}
              presets={[
                { label: "+1 month", value: dayjs().add(1, "month") },
                { label: "+3 months", value: dayjs().add(3, "month") },
                { label: "+6 months", value: dayjs().add(6, "month") },
                { label: "+1 year", value: dayjs().add(1, "year") },
              ]}
            />
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}
