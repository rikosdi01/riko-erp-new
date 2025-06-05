import { useEffect, useState } from 'react';
import './EntityCategory.css';
import { PackagePlus, KeyRound, BadgeCheck, Cog } from "lucide-react";
import { Timestamp } from 'firebase/firestore';
import ContentHeader from '../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../components/input/input_label/InputLabel';
import Dropdown from '../../../../../components/select/Dropdown';
import ActionButton from '../../../../../components/button/actionbutton/ActionButton';
import { useToast } from '../../../../../context/ToastContext';
import CategoriesRepository from '../../../../../repository/warehouse/CategoriesRepository';
import ConfirmationModal from '../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useMerks } from '../../../../../context/warehouse/MerkContext';
import { useNavigate } from 'react-router-dom';

const EntityCategory = ({
    mode,
    initialData = {},
    onSubmit
}) => {
    // Context
    const { showToast } = useToast();
    const merksData = useMerks();
    const navigate = useNavigate();

    // ================================================================================


    // Variables
    const [code, setCode] = useState(initialData.code || "");
    const [name, setName] = useState(initialData.name || "");
    const [merks, setMerks] = useState([]);
    const [selectedMerk, setSelectedMerk] = useState("");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(initialData.userId || `guest-${Date.now()}`);
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);


    const categoryPart = ([
        { id: 1, name: "Engine" },
        { id: 2, name: "Body / Frame" },
        { id: 3, name: "Rubber" },
        { id: 4, name: "Electronic" },
        { id: 5, name: "Lainnya" },
    ]);

    const [selectedCategoryPart, setSelectedCategoryPart] = useState(initialData.categoryPart || categoryPart[0].id || 1);

    // ================================================================================


    // UseEffect
    // Fetch Merks Data
    // Set selectedMerk ketika merksValue sudah tersedia dan belum di-set
    useEffect(() => {
        if (merksData.merks.length > 0) {
            const merksDropdown = merksData.merks.map(merk => ({
                id: merk.id,
                name: merk.name,
            }));
            setMerks(merksDropdown);
            setSelectedMerk(initialData.merks?.id || merksDropdown[0]?.id || "");
        }
    }, [merksData]);


    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCode(initialData.code || "");
        setName(initialData.name || "");
        setMerks(merks);
        setSelectedMerk(initialData.merks?.id || merks[0]?.id);
        setSelectedCategoryPart(initialData.categoryPart || categoryPart[0].id || 1);
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId || `guest-${Date.now()}`);
    }, [initialData, merksData]);


    // ================================================================================


    // Logic
    const handleCategories = async (e) => { // Tambahkan 'e' di sini
        e.preventDefault();
        setLoading(true);

        let valid = true;

        if (!code.trim()) {
            setCodeError('Kode Merek tidak boleh kosong!');
            valid = false;
        }

        if (!name.trim()) {
            setNameError('Nama Merek tidak boleh kosong!');
            valid = false;
        }

        if (!valid) return setLoading(false);

        try {
            const selectedMerkData = merksData.merks.find(merk => merk.id === selectedMerk);
            const selectedParts = categoryPart.find(part => part.id === selectedCategoryPart);

            const exists = await CategoriesRepository.checkCategoryCodeExists(
                code.trim(),
                selectedMerkData.code,
                mode === "detail" ? initialData.id : null
            );

            if (exists) {
                showToast("gagal", "Kode Kategori sudah digunakan!");
                return setLoading(false);
            }

            const categoriesData = {
                code: code.trim(),
                name: name.trim(),
                part: selectedParts.name,
                merks: selectedMerkData,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId: userId,
            };

            try {
                await onSubmit(categoriesData, handleReset);
            } catch (submitError) {
                console.error('Error during submit: ', submitError);
                showToast('gagal', mode === "create" ? 'Gagal menambahkan kategori!' : 'Gagal memperbarui kategori!');
                return setLoading(false);
            }

            showToast('berhasil', mode === "create" ? 'Kategori berhasil ditambahkan!' : 'Kategori berhasil diperbarui!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', mode === "create" ? 'Gagal menambahkan kategori!' : 'Gagal memperbarui kategori!');
        } finally {
            setLoading(false);
        }
    };


    const handleCodeChange = (e) => {
        setCode(e.target.value);
        if (e.target.value.trim()) setCodeError("");
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (e.target.value.trim()) setNameError("");
    };

    const handleReset = (e) => {
        setCode("");
        setName("");
        setCodeError("");
        setNameError("");
    }

    // handler delete
    const handleDeleteCategory = async () => {
        try {
            await CategoriesRepository.deleteCategory(initialData.id);
            showToast("berhasil", "Kategori berhasil dihapus!");
            navigate("/inventory/categories");
        } catch (error) {
            console.error("Error deleting kategori: ", error);
            showToast("gagal", "Gagal menghapus Kategori!");
        }
    }


    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Kategori" : "Rincian Kategori"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Kode Kategori"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={handleCodeChange}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <InputLabel
                    label="Nama Kategori"
                    icon={<PackagePlus className='input-icon' />}
                    value={name}
                    onChange={handleNameChange}
                />
                {nameError && <div className="error-message">{nameError}</div>}
            </div>

            <div className='add-container-input-attribute'>
                <Dropdown
                    values={merks}
                    selectedId={selectedMerk}
                    setSelectedId={setSelectedMerk}
                    label="Pilih Merek"
                    icon={<BadgeCheck className="input-icon" />}
                />
                <Dropdown
                    values={categoryPart}
                    selectedId={selectedCategoryPart}
                    setSelectedId={setSelectedCategoryPart}
                    label="Pilih Parts Kategori"
                    icon={<Cog className="input-icon" />}
                />
            </div>


            {mode === "create" ? (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Reset"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={handleReset}
                    />

                    <ActionButton
                        title={loading ? "Menyimpan..." : "Simpan"}
                        disabled={loading}
                        onclick={handleCategories}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => setOpenDeleteModal(true)}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleCategories}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteCategory}
                    title="Kategori"
                    itemDelete={name + ' ' + initialData.merks?.name}
                />
            )}
        </div>
    )
}

export default EntityCategory;