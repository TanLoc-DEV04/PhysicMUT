import { useState } from "react";
import { Table, Button, Space, Popconfirm, Switch } from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useRole } from "./useRole";
import { useRoleMutations } from "./useRoleMutations";
import SearchInput from "../../../components/shared/SearchInput";
import Pagination from "../../../components/shared/Pagination";

function RoleList() {
  const { data, loading } = useRole();
  const navigate = useNavigate();
  const { deleteRole, toggleRoleStatus } = useRoleMutations();
  const [searchText, setSearchText] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onPageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const filteredData = (Array.isArray(data) ? data : []).filter(
    (r: any) =>
      !searchText || r.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    { title: "Role Name", dataIndex: "name", key: "name" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || "—",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active: boolean, record: any) => (
        <Switch
          checked={is_active}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => {
            toggleRoleStatus.mutate({ id: record.id, is_active: checked });
          }}
          loading={toggleRoleStatus.isPending}
        />
      ),
      width: 130,
    },
    // {
    //   title: "Last Update",
    //   dataIndex: "updated_at",
    //   key: "updated_at",
    //   render: (date: string) =>
    //     date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    // },
    {
      title: "Actions",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/roles/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Xóa Role này?"
            description={`Bạn có chắc muốn xóa role "${record.name}"? Hành động này không thể hoàn tác.`}
            onConfirm={() => deleteRole.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteRole.isPending }}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              loading={deleteRole.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/dashboard/roles/add")}
        >
          Add New Role
        </Button>
      </div>

      <div className="mb-6 w-1/3">
        <SearchInput
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search role..."
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredData.length}
        onChange={onPageChange}
      />
    </div>
  );
}

export default RoleList;
