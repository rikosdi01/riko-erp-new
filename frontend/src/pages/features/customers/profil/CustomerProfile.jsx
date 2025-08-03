import ActionButton from '../../../../components/button/actionbutton/ActionButton';
import { useUsers } from '../../../../context/auth/UsersContext';
import { useToast } from '../../../../context/ToastContext';
import UserRepository from '../../../../repository/authentication/UserRepository';
import './CustomerProfile.css';
import { useState, useEffect } from 'react';

const CustomerProfile = () => {
    const { loginUser, setLoginUser } = useUsers();
    const { showToast } = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
    const [newAddress, setNewAddress] = useState({ address: '', city: '', province: '' });
    const [editedName, setEditedName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [selectedAddress, setSelectedAddress] = useState('');


    useEffect(() => {
        if (loginUser) {
            setEditedName(loginUser.username || '');
            setEditedPhone(loginUser.phone || '');
            setSelectedAddress(loginUser.selectedAddress || '');

            if (Array.isArray(loginUser.addresses)) {
                setAddresses(loginUser.addresses);

                const index = loginUser.addresses.findIndex(addr =>
                    JSON.stringify(addr) === JSON.stringify(loginUser.selectedAddress)
                );

                if (index !== -1) {
                    setSelectedAddressIndex(index);
                }
            }
        }
    }, [loginUser]);


    const handleAddAddress = async () => {
        if (newAddress.address && newAddress.city && newAddress.province) {
            const updatedAddresses = [...addresses, newAddress];
            setAddresses(updatedAddresses);

            const newIndex = updatedAddresses.length - 1;

            // Set alamat terpilih ke alamat baru
            setSelectedAddressIndex(newIndex);
            setSelectedAddress(newAddress);

            // Simpan ke Firestore
            await UserRepository.updateUserData(loginUser.id, {
                addresses: updatedAddresses,
                selectedAddress: newAddress, // Simpan juga selectedAddress
            });

            setNewAddress({ address: '', city: '', province: '' });
        }
    };


    const handleSelectAddress = (index) => {
        setSelectedAddressIndex(index);
        setSelectedAddress(addresses[index]); // simpan objek alamat terpilih
        setModalOpen(false);
    };


    // Tampilkan loading atau fallback jika loginUser belum siap
    if (!loginUser) return <div>Memuat data profil...</div>;

    return (
        <div className='main-container'>
            <div className="customer-profile">
                <h2>Profil Pelanggan</h2>

                <div className="profile-section">
                    <h3>Informasi Akun</h3>
                    <label>Nama </label>
                    <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Nama"
                    />
                    <label>No. HP </label>
                    <input
                        type="text"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        placeholder="No. Telpon"
                    />
                    <p><strong>Email:</strong> {loginUser.email}</p>
                </div>

                <div className="profile-section">
                    <h3>Alamat Pengiriman</h3>
                    {selectedAddressIndex !== null && addresses[selectedAddressIndex] && (
                        <div className="address-box selected">
                            <p>
                                Alamat Terpilih: <br />
                                {addresses[selectedAddressIndex].address}, {addresses[selectedAddressIndex].city}, {addresses[selectedAddressIndex].province}
                            </p>
                        </div>
                    )}
                    <button onClick={() => setModalOpen(true)}>Pilih / Tambah Alamat</button>
                </div>
            </div>

            {/* MODAL */}
            {/* MODAL PILIH ALAMAT */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Daftar Alamat</h3>

                        {addresses.length === 0 ? (
                            <p style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
                                Tidak ada alamat yang tersedia
                            </p>
                        ) : (
                            addresses.map((addr, idx) => (
                                <div
                                    key={idx}
                                    className="address-box"
                                    onClick={() => handleSelectAddress(idx)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <p>{addr.address}, {addr.city}, {addr.province}</p>
                                </div>
                            ))
                        )}

                        <div className='customer-profil-button'>
                            <ActionButton
                                title={'Tutup'}
                                background={'red'}
                                onclick={() => setModalOpen(false)}
                            />

                            <ActionButton
                                title={'Tambah Alamat'}
                                onclick={() => {
                                    setShowAddForm(true); // buka modal baru
                                    setModalOpen(false); // tutup modal lama
                                }}
                                style={{ padding: '8px 12px' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH ALAMAT */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Tambah Alamat Baru</h3>

                        <div className="add-address-form">
                            <input
                                type="text"
                                placeholder="Alamat"
                                value={newAddress.address}
                                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Kota"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Provinsi"
                                value={newAddress.province}
                                onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                            />
                            <div className='customer-profil-button'>
                                <ActionButton
                                    title={'Batal'}
                                    background={'red'}
                                    onclick={() => {
                                        setShowAddForm(false);
                                        setModalOpen(true); // buka kembali modal alamat
                                    }}
                                />
                                <ActionButton
                                    title={'Simpan Alamat'}
                                    onclick={async () => {
                                        await handleAddAddress();  // 🔧 tunggu alamat disimpan dulu
                                        setShowAddForm(false);
                                        setModalOpen(true);       // baru buka modal setelah alamat diproses
                                    }}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={async () => {
                    try {
                        await UserRepository.updateUserData(loginUser.id, {
                            username: editedName,
                            phone: editedPhone,
                            selectedAddress,      // penting
                        });


                        setLoginUser((prev) => ({
                            ...prev,
                            username: editedName,
                            phone: editedPhone,
                            selectedAddress,
                        }));

                        showToast('berhasil', 'Profile anda berhasil diperbarui')
                    } catch (error) {
                        console.error("Gagal menyimpan:", error);
                        showToast('gagal', 'Profile anda gagal diperbarui')
                    }
                }}
            >
                Simpan
            </button>


        </div>
    );
};

export default CustomerProfile;
