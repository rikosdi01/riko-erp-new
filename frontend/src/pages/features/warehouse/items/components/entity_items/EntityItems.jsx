import { useEffect, useState } from 'react';
import ActionButton from '../../../../../../components/button/actionbutton/ActionButton';
import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import InputLabel from '../../../../../../components/input/input_label/InputLabel';
import './EntityItems.css';
import { PackagePlus, KeyRound, LayoutGrid, CarFront, BadgeDollarSign, Scale, LayoutDashboard } from "lucide-react";
import { useToast } from '../../../../../../context/ToastContext';
import { Timestamp } from 'firebase/firestore';
import Dropdown from '../../../../../../components/select/Dropdown';
import { ALGOLIA_INDEX_CATEGORIES, categoryIndex, clientCategories } from '../../../../../../../config/algoliaConfig';
import Formatting from '../../../../../../utils/format/Formatting';
import ItemsRepository from '../../../../../../repository/warehouse/ItemsRepository';
import ConfirmationModal from '../../../../../../components/modal/confirmation_modal/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../../../context/auth/UsersContext';
import roleAccess from '../../../../../../utils/helper/roleAccess';
import AccessAlertModal from '../../../../../../components/modal/access_alert_modal/AccessAlertModal';
import ContainerSearch from '../../../../../../components/container/container_search/ContainerSearch';

const EntityItems = ({
    mode,
    initialData = {},
    onSubmit,
}) => {
    const { accessList } = useUsers();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const brandsOptions = [
        { id: 1, name: "Bajaj" },
        { id: 2, name: "Honda" },
        { id: 3, name: "Kawasaki" },
        { id: 4, name: "Mona" },
        { id: 5, name: "Suzuki" },
        { id: 6, name: "Vespa" },
        { id: 7, name: "Yamaha" },
    ]

    const filterBrand = brandsOptions.find((brand) => brand.name === initialData.brand);
    const defaultBrandId = filterBrand?.id || brandsOptions[0]?.id || 1;

    const [code, setCode] = useState(initialData.code || "");
    const [name, setName] = useState(initialData.name || "");
    const [category, setCategory] = useState(initialData.category || []);
    const [brand, setBrand] = useState(defaultBrandId);
    const [salePrice, setSalePrice] = useState(initialData.salePrice || Formatting.formatCurrencyIDR(0));
    const [setProduct, setSetProduct] = useState(initialData.set || "");
    const [createdAt, setCreatedAt] = useState(initialData.createdAt || Timestamp.now());
    const [userId, setUserId] = useState(initialData.userId || `guest-${Date.now()}`);
    const [codeError, setCodeError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        console.log('Category:', category);
    }, [category]);

    const columns = [
        {
            header: "Kode Kategori",
            accessor: "codeCategoryMerk",
            renderCell: (_, category) => {
                const code = category?.code ?? "";
                const merkCode = category?.merks?.code ?? "";
                return merkCode + '-' + code;
            }
        },
        {
            header: "Nama",
            accessor: "nameMerk",
            renderCell: (_, category) => {
                const name = category?.name ?? "";
                const merkName = category?.merks?.name ?? "";
                return name + ' ' + merkName;
            }
        }
    ]

    // Fetch Initial Data
    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) return;

        setCode(initialData.code || "");
        setName(initialData.name || "");
        setCategory(initialData.category || []);
        setBrand(defaultBrandId);
        setSalePrice(initialData.salePrice || Formatting.formatCurrencyIDR(0));
        setSetProduct(initialData.set || "");
        setCreatedAt(initialData.createdAt || Timestamp.now());
        setUserId(initialData.userId || `guest-${Date.now()}`);
    }, [initialData]);

    const handleItems = async (e) => { // Tambahkan 'e' di sini
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
            const filteredCategory = {
                id: category.objectID || category.id,
                name: category.name + ' ' + (category.merks?.name || ""),
                code: category.merks?.code + '-' + category.code,
            }
            const selectedBrand = brandsOptions.find(brandValue => brandValue.id === brand);

            console.log('Category:', category);

            const exists = await ItemsRepository.checkItemsExists(
                code.trim(),
                category.objectID || category.id,
                mode === "detail" ? initialData.id : null
            );

            console.log(exists);

            if (exists) {
                showToast("gagal", "Kode Item sudah digunakan!");
                return setLoading(false);
            }

            const newItem = {
                code,
                name,
                category: filteredCategory,
                brand: selectedBrand.name,
                salePrice: parseInt(salePrice.replace(/\D/g, ""), 10) || 0,
                set: setProduct,
                qty: 0,
                createdAt: createdAt,
                updatedAt: Timestamp.now(),
                userId
            };

            console.log('New Item:', newItem);

            try {
                await onSubmit(newItem, handleReset);
            } catch (submitError) {
                console.error('Error during submit: ', submitError);
                showToast('gagal', mode === "create" ? 'Gagal menambahkan Item!' : 'Gagal memperbarui Item!');
                return setLoading(false);
            }

            showToast('berhasil', mode === "create" ? 'Item berhasil ditambahkan!' : 'Item berhasil diperbarui!');
        } catch (error) {
            console.error('Terjadi kesalahan: ', error);
            showToast('gagal', mode === "create" ? 'Gagal menambahkan Item!' : 'Gagal memperbarui Item!');
        } finally {
            setLoading(false);
        }
    };


    const handleReset = () => {
        setCode("");
        setName("");
        setCategory([]);
        setBrand([]);
        setSalePrice(Formatting.formatCurrencyIDR(0));
        setSetProduct("");
        setCodeError("");
        setNameError("");
    }

    // handler delete
    const handleDeleteItem = async () => {
        try {
            await ItemsRepository.deleteItem(initialData.id);
            showToast("berhasil", "Item berhasil dihapus!");
            navigate("/inventory/items");
        } catch (error) {
            console.error("Error deleting item: ", error);
            showToast("gagal", "Gagal menghapus Item!");
        }
    }

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    return (
        <div className="main-container">
            <ContentHeader title={mode === "create" ? "Tambah Item" : "Rincian Item"} />

            <div className='add-container-input'>
                <InputLabel
                    label="Kode Item"
                    icon={<KeyRound className='input-icon' />}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                {codeError && <div className="error-message">{codeError}</div>}
            </div>

            <div className='add-container-input'>
                <div>
                    <InputLabel
                        label="Nama Item"
                        icon={<PackagePlus className='input-icon' />}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && <div className="error-message">{nameError}</div>}
                </div>

                <Dropdown
                    values={brandsOptions}
                    selectedId={brand}
                    setSelectedId={setBrand}
                    label="Pilih Motor"
                    icon={<CarFront className="input-icon" />}
                />
            </div>

            <div className='add-container-input'>
                <ContainerSearch
                    label={`${category?.name ?? ""} ${category?.merks?.name ?? ""}`.trim() || "Kategori"}
                    icon={<LayoutDashboard className='input-icon' />}
                    searchClient={clientCategories}
                    indexName={ALGOLIA_INDEX_CATEGORIES}
                    columns={columns}
                    setValues={setCategory}
                />
            </div>

            <div className='add-container-input-attribute'>
                <div>
                    <InputLabel
                        label="Harga Jual"
                        icon={<BadgeDollarSign className='input-icon' />}
                        value={salePrice}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka
                            setSalePrice(rawValue ? Formatting.formatCurrencyIDR(parseInt(rawValue)) : "");
                        }}
                    />
                </div>

                <div>
                    <InputLabel
                        label="Satuan"
                        icon={<Scale className='input-icon' />}
                        value={setProduct}
                        onChange={(e) => setSetProduct(e.target.value)}
                    />
                </div>
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
                        onclick={handleItems}
                    />
                </div>
            ) : (
                <div className='add-container-actions'>
                    <ActionButton
                        title={"Hapus"}
                        background="linear-gradient(to top right,rgb(241, 66, 66),rgb(245, 51, 51))"
                        color="white"
                        onclick={() => roleAccess(accessList, 'menghapus-data-item') ? setOpenDeleteModal(true) : handleRestricedAction()}
                    />

                    <ActionButton
                        title={loading ? "Memperbarui..." : "Perbarui"}
                        disabled={loading}
                        onclick={handleItems}
                    />
                </div>
            )}

            {openDeleteModal && (
                <ConfirmationModal
                    isOpen={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onClick={handleDeleteItem}
                    title="Kategori"
                    itemDelete={initialData.category?.name + ' - ' + name}
                />
            )}

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    )
}

export default EntityItems;