import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import './ManageRoles.css';
import React, { useEffect, useState } from 'react';
import RolesRepository from '../../../../../../repository/authentication/RolesRepository';
import { useToast } from '../../../../../../context/ToastContext';
import { Settings } from 'lucide-react';
import RoleSettingsModal from './components/role_settings_modal/RoleSettingsModal';

const ManageRoles = () => {
    const { showToast } = useToast();
    const [isChanged, setIsChanged] = useState(false);
    const [roles, setRoles] = useState([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    console.log('Roles: ', roles);

    const pages = [
        {
            section: "Dashboard Global",
            data: [
                {
                    title: 'Dashboard',
                    items: [
                        "Melihat dashboard global",
                    ],
                },
            ],
        },
        {
            section: "Customer",
            data: [
                {
                    title: 'List Barang',
                    items: [
                        "Melihat daftar list barang pelanggan",
                        "Melakukan pemesanan dari list barang",
                    ],
                },
                {
                    title: 'Pesanan Pelanggan',
                    items: [
                        "Melihat daftar pesanan pelanggan",
                    ],
                },
            ],
        },
        {
            section: "CSO",
            data: [
                {
                    title: 'Dashboard Pesanan',
                    items: [
                        "Melihat dashboard Pesanan"
                    ],
                },
                {
                    title: 'Pesanan Penjualan',
                    items: [
                        "Melihat data Pesanan Penjualan",
                        "Menambah data Pesanan Penjualan",
                        "Mengedit data Pesanan Penjualan",
                        "Menghapus data Pesanan Penjualan",
                    ]
                },
                {
                    title: 'Pelanggan',
                    items: [
                        "Melihat data Pelanggan",
                        "Menambah data Pelanggan",
                        "Mengedit data Pelanggan",
                        "Menghapus data Pelanggan",
                    ]
                },
            ],
        },
        {
            section: "Warehouse",
            data: [
                {
                    title: 'Dashboard Inventaris',
                    items: [
                        "Melihat dashboard inventaris"
                    ],
                },
                {
                    title: 'Penyesuaian Pesanan',
                    items: [
                        "Melihat data Penyesuaian Pesanan",
                        "Menambah data Penyesuaian Pesanan",
                        "Mengedit data Penyesuaian Pesanan",
                        "Menghapus data Penyesuaian Pesanan",
                    ]
                },
                {
                    title: 'Pemindahan Stok',
                    items: [
                        "Melihat data Pemindahan Stok",
                        "Menambah data Pemindahan Stok",
                        "Mengedit data Pemindahan Stok",
                        "Menghapus data Pemindahan Stok",
                    ]
                },
                {
                    title: 'Merek',
                    items: [
                        "Melihat data Merek",
                        "Menambah data Merek",
                        "Mengedit data Merek",
                        "Menghapus data Merek",
                    ]
                },
                {
                    title: 'Kategori',
                    items: [
                        "Melihat data Kategori",
                        "Menambah data Kategori",
                        "Mengedit data Kategori",
                        "Menghapus data Kategori",
                    ]
                },
                {
                    title: 'Item',
                    items: [
                        "Melihat data Item",
                        "Menambah data Item",
                        "Mengedit data Item",
                        "Menghapus data Item",
                    ]
                },
            ],
        },
        {
            section: "Logistik",
            data: [
                {
                    title: 'Dashboard Logistic',
                    items: [
                        "Melihat dashboard logistic"
                    ],
                },
                {
                    title: 'Pengiriman Pesanan',
                    items: [
                        "Melihat data Pengiriman Pesanan",
                        "Menambah data Pengiriman Pesanan",
                        "Mengedit data Pengiriman Pesanan",
                        "Menyelesaikan data Pengiriman Pesanan",
                        "Menghapus data Pengiriman Pesanan",
                    ]
                },
                {
                    title: 'Faktur Pesanan',
                    items: [
                        "Melihat data Faktur Pesanan",
                        "Mengedit data Faktur Pesanan",
                        "Menghapus data Faktur Pesanan",
                    ]
                },
                {
                    title: 'Pengangkutan',
                    items: [
                        "Melihat data Pengangkutan",
                        "Menambah data Pengangkutan",
                        "Mengedit data Pengangkutan",
                        "Menghapus data Pengangkutan", ,
                    ]
                },
                {
                    title: 'Kurir',
                    items: [
                        "Melihat data Kurir",
                        "Menambah data Kurir",
                        "Mengedit data Kurir",
                        "Menghapus data Kurir",
                    ]
                },
            ],
        },
        {
            section: "Pengaturan",
            data: [
                {
                    title: 'Mutasi',
                    items: [
                        "Melihat mutasi penjualan",
                        "Melihat mutasi inventaris",
                        "Melihat mutasi pengiriman",
                    ],
                },
                {
                    title: 'Kelola Akun',
                    items: [
                        "Melihat pengelolaan akun",
                        "Mengelola akses data",
                        "Meregistrasi akun baru",
                        "Melihat password pengguna",
                        "Mengganti password pengguna",
                        "Menonaktifkan akun pengguna",
                        "Menghapus akun pengguna",
                    ],
                },
                {
                    title: 'Format Sistem',
                    items: [
                        "Melihat format sistem",
                        "Mengedit format sistem",
                    ],
                },
            ],
        },
    ];

    const [accessMatrix, setAccessMatrix] = useState({});

    const toggleAccess = (item, role) => {
        const itemKey = kebabCase(item); // konsisten key-nya
        setAccessMatrix(prev => {
            const current = prev[itemKey] || [];
            const hasAccess = current.includes(role);
            const updated = hasAccess
                ? current.filter(r => r !== role)
                : [...current, role];

            setIsChanged(true);
            return {
                ...prev,
                [itemKey]: updated
            };
        });
    };



    const kebabCase = (str) =>
        str.toLowerCase().replace(/\s+/g, '-');

    const handleUpdateAccess = async () => {
        for (const role of roles) {
            const allowedItems = Object.entries(accessMatrix)
                .filter(([_, rolesList]) => rolesList.includes(role))
                .map(([itemKey]) => kebabCase(itemKey));

            await RolesRepository.updateAccessData(role, allowedItems);
        }

        setIsChanged(false);
        showToast("berhasil", "Akses berhasil diperbarui!");
    };


    useEffect(() => {
        const unsubscribe = RolesRepository.getRoles((fetchedRoles) => {
            setRoles(fetchedRoles.map(role => role.name));

            const matrix = {};
            fetchedRoles.forEach(role => {
                const roleName = role.name;
                const accessList = role.accessData || [];
                console.log(`Role: ${roleName}, Access: ${accessList}`);

                accessList.forEach(itemKey => {
                    if (!matrix[itemKey]) matrix[itemKey] = [];
                    if (!matrix[itemKey].includes(roleName)) {
                        matrix[itemKey].push(roleName);
                    }
                });
            });
            setAccessMatrix(matrix);

        });

        return () => unsubscribe();
    }, []);



    return (
            <div className="manage-account-container">
                <div className="top-controls" style={{ justifyContent: 'end' }}>
                    <div className='manage-buttons'>
                        <input
                            type="text"
                            placeholder="Nama role baru"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className='manage-input'
                            style={{ padding: "8px", marginRight: "8px" }}
                        />
                        <button
                            className="manage-button"
                            onClick={async () => {
                                if (!newRoleName.trim()) return showToast("gagal", "Nama role tidak boleh kosong");

                                const roleName = newRoleName.trim();

                                if (roles.includes(roleName)) {
                                    showToast("peringatan", "Role sudah ada!");
                                    return;
                                }

                                try {
                                    const success = await RolesRepository.createRole({
                                        name: roleName,
                                        accessData: [],
                                    });

                                    if (!success) {
                                        showToast("gagal", `Role "${roleName}" sudah ada di database.`);
                                        return;
                                    }

                                    setNewRoleName("");
                                    showToast("berhasil", "Role berhasil dibuat!");
                                } catch (e) {
                                    console.error(e);
                                    showToast("gagal", "Gagal membuat role.");
                                }
                            }}
                        >
                            Tambah Role
                        </button>
                        <Settings
                            cursor="pointer"
                            color="grey"
                            onClick={() => setIsSettingsOpen(true)}
                        />

                        <RoleSettingsModal
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            roles={roles}
                        />

                    </div>
                </div>
                
                <table className="user-role-table">
                    <thead>
                        <tr>
                            <th>Halaman</th>
                            {roles.map(role => (
                                <th key={role}>{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(group => (
                            <React.Fragment key={group.section}>
                                <tr>
                                    <td colSpan={roles.length + 1} className="section-header">
                                        {group.section}
                                    </td>
                                </tr>
                                {group.data.map(page => (
                                    <React.Fragment key={page.title}>
                                        <tr>
                                            <td colSpan={roles.length + 1} className="page-title-row">
                                                <strong>{page.title}</strong>
                                            </td>
                                        </tr>
                                        {page.items.map(item => (
                                            <tr key={item}>
                                                <td style={{ paddingLeft: 24 }}>{item}</td>
                                                {roles.map(role => {
                                                    const itemKey = kebabCase(item);
                                                    return (
                                                        <td
                                                            key={role}
                                                            onClick={() => toggleAccess(item, role)}
                                                            style={{ textAlign: "center", cursor: "pointer" }}
                                                        >
                                                            {accessMatrix[itemKey]?.includes(role) ? "✅" : ""}
                                                        </td>
                                                    );
                                                })}

                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {isChanged && (
                    <button
                        className="manage-button"
                        style={{ backgroundColor: '#28a745' }}
                        onClick={handleUpdateAccess}
                    >
                        Perbarui Akses
                    </button>
                )}
            </div>
    );
};

export default ManageRoles;
