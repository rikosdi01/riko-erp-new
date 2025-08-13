import './ManageAccount.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";

import ContentHeader from "../../../../../components/content_header/ContentHeader";
import UserAccountTable from "./interal_account/InternalAccount";
import UserRepository from "../../../../../repository/authentication/UserRepository";

const ManageAccount = () => {
    const functions = getFunctions();
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState([]);
    console.log('All Users: ', allUsers);
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


    // Bisa pakai filter global juga jika diperlukan
    const filterByStatus = (users) => {
        if (filter === 'all') return users;
        return users.filter(user => (
            filter === 'active' ? user.status === 'active' : user.status !== 'active'
        ));
    };


    const internalUsers = allUsers.filter(user => user.type === "internal");
    const customerUsers = allUsers.filter(user => user.type === "customer");

    const internalRoles = Array.from(
        new Set(internalUsers.map(user => user.role).filter(Boolean))
    );

    // Handler function
    const handleChangePassword = async (user) => {
        const newPassword = prompt("Masukkan password baru:");
        if (!newPassword) return;

        const changePasswordFn = httpsCallable(functions, "changeUserPassword");
        await changePasswordFn({ uid: user.uid, newPassword });
        alert("Password berhasil diganti!");
    };

    const handleDeactivate = async (user) => {
        const confirmAction = window.confirm("Nonaktifkan akun ini?");
        if (!confirmAction) return;

        const setStatusFn = httpsCallable(functions, "setUserStatus");
        await setStatusFn({ uid: user.uid, disabled: true });
        alert("Akun dinonaktifkan!");
    };

    const handleDelete = async (user) => {
        const confirmAction = window.confirm("Hapus akun ini?");
        if (!confirmAction) return;

        const deleteUserFn = httpsCallable(functions, "deleteUserAccount");
        await deleteUserFn({ uid: user.uid });
        alert("Akun dihapus!");
    };
    return (
        <div className="manage-account-container">
            {/* Bagian Akun Internal */}
            <UserAccountTable
                title="Akun Internal"
                users={filterByStatus(internalUsers)}
                roles={internalRoles}
                onChangePassword={handleChangePassword}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
                registrationPath="/signup-admin"
            />
        </div>
    );
};

export default ManageAccount;
