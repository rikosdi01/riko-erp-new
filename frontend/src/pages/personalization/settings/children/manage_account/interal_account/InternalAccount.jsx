import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserAccountTable = ({
    title = "Daftar Pengguna",
    users = [],
    roles = [],
    onChangePassword,
    onDeactivate,
    onDelete,
    enableRegistration = true,
    enableRoleManagement = true,
    registrationPath = "/signup",
    roleManagementPath = "/settings/manage-account/roles",
}) => {
    const navigate = useNavigate();

    const [filter, setFilter] = useState("all");
    const [selectedUserId, setSelectedUserId] = useState(null);

    const filteredUsers = users.filter((user) => {
        if (filter === "active") return user.isActive;
        if (filter === "inactive") return !user.isActive;
        return true;
    });

    return (
        <div>
            <div className="user-title-section">{title}</div>

            <div className="top-controls">
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            value="all"
                            checked={filter === "all"}
                            onChange={() => setFilter("all")}
                        />
                        Semua
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="active"
                            checked={filter === "active"}
                            onChange={() => setFilter("active")}
                        />
                        Tampilkan hanya user aktif
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="inactive"
                            checked={filter === "inactive"}
                            onChange={() => setFilter("inactive")}
                        />
                        Tampilkan hanya user tidak aktif
                    </label>
                </div>

                <div className="manage-buttons">
                    {enableRegistration && (
                    <button
                        className="manage-button"
                        onClick={() => navigate(registrationPath)}
                    >
                        Registrasi Akun
                    </button>
                    )}
                    {enableRoleManagement && (
                        <button
                            className="manage-button"
                            onClick={() => navigate(roleManagementPath)}
                        >
                            Kelola Role
                        </button>
                    )}
                </div>
            </div>

            <table className="user-role-table">
                <thead>
                    <tr>
                        <th>Nama Pengguna</th>
                        {roles.map((role) => (
                            <th key={role}>{role}</th>
                        ))}
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                {roles.map((role) => (
                                    <td key={role} style={{ textAlign: "center" }}>
                                        {role === "Terakhir Aktif"
                                            ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString()
                                            : user.role === role
                                                ? "✅"
                                                : ""}
                                    </td>
                                ))}
                                <td style={{ textAlign: "center", position: "relative" }}>
                                    <MoreVertical
                                        size={18}
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUserId(user.id === selectedUserId ? null : user.id);
                                        }}
                                    />
                                    {selectedUserId === user.id && (
                                        <div className="dropdown-menu">
                                            <div
                                                className="dropdown-item"
                                                onClick={() => onChangePassword?.(user)}
                                            >
                                                Ganti Password
                                            </div>
                                            <div
                                                className="dropdown-item"
                                                onClick={() => onDeactivate?.(user)}
                                            >
                                                Nonaktifkan Akun
                                            </div>
                                            <div
                                                className="dropdown-item danger"
                                                onClick={() => onDelete?.(user)}
                                            >
                                                Hapus Akun
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={roles.length + 2} style={{ textAlign: "center", padding: "20px" }}>
                                Belum ada data pengguna.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserAccountTable;