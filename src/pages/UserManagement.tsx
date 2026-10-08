import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Form, Input, Modal, Select, Table, Tag, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  KeyOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PROPERTY_OPTIONS } from "../app-constant/propertyCodes";
import {
  createUserService,
  listUsersService,
  resetUserPasswordService,
  updateUserService,
  updateUserStatusService,
  type ManagedUser,
  type UserFormPayload,
  type UserRole,
} from "../services/userServices";
import "../css/UserManagement.css";

dayjs.extend(relativeTime);

const { Text } = Typography;

const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "purple" },
  ADMIN: { label: "Admin", color: "geekblue" },
  PROPERTY_OPERATOR: { label: "Property Operator", color: "orange" },
};

// Passwords older than this get flagged in the table.
const PASSWORD_STALE_DAYS = 90;

const propertyName = (code: string | null) =>
  PROPERTY_OPTIONS.find((p) => p.code === code)?.name ?? code;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";
  const values = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
};

const getCurrentUser = (): { userId?: number; role?: UserRole } => {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "{}");
  } catch {
    return {};
  }
};

type StatusFilter = "all" | "active" | "inactive";

interface UserFormValues extends UserFormPayload {
  password?: string;
  confirmPassword?: string;
}

export default function UserManagement() {
  const currentUser = useMemo(getCurrentUser, []);
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [propertyFilter, setPropertyFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Add / edit modal — `editingUser` null means "add".
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const selectedRole = Form.useWatch("role", form);

  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [passwordForm] = Form.useForm<{ password: string; confirmPassword: string }>();

  // Shown after create / password reset so the admin can pass them on —
  // the password can't be viewed again later (it's stored hashed).
  const [credentials, setCredentials] = useState<{ title: string; email: string; password: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await listUsersService());
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (propertyFilter && u.property_code !== propertyFilter) return false;
      if (statusFilter === "active" && u.isDeleted) return false;
      if (statusFilter === "inactive" && !u.isDeleted) return false;
      if (!term) return true;
      return [u.name, u.email, u.phone, propertyName(u.property_code)]
        .some((field) => field?.toLowerCase().includes(term));
    });
  }, [users, search, roleFilter, propertyFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = users.filter((u) => !u.isDeleted).length;
    const stale = users.filter(
      (u) => !u.passwordChangedAt || dayjs().diff(dayjs(u.passwordChangedAt), "day") >= PASSWORD_STALE_DAYS
    ).length;
    return { total: users.length, active, inactive: users.length - active, stale };
  }, [users]);

  // ADMIN can only create/assign property operators.
  const roleOptions = (isSuperAdmin ? (Object.keys(ROLE_META) as UserRole[]) : (["PROPERTY_OPERATOR"] as UserRole[]))
    .map((role) => ({ value: role, label: ROLE_META[role].label }));

  const propertyOptions = PROPERTY_OPTIONS.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }));

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: "PROPERTY_OPERATOR" });
    setFormOpen(true);
  };

  const openEditModal = (user: ManagedUser) => {
    setEditingUser(user);
    form.resetFields();
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      property_code: user.property_code,
    });
    setFormOpen(true);
  };

  const openPasswordModal = (user: ManagedUser) => {
    passwordForm.resetFields();
    setPasswordUser(user);
  };

  const handleFormSubmit = async () => {
    const values = await form.validateFields();
    const payload: UserFormPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || "",
      role: values.role,
      property_code: values.role === "PROPERTY_OPERATOR" ? values.property_code : null,
    };

    modal.confirm({
      title: editingUser ? "Save changes to this user?" : "Create this user?",
      content: editingUser
        ? `${editingUser.name}'s details will be updated.`
        : `${payload.name} (${payload.email}) will be able to log in as ${ROLE_META[payload.role].label} straight away.`,
      okText: editingUser ? "Save Changes" : "Create User",
      centered: true,
      onOk: async () => {
        setSubmitting(true);
        try {
          const msg = editingUser
            ? await updateUserService(editingUser.userId, payload)
            : await createUserService({ ...payload, password: values.password! });
          message.success(msg);
          setFormOpen(false);
          if (!editingUser) {
            setCredentials({ title: "User created", email: payload.email, password: values.password! });
          }
          fetchUsers();
        } catch (err: any) {
          message.error(err.message);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handlePasswordSubmit = async () => {
    if (!passwordUser) return;
    const { password } = await passwordForm.validateFields();
    const user = passwordUser;

    modal.confirm({
      title: "Reset this user's password?",
      content: `${user.name} will need to use the new password from their next login.`,
      okText: "Reset Password",
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        setSubmitting(true);
        try {
          message.success(await resetUserPasswordService(user.userId, password));
          setPasswordUser(null);
          setCredentials({ title: "Password reset", email: user.email, password });
          fetchUsers();
        } catch (err: any) {
          message.error(err.message);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleToggleStatus = (user: ManagedUser) => {
    const activate = user.isDeleted;
    modal.confirm({
      title: activate ? "Activate this user?" : "Deactivate this user?",
      content: activate
        ? `${user.name} will be able to log in again.`
        : `${user.name} will be signed out and won't be able to log in until reactivated.`,
      okText: activate ? "Activate" : "Deactivate",
      okButtonProps: { danger: !activate },
      icon: activate ? <CheckCircleOutlined style={{ color: "#52c41a" }} /> : <StopOutlined style={{ color: "#ff4d4f" }} />,
      centered: true,
      onOk: async () => {
        try {
          message.success(await updateUserStatusService(user.userId, activate));
          fetchUsers();
        } catch (err: any) {
          message.error(err.message);
        }
      },
    });
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Copied");
    } catch {
      message.error("Couldn't copy — please copy it manually");
    }
  };

  const columns: ColumnsType<ManagedUser> = [
    {
      title: "User",
      dataIndex: "name",
      width: 230,
      fixed: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, u) => (
        <div className="um-user-cell">
          <Avatar className={`um-avatar um-avatar-${u.role.toLowerCase()}`}>{initials(u.name)}</Avatar>
          <div className="um-user-meta">
            <span className="um-user-name">
              {u.name}
              {u.userId === currentUser.userId && <Tag className="um-you-tag">You</Tag>}
            </span>
            <span className="um-user-sub">{u.phone || "No phone"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Username / Email",
      dataIndex: "email",
      width: 220,
      ellipsis: true,
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (email: string) => (
        <span className="um-login">
          <Text ellipsis={{ tooltip: email }}>{email}</Text>
          <Tooltip title="Copy username">
            <CopyOutlined className="um-copy" onClick={() => copyText(email)} />
          </Tooltip>
        </span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 160,
      render: (role: UserRole) => <Tag color={ROLE_META[role]?.color}>{ROLE_META[role]?.label ?? role}</Tag>,
    },
    {
      title: "Property",
      dataIndex: "property_code",
      width: 230,
      ellipsis: true,
      render: (code: string | null) =>
        code ? (
          <Tooltip title={propertyName(code)}>
            <span className="um-property">
              <span className="um-property-code">{code}</span>
              <span className="um-property-name">{propertyName(code)}</span>
            </span>
          </Tooltip>
        ) : (
          <Text type="secondary">All properties</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "isDeleted",
      width: 110,
      render: (isDeleted: boolean) => (
        <span className={`um-status ${isDeleted ? "inactive" : "active"}`}>
          <span className="um-status-dot" />
          {isDeleted ? "Inactive" : "Active"}
        </span>
      ),
    },
    {
      title: "Password Last Changed",
      dataIndex: "passwordChangedAt",
      width: 200,
      sorter: (a, b) => dayjs(a.passwordChangedAt ?? 0).valueOf() - dayjs(b.passwordChangedAt ?? 0).valueOf(),
      render: (val: string | null) => {
        if (!val) return <Tag color="default">Not recorded</Tag>;
        const days = dayjs().diff(dayjs(val), "day");
        return (
          <div className="um-date-cell">
            <span>{dayjs(val).format("DD MMM YYYY, HH:mm")}</span>
            <span className={`um-date-sub ${days >= PASSWORD_STALE_DAYS ? "stale" : ""}`}>
              {dayjs(val).fromNow()}
              {days >= PASSWORD_STALE_DAYS && " · consider resetting"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      width: 150,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (val: string) => dayjs(val).format("DD MMM YYYY"),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      width: 170,
      render: (val: string) => dayjs(val).format("DD MMM YYYY, HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      width: isSuperAdmin ? 150 : 110,
      fixed: "right",
      render: (_, u) => {
        const isSelf = u.userId === currentUser.userId;
        return (
          <div className="um-actions">
            <Tooltip title="Edit user">
              <Button shape="circle" icon={<EditOutlined />} className="um-action-btn edit" onClick={() => openEditModal(u)} />
            </Tooltip>
            <Tooltip title="Reset password">
              <Button shape="circle" icon={<KeyOutlined />} className="um-action-btn key" onClick={() => openPasswordModal(u)} />
            </Tooltip>
            {isSuperAdmin && (
              <Tooltip title={isSelf ? "You can't deactivate yourself" : u.isDeleted ? "Activate user" : "Deactivate user"}>
                <Button
                  shape="circle"
                  disabled={isSelf}
                  icon={u.isDeleted ? <CheckCircleOutlined /> : <StopOutlined />}
                  className={`um-action-btn ${u.isDeleted ? "activate" : "deactivate"}`}
                  onClick={() => handleToggleStatus(u)}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  const isEditingSelf = editingUser?.userId === currentUser.userId;

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
              <TeamOutlined /> User Management
            </h1>
            <p className="um-subtitle">
              {isSuperAdmin
                ? "Manage every account — super admins, admins and property operators."
                : "Manage property operator accounts — add users, update details and reset passwords."}
            </p>
          </div>
          <div className="um-hero-actions">
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading} className="um-refresh-btn" />
            </Tooltip>
            <Button type="primary" icon={<UserAddOutlined />} className="um-primary-btn" onClick={openAddModal}>
              Add User
            </Button>
          </div>
        </div>

        <div className="um-stats">
          <div className="um-stat total">
            <span className="um-stat-icon"><TeamOutlined /></span>
            <div><span className="um-stat-value">{stats.total}</span><span className="um-stat-label">Total Users</span></div>
          </div>
          <div className="um-stat active">
            <span className="um-stat-icon"><CheckCircleOutlined /></span>
            <div><span className="um-stat-value">{stats.active}</span><span className="um-stat-label">Active</span></div>
          </div>
          <div className="um-stat inactive">
            <span className="um-stat-icon"><StopOutlined /></span>
            <div><span className="um-stat-value">{stats.inactive}</span><span className="um-stat-label">Inactive</span></div>
          </div>
          <div className="um-stat stale">
            <span className="um-stat-icon"><KeyOutlined /></span>
            <div>
              <span className="um-stat-value">{stats.stale}</span>
              <span className="um-stat-label">Password {PASSWORD_STALE_DAYS}+ days / not recorded</span>
            </div>
          </div>
        </div>

        <div className="um-card">
          <div className="um-toolbar">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search name, username, phone, property"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="um-search"
            />
            {isSuperAdmin && (
              <Select
                allowClear
                placeholder="All roles"
                value={roleFilter}
                onChange={setRoleFilter}
                options={roleOptions}
                className="um-filter"
              />
            )}
            <Select
              allowClear
              showSearch={{ optionFilterProp: "label" }}
              placeholder="All properties"
              value={propertyFilter}
              onChange={setPropertyFilter}
              options={propertyOptions}
              className="um-filter wide"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              className="um-filter"
            />
          </div>

          <Table<ManagedUser>
            rowKey="userId"
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            scroll={{ x: 1620 }}
            rowClassName={(u) => (u.isDeleted ? "um-row-inactive" : "")}
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} user${total === 1 ? "" : "s"}` }}
            locale={{ emptyText: loading ? " " : "No users match these filters" }}
          />
        </div>
      </div>

      {/* Add / Edit user */}
      <Modal
        open={formOpen}
        title={
          <span className="um-modal-title">
            {editingUser ? <EditOutlined /> : <UserAddOutlined />}
            {editingUser ? "Edit User" : "Add New User"}
          </span>
        }
        okText={editingUser ? "Save Changes" : "Create User"}
        onOk={handleFormSubmit}
        onCancel={() => setFormOpen(false)}
        confirmLoading={submitting}
        okButtonProps={{ className: "um-primary-btn" }}
        forceRender
        centered
        width={560}
      >
        <Form form={form} layout="vertical" requiredMark="optional" className="um-form">
          <div className="um-form-grid">
            <Form.Item name="name" label="Full Name" rules={[{ required: true, whitespace: true, message: "Name is required" }]}>
              <Input prefix={<UserOutlined />} placeholder="e.g. Rahul Sharma" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ pattern: /^[+\d][\d\s-]{6,17}$/, message: "Enter a valid phone number" }]}
            >
              <Input placeholder="e.g. +91 98765 43210" />
            </Form.Item>
          </div>
          <Form.Item
            name="email"
            label="Username / Email"
            tooltip="Used to log in. Can be a short username like “tlpj” or an email address."
            rules={[{ required: true, whitespace: true, message: "Username or email is required" }]}
          >
            <Input placeholder="e.g. tlpj or name@theleela.com" autoComplete="off" />
          </Form.Item>
          <div className="um-form-grid">
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Role is required" }]}
              extra={isEditingSelf ? "You can't change your own role." : undefined}
            >
              <Select options={roleOptions} disabled={!isSuperAdmin || isEditingSelf} />
            </Form.Item>
            {selectedRole === "PROPERTY_OPERATOR" && (
              <Form.Item name="property_code" label="Property" rules={[{ required: true, message: "Property is required" }]}>
                <Select showSearch={{ optionFilterProp: "label" }} placeholder="Select property" options={propertyOptions} />
              </Form.Item>
            )}
          </div>

          {!editingUser && (
            <>
              <div className="um-form-divider">Login Password</div>
              <div className="um-form-grid">
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Password is required" },
                    { min: 6, message: "At least 6 characters" },
                  ]}
                >
                  <Input.Password placeholder="Min. 6 characters" autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm the password" },
                    ({ getFieldValue }) => ({
                      validator: (_, value) =>
                        !value || value === getFieldValue("password")
                          ? Promise.resolve()
                          : Promise.reject(new Error("Passwords do not match")),
                    }),
                  ]}
                >
                  <Input.Password placeholder="Re-enter password" autoComplete="new-password" />
                </Form.Item>
              </div>
              <Button
                type="link"
                icon={<ThunderboltOutlined />}
                className="um-generate-btn"
                onClick={() => {
                  const pwd = generatePassword();
                  form.setFieldsValue({ password: pwd, confirmPassword: pwd });
                  form.validateFields(["password", "confirmPassword"]);
                }}
              >
                Generate strong password
              </Button>
            </>
          )}
        </Form>
      </Modal>

      {/* Reset password */}
      <Modal
        open={!!passwordUser}
        title={
          <span className="um-modal-title">
            <KeyOutlined /> Reset Password
          </span>
        }
        okText="Reset Password"
        onOk={handlePasswordSubmit}
        onCancel={() => setPasswordUser(null)}
        confirmLoading={submitting}
        okButtonProps={{ danger: true }}
        forceRender
        centered
        width={460}
      >
        {passwordUser && (
          <div className="um-reset-target">
            <Avatar className={`um-avatar um-avatar-${passwordUser.role.toLowerCase()}`}>{initials(passwordUser.name)}</Avatar>
            <div className="um-user-meta">
              <span className="um-user-name">{passwordUser.name}</span>
              <span className="um-user-sub">{passwordUser.email}</span>
            </div>
          </div>
        )}
        <Form form={passwordForm} layout="vertical" className="um-form">
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "New password is required" },
              { min: 6, message: "At least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Min. 6 characters" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm the new password" },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || value === getFieldValue("password")
                    ? Promise.resolve()
                    : Promise.reject(new Error("Passwords do not match")),
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter new password" autoComplete="new-password" />
          </Form.Item>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            className="um-generate-btn"
            onClick={() => {
              const pwd = generatePassword();
              passwordForm.setFieldsValue({ password: pwd, confirmPassword: pwd });
              passwordForm.validateFields(["password", "confirmPassword"]);
            }}
          >
            Generate strong password
          </Button>
        </Form>
      </Modal>

      {/* Credentials to hand over — shown once */}
      <Modal
        open={!!credentials}
        title={
          <span className="um-modal-title">
            <CheckCircleOutlined style={{ color: "#52c41a" }} /> {credentials?.title}
          </span>
        }
        onCancel={() => setCredentials(null)}
        footer={
          <Button type="primary" className="um-primary-btn" onClick={() => setCredentials(null)}>
            Done
          </Button>
        }
        centered
        width={440}
      >
        {credentials && (
          <>
            <p className="um-cred-note">
              Share these login details with the user. For security the password is stored encrypted and
              <strong> can't be viewed again</strong> after you close this window.
            </p>
            <div className="um-cred-box">
              <div className="um-cred-row">
                <span className="um-cred-label">Username</span>
                <code>{credentials.email}</code>
                <CopyOutlined className="um-copy" onClick={() => copyText(credentials.email)} />
              </div>
              <div className="um-cred-row">
                <span className="um-cred-label">Password</span>
                <code>{credentials.password}</code>
                <CopyOutlined className="um-copy" onClick={() => copyText(credentials.password)} />
              </div>
            </div>
            <Button
              block
              icon={<CopyOutlined />}
              onClick={() => copyText(`Username: ${credentials.email}\nPassword: ${credentials.password}`)}
            >
              Copy both
            </Button>
          </>
        )}
      </Modal>

      <Footer />
    </>
  );
}
