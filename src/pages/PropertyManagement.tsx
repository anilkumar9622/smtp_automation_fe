import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Select, Switch, Table, Tag, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  createPropertyService,
  deletePropertyService,
  listPropertiesService,
  setBulkPropertyExpiryService,
  setPropertyExpiryService,
  updatePropertyService,
  type ManagedProperty,
} from "../services/propertyServices";
import { refreshPropertyOptions } from "../hooks/usePropertyOptions";
import "../css/UserManagement.css";
import "../css/PropertyManagement.css";

dayjs.extend(relativeTime);

const { Text } = Typography;

// Properties expiring within this many days are flagged.
const EXPIRING_SOON_DAYS = 7;

type PropertyState = "disabled" | "expired" | "soon" | "active" | "none";

const propertyState = (p: ManagedProperty): PropertyState => {
  if (!p.is_active) return "disabled";
  if (!p.expiry_date) return "none";
  const expiry = dayjs(p.expiry_date);
  if (expiry.isBefore(dayjs())) return "expired";
  if (expiry.diff(dayjs(), "day") < EXPIRING_SOON_DAYS) return "soon";
  return "active";
};

const STATE_META: Record<PropertyState, { label: string; className: string }> = {
  disabled: { label: "Disabled", className: "inactive" },
  expired: { label: "Expired", className: "inactive" },
  soon: { label: "Expiring soon", className: "soon" },
  active: { label: "Active", className: "active" },
  none: { label: "Active · no expiry", className: "active" },
};

const getCurrentRole = (): string | undefined => {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "{}").role;
  } catch {
    return undefined;
  }
};

// Who the expiry modal applies to: one property, the selected rows, or all.
type ExpiryTarget = { kind: "one"; property: ManagedProperty } | { kind: "selected"; codes: string[] } | { kind: "all" };

interface PropertyFormValues {
  property_code: string;
  property_name: string;
  is_active: boolean;
}

export default function PropertyManagement() {
  // The page is SUPER_ADMIN only (route + backend); this is a second guard
  // for the expiry controls.
  const canManageExpiry = getCurrentRole() === "SUPER_ADMIN";

  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<PropertyState | undefined>();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const [target, setTarget] = useState<ExpiryTarget | null>(null);
  const [expiryDate, setExpiryDate] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();

  // `null` = closed, "new" = add, otherwise the property being edited.
  const [editing, setEditing] = useState<ManagedProperty | "new" | null>(null);
  const [form] = Form.useForm<PropertyFormValues>();

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

  // Reload the table and the dropdown list used by the other pages.
  const afterChange = () => {
    fetchProperties();
    refreshPropertyOptions().catch(() => undefined);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (stateFilter && propertyState(p) !== stateFilter) return false;
      if (!term) return true;
      return [p.property_code, p.property_name].some((f) => f.toLowerCase().includes(term));
    });
  }, [properties, search, stateFilter]);

  const stats = useMemo(() => {
    const count = (s: PropertyState) => properties.filter((p) => propertyState(p) === s).length;
    return {
      total: properties.length,
      active: properties.filter((p) => p.is_active).length,
      disabled: count("disabled"),
      expired: count("expired"),
      soon: count("soon"),
    };
  }, [properties]);

  // ---- Add / edit / disable / delete ----

  const openPropertyModal = (p: ManagedProperty | "new") => {
    form.resetFields();
    form.setFieldsValue(
      p === "new"
        ? { property_code: "", property_name: "", is_active: true }
        : { property_code: p.property_code, property_name: p.property_name, is_active: p.is_active }
    );
    setEditing(p);
  };

  const handleSaveProperty = async () => {
    if (!editing) return;
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const msg =
        editing === "new"
          ? await createPropertyService({
              property_code: values.property_code.trim().toUpperCase(),
              property_name: values.property_name.trim(),
              is_active: values.is_active,
            })
          : await updatePropertyService(editing.property_code, {
              property_name: values.property_name.trim(),
              is_active: values.is_active,
            });
      message.success(msg);
      setEditing(null);
      afterChange();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = (p: ManagedProperty) => {
    const enabling = !p.is_active;
    modal.confirm({
      title: `${enabling ? "Enable" : "Disable"} ${p.property_name} (${p.property_code})?`,
      content: enabling
        ? "Booking confirmation emails for this property will start sending again."
        : "Booking confirmation emails for this property will stop sending, and it can't be picked for new templates or users. Existing templates and users are kept.",
      okText: enabling ? "Enable" : "Disable",
      okButtonProps: { danger: !enabling },
      centered: true,
      onOk: async () => {
        try {
          message.success(await updatePropertyService(p.property_code, { is_active: enabling }));
          afterChange();
        } catch (err: any) {
          message.error(err.message);
        }
      },
    });
  };

  const handleDelete = (p: ManagedProperty) => {
    modal.confirm({
      title: `Delete ${p.property_name} (${p.property_code})?`,
      content: "This permanently removes the property. It's only allowed when no templates or users are linked to it — otherwise disable it instead.",
      okText: "Delete",
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        try {
          message.success(await deletePropertyService(p.property_code));
          setSelectedCodes((codes) => codes.filter((c) => c !== p.property_code));
          afterChange();
        } catch (err: any) {
          message.error(err.message);
        }
      },
    });
  };

  // ---- Expiry (SUPER_ADMIN) ----

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

  const handleSaveExpiry = () => {
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

  const handleRemoveExpiry = (t: ExpiryTarget) => {
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
      width: 170,
      render: (_, p) => {
        const meta = STATE_META[propertyState(p)];
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
      width: 200,
      sorter: (a, b) => dayjs(a.expiry_date ?? "9999-12-31").valueOf() - dayjs(b.expiry_date ?? "9999-12-31").valueOf(),
      render: (val: string | null, p) =>
        val ? (
          <div className="um-date-cell">
            <span>{dayjs(val).format("DD MMM YYYY")}</span>
            <span className={`um-date-sub ${p.is_expired || propertyState(p) === "soon" ? "stale" : ""}`}>
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
      width: canManageExpiry ? 230 : 150,
      fixed: "right",
      render: (_, p) => (
        <div className="um-actions">
          <Tooltip title="Edit property">
            <Button shape="circle" icon={<EditOutlined />} className="um-action-btn edit" onClick={() => openPropertyModal(p)} />
          </Tooltip>
          <Tooltip title={p.is_active ? "Disable property" : "Enable property"}>
            <Button
              shape="circle"
              icon={p.is_active ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              className={`um-action-btn ${p.is_active ? "deactivate" : "activate"}`}
              onClick={() => handleToggleActive(p)}
            />
          </Tooltip>
          {canManageExpiry && (
            <>
              <Tooltip title="Set expiry">
                <Button shape="circle" icon={<CalendarOutlined />} className="um-action-btn" onClick={() => openExpiryModal({ kind: "one", property: p })} />
              </Tooltip>
              <Tooltip title={p.expiry_date ? "Remove expiry" : "No expiry set"}>
                <Button
                  shape="circle"
                  disabled={!p.expiry_date}
                  icon={<ClockCircleOutlined />}
                  className="um-action-btn"
                  onClick={() => handleRemoveExpiry({ kind: "one", property: p })}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Delete property">
            <Button shape="circle" danger icon={<DeleteOutlined />} className="um-action-btn" onClick={() => handleDelete(p)} />
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
              Add, rename, disable or delete properties.
              {canManageExpiry && " Set a service expiry per property or for all at once."} Disabled or expired properties stop sending booking confirmation emails.
            </p>
          </div>
          <div className="um-hero-actions">
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchProperties} loading={loading} className="um-refresh-btn" />
            </Tooltip>
            {canManageExpiry && (
              <>
                <Button onClick={() => handleRemoveExpiry({ kind: "all" })}>Remove All Expiries</Button>
                <Button icon={<CalendarOutlined />} onClick={() => openExpiryModal({ kind: "all" })}>
                  Set Expiry for All
                </Button>
              </>
            )}
            <Button type="primary" icon={<PlusOutlined />} className="um-primary-btn" onClick={() => openPropertyModal("new")}>
              Add Property
            </Button>
          </div>
        </div>

        <div className="um-stats">
          <div className="um-stat total">
            <span className="um-stat-icon"><HomeOutlined /></span>
            <div><span className="um-stat-value">{stats.total}</span><span className="um-stat-label">Properties</span></div>
          </div>
          <div className="um-stat active">
            <span className="um-stat-icon"><CheckCircleOutlined /></span>
            <div><span className="um-stat-value">{stats.active}</span><span className="um-stat-label">Enabled</span></div>
          </div>
          <div className="um-stat inactive">
            <span className="um-stat-icon"><StopOutlined /></span>
            <div><span className="um-stat-value">{stats.disabled + stats.expired}</span><span className="um-stat-label">Disabled / expired</span></div>
          </div>
          <div className="um-stat stale">
            <span className="um-stat-icon"><ClockCircleOutlined /></span>
            <div><span className="um-stat-value">{stats.soon}</span><span className="um-stat-label">Expiring in {EXPIRING_SOON_DAYS} days</span></div>
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
              options={(Object.keys(STATE_META) as PropertyState[]).map((s) => ({ value: s, label: STATE_META[s].label }))}
              className="um-filter"
            />
            {canManageExpiry && selectedCodes.length > 0 && (
              <div className="pm-bulk">
                <span>{selectedCodes.length} selected</span>
                <Button size="small" icon={<CalendarOutlined />} onClick={() => openExpiryModal({ kind: "selected", codes: selectedCodes })}>
                  Set Expiry
                </Button>
                <Button size="small" danger onClick={() => handleRemoveExpiry({ kind: "selected", codes: selectedCodes })}>
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
            scroll={{ x: 1150 }}
            rowSelection={canManageExpiry ? { selectedRowKeys: selectedCodes, onChange: (keys) => setSelectedCodes(keys as string[]) } : undefined}
            rowClassName={(p) => (!p.is_active || p.is_expired ? "um-row-inactive" : "")}
            pagination={false}
            locale={{ emptyText: loading ? " " : "No properties match these filters" }}
          />
        </div>
      </div>

      <Modal
        open={!!editing}
        title={
          <span className="um-modal-title">
            {editing === "new" ? <PlusOutlined /> : <EditOutlined />} {editing === "new" ? "Add Property" : "Edit Property"}
          </span>
        }
        okText={editing === "new" ? "Add Property" : "Save"}
        onOk={handleSaveProperty}
        onCancel={() => setEditing(null)}
        okButtonProps={{ className: "um-primary-btn" }}
        confirmLoading={submitting}
        centered
        width={480}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark="optional" className="um-form">
          <Form.Item
            name="property_code"
            label="Property Code"
            normalize={(v: string) => v?.toUpperCase()}
            extra={
              editing === "new"
                ? "As it appears in the booking subject, e.g. \"Confirmation # from TLACH\". Templates are named <code>_for_customer / _for_agent. Can't be changed later."
                : "The code can't be changed — it's used in template names and email history."
            }
            rules={[
              { required: true, message: "Code is required" },
              { pattern: /^[A-Z0-9]{2,12}$/, message: "2–12 letters or digits, no spaces" },
            ]}
          >
            <Input placeholder="e.g. TLACH" disabled={editing !== "new"} maxLength={12} />
          </Form.Item>
          <Form.Item name="property_name" label="Property Name" rules={[{ required: true, whitespace: true, message: "Name is required" }]}>
            <Input placeholder="e.g. The Leela Ambience Convention Hotel Delhi" />
          </Form.Item>
          <Form.Item name="is_active" label="Enabled" valuePropName="checked" extra="Disabled properties don't send booking confirmation emails.">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!target}
        title={
          <span className="um-modal-title">
            <CalendarOutlined /> Set Expiry
          </span>
        }
        okText="Save"
        onOk={handleSaveExpiry}
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
