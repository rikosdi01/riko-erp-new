import './ManageAccount.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import ContentHeader from "../../../../../components/content_header/ContentHeader";
import UserAccountTable from "./interal_account/InternalAccount";
import UserRepository from "../../../../../repository/authentication/UserRepository";

const internalRoles = ['Admin', 'CSO', 'Stok Controller', 'Logistic', 'Terakhir Aktif'];
const customerRoles = ['Terakhir Aktif'];

const ManageAccount = () => {
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-container")) {
                setSelectedUserId(null);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        const unsubscribe = UserRepository.getUsers((fetchedUsers) => {
            setAllUsers(fetchedUsers);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        console.log('All users fetched:', allUsers);
    }, [allUsers]);

    // Pisahkan berdasarkan tipe akun
    const internalUsers = allUsers.filter(user => user.type === "internal");
    const customerUsers = allUsers.filter(user => user.type === "customer");

    // Bisa pakai filter global juga jika diperlukan
    const filterByStatus = (users) => {
        if (filter === 'all') return users;
        return users.filter(user => (
            filter === 'active' ? user.status === 'active' : user.status !== 'active'
        ));
    };

    // Handler function
    const handleChangePassword = (user) => {
        console.log("Ganti password", user);
    };
    const handleDeactivate = (user) => {
        console.log("Nonaktifkan", user);
    };
    const handleDelete = (user) => {
        console.log("Hapus", user);
    };

    return (
        <div className="main-container">
            <div className="manage-account-container">
                <ContentHeader title="Kelola Akun" />

                <div className='manage-account-header'>
                <button
                    className="manage-button"
                    onClick={() => navigate("/settings/manage-account/roles")}
                >
                    Kelola Akses Data
                </button>
                </div>

                {/* Bagian Akun Internal */}
                <UserAccountTable
                    title="Akun Internal"
                    users={filterByStatus(internalUsers)}
                    roles={internalRoles}
                    onChangePassword={handleChangePassword}
                    onDeactivate={handleDeactivate}
                    onDelete={handleDelete}
                    registrationPath="/signup"
                />

                {/* Spacer */}
                <div style={{ height: "40px" }}></div>

                {/* Bagian Akun Pelanggan */}
                <UserAccountTable
                    title="Akun Pelanggan"
                    users={filterByStatus(customerUsers)}
                    roles={customerRoles}
                    onChangePassword={handleChangePassword}
                    onDeactivate={handleDeactivate}
                    onDelete={handleDelete}
                    registrationPath="/signup-customer"
                />
            </div>
        </div>
    );
};

export default ManageAccount;
