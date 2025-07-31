import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Table.css";
import AccessAlertModal from "../modal/access_alert_modal/AccessAlertModal";
import { useUsers } from "../../context/auth/UsersContext";
import { useFormats } from "../../context/personalization/FormatContext";
import CounterRepository from "../../repository/personalization/CounterRepository";
import { useRacks } from "../../context/warehouse/RackWarehouseContext";
import { serverTimestamp } from "firebase/firestore";
import SalesOrderRepository from "../../repository/sales/SalesOrderRepository";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";
import IconButton from "../button/icon_button/IconButton";
import ActionButton from "../button/actionbutton/ActionButton";
import BackOrderRepository from "../../repository/sales/BackOrderRepostitory";
import { rackIndex } from "../../../config/algoliaConfig";

const Table = ({
    isAlgoliaTable = false,
    columns = [],
    data = [],
    isLoading,
    onFilterClick, // Tambahkan fungsi untuk menangani filter
    isSecondary,
    canEdit,
    onTableClick,
    selectedValue,
    setSelectedValue,
    tableType,
}) => {
    // Hooks
    const { loginUser } = useUsers();
    const { racks } = useRacks();
    const { showToast } = useToast();

    const location = useLocation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [accessDenied, setAccessDenied] = useState(false);

    const [itemsPerPage, setItemsPerPage] = useState(8);

    const safeData = Array.isArray(data) ? data : [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = isAlgoliaTable ? data : safeData.slice(startIndex, startIndex + itemsPerPage);
    const [hoveredIndex, setHoveredIndex] = useState(-1);
    const tableRef = useRef(null);
    const [qtyMap, setQtyMap] = useState({});
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderConfirmationModal, setOrderConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [unitQtyMap, setUnitQtyMap] = useState({}); // simpan jumlah per satuan
    const [isEditingQty, setIsEditingQty] = useState(false);

    const [outOfStockItems, setOutOfStockItems] = useState([]);
    const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);




    const totalQty = Object.values(qtyMap).reduce((sum, entry) => sum + entry.totalQty, 0);


    const { formats } = useFormats();
    const formatCode = formats.presets?.sales?.code;
        const formattedSO = formats?.presets?.sales?.rackMedan || '';
    const yearFormat = formats.yearFormat;
    const monthFormat = formats.monthFormat;
    const uniqueFormat = formats.uniqueFormat;

    useEffect(() => {
        console.log('Safe Data: ', safeData);
    }, [safeData]);

    useEffect(() => {
        console.log('Qty Map: ', qtyMap);
    }, [qtyMap]);

    console.log('Formats: ', formats);


    useEffect(() => {
        console.log('Horvered Row ID: ', selectedValue);
    }, [selectedValue]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!tableRef.current || document.activeElement.tagName === "INPUT") return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHoveredIndex(prev => {
                    const newIndex = Math.min(prev + 1, currentData.length - 1);
                    setSelectedValue(currentData[newIndex] || currentData[newIndex]);
                    return newIndex;
                });
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setHoveredIndex(prev => {
                    const newIndex = Math.max(prev - 1, 0);
                    setSelectedValue(currentData[newIndex] || currentData[newIndex]);
                    return newIndex;
                });
            }

            if (e.key === "Enter" && hoveredIndex >= 0) {
                const selectedItem = currentData[hoveredIndex];
                if (onTableClick) {
                    onTableClick(selectedItem);
                } else if (canEdit) {
                    isSecondary
                        ? navigateToDetail(selectedItem.id || selectedItem.objectID + ' - ' + selectedItem.secondaryId)
                        : navigateToDetail(selectedItem.id || selectedItem.objectID);
                } else {
                    handleRestricedAction();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentData, hoveredIndex]);


    // Navigation
    // Navigation to Detail
    const navigateToDetail = (id) => {
        navigate(`${location.pathname}/${id}`);
    }

    // const navigateToDetail = (id) => {
    //     window.open(`${location.pathname}/${id}`, '_blank');
    // }


    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    const checkStockBeforeOrder = () => {
        const outOfStock = [];

        Object.entries(qtyMap).forEach(([id, entry]) => {
            if (entry.totalQty > entry.stock) {
                outOfStock.push({
                    id,
                    name: entry.name,
                    totalQty: entry.totalQty,
                    stock: entry.stock,
                    shortage: entry.totalQty - entry.stock,
                    price: entry.price,
                    code: entry.code
                });
            }
        });

        if (outOfStock.length > 0) {
            setOutOfStockItems(outOfStock);
            setShowOutOfStockModal(true);
        } else {
            handleCreateOrder(qtyMap); // semua stok cukup
        }
    };

        useEffect(() => {
        const fetchRack = async () => {
            if (!formattedSO) return;

            const { hits } = await rackIndex.search('', {
                filters: `objectID:${formattedSO}`,
            });

            if (hits.length > 0) {
                const rack = hits[0];
                setSelectedWarehouse({
                    id: rack.objectID,
                    name: rack.name,
                    location: rack.location,
                    category: rack.category || 'Sales', // Tambahkan kategori jika ada
                });
            }
        };

        fetchRack();
    }, [formattedSO]);

    const handleBackOrderDecision = async (mode = 'bo') => {
        const updatedQtyMap = {};
        const boQtyMap = {};


        const newCode = await CounterRepository.getNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);

        Object.entries(qtyMap).forEach(([id, entry]) => {
            const stock = entry.stock;
            const totalQty = entry.totalQty;

            if (totalQty > stock) {
                if (mode === 'bo') {
                    if (stock > 0) {
                        updatedQtyMap[id] = { ...entry, totalQty: stock };
                    }
                    boQtyMap[id] = { ...entry, totalQty: totalQty - stock };
                } else if (mode === 'cancel') {
                    if (stock > 0) {
                        updatedQtyMap[id] = { ...entry, totalQty: stock };
                    }
                    // Item dengan 0 stock tidak disimpan
                }
            } else {
                updatedQtyMap[id] = entry;
            }
        });

        setQtyMap(updatedQtyMap);
        setShowOutOfStockModal(false);
        setOrderConfirmationModal(true);

        if (mode === 'bo' && Object.keys(boQtyMap).length > 0) {
            const boItems = Object.entries(boQtyMap).map(([id, entry]) => ({
                item: {
                    id,
                    code: entry.code,
                    name: entry.name,
                },
                price: entry.price,
                qty: entry.totalQty,
                discount: 0,
            }));

            const totalBOPrice = boItems.reduce((sum, item) => sum + item.qty * item.price, 0);

            const boData = {
                code: newCode,
                customer: {
                    id: loginUser.id,
                    name: loginUser.username,
                },
                description: description || "Pesanan kekurangan stok, dipindahkan ke BO.",
                status: "tertunda",
                warehouse: selectedWarehouse,
                items: boItems,
                totalPrice: totalBOPrice,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            try {
                await SalesOrderRepository.createSalesOrder(boData);
                showToast("berhasil", "Pesanan BO berhasil dibuat!");
            } catch (e) {
                console.error("Gagal menyimpan BO:", e);
                showToast("gagal", "Gagal menyimpan pesanan BO.");
            }
        }
    };



    const handleCreateOrder = async () => {
        setLoading(true);

        try {
            const newCode = await CounterRepository.getNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
            const customerData = {
                name: loginUser.username,
                id: loginUser.id,
            }

            const transformedItems = Object.entries(qtyMap).map(([id, data]) => ({
                discount: 0,
                item: {
                    id,
                    code: data.code,
                    name: data.name,
                },
                price: data.price,
                qty: data.totalQty,
                discount: 0,
            }));

            const totalPrice = transformedItems.reduce((total, item) => {
                return total + item.qty * item.price;
            }, 0);

            const orderData = {
                code: newCode,
                customer: customerData,
                description,
                isPrint: false,
                status: "mengantri",
                warehouse: selectedWarehouse,
                items: transformedItems,
                totalPrice,
                createdAt: serverTimestamp(),
                udpatedAt: serverTimestamp(),
            }

            console.log('Order Data: ', orderData);

            try {
                await SalesOrderRepository.createSalesOrder(orderData);
            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", "Gagal menyimpan pemesanan!");
                return;
            }

            showToast('berhasil', 'Pemesanan berhasil dilakukan!');
            resetForm();
            setOrderConfirmationModal(false);
        } catch (e) {
            console.error(e); // jangan kosongin catch, bantu debug
            showToast("gagal", "Gagal menyimpan pemesanan!");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setQtyMap({});
        setDescription('');
    }

    useEffect(() => {
        console.log('Qty Map: ', qtyMap);
    }, [qtyMap]);

    const handleEditFromQtyMap = (productId) => {
        const productEntry = qtyMap[productId];
        console.log('Editing Product Entry: ', productEntry);
        if (!productEntry) return;

        setIsEditingQty(true); // ← menandakan sedang dalam mode edit qty
        setShowOrderModal(false); // tutup sementara

        const simulatedProduct = {
            id: productId,
            name: productEntry.name,
            code: productEntry.code,
            category: productEntry.category,
            brand: productEntry.brand,
            stock: productEntry.stock,
            salePrice: productEntry.price,
            set: Object.entries(productEntry.units).map(([setName, { content }]) => ({
                set: setName,
                qty: parseInt(content),
            })),
        };

        const initialUnitQty = {};
        for (const [unit, value] of Object.entries(productEntry.units)) {
            initialUnitQty[unit] = value.qty;
        }

        setSelectedProduct(simulatedProduct);
        setUnitQtyMap(initialUnitQty);
        setModalOpen(true);
    };

    useEffect(() => {
        if (selectedProduct && !isEditingQty) {
            const initialUnitQty = {};
            selectedProduct.set?.forEach((s) => {
                initialUnitQty[s.set] = 0;
            });
            setUnitQtyMap(initialUnitQty);
        }
    }, [selectedProduct, isEditingQty]);

    const handleDeleteFromQtyMap = (productId) => {
        setQtyMap((prev) => {
            const newMap = { ...prev };
            delete newMap[productId];
            return newMap;
        });
    };


    return (
        <div className={!isAlgoliaTable ? 'table-wrapper' : ''} ref={tableRef}>
            <table>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>
                                <div className="table-header">
                                    {col.header}
                                    <button className="filter-btn" onClick={() => onFilterClick(col.accessor)}></button>
                                </div>
                            </th>
                        ))}
                        {tableType === "customers" && <th>Pesanan</th>}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
                                Sedang memuat...
                            </td>
                        </tr>
                    ) : (
                        currentData.length > 0 ? (
                            currentData.map((item, index) => (
                                <tr
                                    key={item.id || item.objectID}
                                    onClick={() => {
                                        // Delay agar tidak bentrok dengan double click
                                        tableType !== "customers" &&
                                            setTimeout(() => {
                                                setSelectedValue(item);
                                                setHoveredIndex(index);
                                            }, 200);
                                    }}
                                    onDoubleClick={() => {
                                        // Hentikan timeout dari single click
                                        clearTimeout();

                                        if (onTableClick) {
                                            console.log('Double Clicked Item:', item);
                                            onTableClick(item);
                                        } else {
                                            if (canEdit) {
                                                isSecondary
                                                    ? navigateToDetail(item.id || item.objectID + ' - ' + item.secondaryId)
                                                    : navigateToDetail(item.id || item.objectID);
                                            } else {
                                                handleRestricedAction();
                                            }
                                        }
                                    }}

                                    className={
                                        hoveredIndex === index
                                            ? 'hovered'
                                            : selectedValue?.id === (item.id || item.objectID)
                                                ? 'selected'
                                                : ''
                                    }
                                >

                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.accessor}`}>
                                            {col.renderCell
                                                ? col.renderCell(
                                                    col.accessor.includes(".")
                                                        ? col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
                                                        : item[col.accessor],
                                                    item
                                                )
                                                : (col.accessor.includes(".")
                                                    ? col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
                                                    : item[col.accessor])}
                                        </td>
                                    ))}

                                    {tableType === "customers" && (
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <IconButton
                                                    icon={<Plus size={20} />}
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProduct(item);
                                                        setModalOpen(true);
                                                    }}
                                                    background="#007bff"
                                                    color="#fff"
                                                    padding="5px"
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
                                    Tidak ada data
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            {tableType === "customers" && (
                <div className="order-details">
                    <div>
                        <div className="order-row">
                            <span>Jumlah Pesanan:</span>
                            <span>{Object.values(qtyMap).reduce((sum, entry) => sum + entry.totalQty, 0)} Produk</span>
                        </div>
                        <div className="order-row">
                            <span>Total Pesanan:</span>
                            <span>
                                Rp. {Object.values(qtyMap)
                                    .reduce((total, entry) => total + (entry.totalQty * entry.price), 0)
                                    .toLocaleString("id-ID")}
                            </span>
                        </div>

                        <div
                            className="order-details-stats"
                            onClick={() => setShowOrderModal(true)}
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                        >
                            Lihat Detail Pesanan
                        </div>


                        <div
                            className={`order-details-button ${totalQty === 0 ? "disabled" : ""}`}
                            onClick={() => {
                                if (totalQty > 0) {
                                    // lanjut ke proses pemesanan
                                    setOrderConfirmationModal(true);
                                }
                            }}
                        >
                            Pesan Sekarang
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{selectedProduct.category.name} - {selectedProduct.name} ({selectedProduct.brand})
                        </h2>
                        <p>Stok Tersedia: {selectedProduct.stock}</p>

                        <table>
                            <thead>
                                <tr>
                                    <th>Satuan</th>
                                    <th>Isi per Satuan</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProduct.set?.map((satuan, idx) => (
                                    <tr key={idx}>
                                        <td>{satuan.set}</td>
                                        <td>{satuan.qty}</td>
                                        <td>
                                            <div className="counter-wrapper">
                                                <button
                                                    className="counter-button"
                                                    onClick={() => {
                                                        setUnitQtyMap((prev) => ({
                                                            ...prev,
                                                            [satuan.set]: Math.max(0, (prev[satuan.set] || 0) - 1)
                                                        }));
                                                    }}
                                                >-</button>

                                                <input
                                                    type="text"
                                                    className="counter-input"
                                                    value={unitQtyMap[satuan.set] || 0}
                                                    onChange={(e) => {
                                                        const val = Math.max(0, parseInt(e.target.value) || 0);
                                                        setUnitQtyMap((prev) => ({
                                                            ...prev,
                                                            [satuan.set]: val
                                                        }));
                                                    }}
                                                />

                                                <button
                                                    className="counter-button"
                                                    onClick={() => {
                                                        setUnitQtyMap((prev) => ({
                                                            ...prev,
                                                            [satuan.set]: (prev[satuan.set] || 0) + 1
                                                        }));
                                                    }}
                                                >+</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p>
                            <strong>Total Qty:</strong>{" "}
                            {selectedProduct.set?.reduce((total, s) => {
                                const count = unitQtyMap[s.set] || 0;
                                return total + (count * s.qty);
                            }, 0)}
                        </p>

                        <div className="modal-actions">
                            <ActionButton
                                title={"Batal"}
                                onclick={() => {
                                    setModalOpen(false);
                                    if (isEditingQty) {
                                        setShowOrderModal(true); // kembali ke modal pesanan
                                        setIsEditingQty(false);
                                    }
                                }}
                                color={"white"}
                                background={"#dc3545"}
                            />


                            <ActionButton
                                title={'Simpan'}
                                onclick={() => {
                                    setQtyMap((prev) => {
                                        const key = selectedProduct.id || selectedProduct.objectID;

                                        const satuanMap = {};

                                        selectedProduct.set.forEach((s) => {
                                            const qty = unitQtyMap[s.set] || 0;
                                            satuanMap[s.set] = {
                                                qty,
                                                content: s.qty,
                                            };
                                        });

                                        console.log('Selected Product: ', selectedProduct)

                                        return {
                                            ...prev,
                                            [key]: {
                                                name: selectedProduct.name,
                                                brand: selectedProduct.brand,
                                                category: selectedProduct.category,
                                                code: selectedProduct.code,
                                                qty: selectedProduct.qty,
                                                totalQty: Object.values(satuanMap).reduce((sum, item) => sum + (item.qty * item.content), 0),
                                                stock: selectedProduct.stock || 0,
                                                units: satuanMap,
                                                price: selectedProduct.salePrice,
                                            }
                                        };
                                    });

                                    setModalOpen(false);
                                    setSelectedProduct(null);
                                    setUnitQtyMap({});

                                    if (isEditingQty) {
                                        setShowOrderModal(true);  // hanya buka kembali kalau dari mode edit
                                        setIsEditingQty(false);
                                        showToast('berhasil', 'Jumlah produk berhasil diperbarui!');
                                    } else {
                                        // dari penambahan biasa, tidak membuka modal pesanan
                                        showToast('berhasil', 'Produk berhasil ditambahkan ke pesanan!');
                                    }
                                }}
                            />

                        </div>
                    </div>
                </div>
            )}


            {orderConfirmationModal && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content" style={{ maxWidth: "90%" }} onClick={(e) => e.stopPropagation()}>
                        <h3>Apakah pesanan anda sudah sesuai?</h3>
                        {Object.entries(qtyMap).filter(([, entry]) => entry.qty > 0 || true).map(([id, entry]) => (
                            <div key={id} className="confirmation-products">
                                <div className="confirmation-sub-header-products" style={{ display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                    <div>{entry.category?.name} - {entry.name || "-"} ({entry.brand})</div>
                                    <div>X{entry.totalQty || 0}</div>
                                    <div style={{ fontSize: '14px' }}>Rp. {entry.price.toLocaleString("id-ID")}</div>
                                </div>
                                <div>Rp. {(entry.totalQty * entry.price).toLocaleString("id-ID")}</div>
                            </div>
                        ))
                        }

                        <div className="confirmation-foooter-products">
                            <div className="confirmation-footer-sub-header">
                                <div>
                                    <label style={{ fontWeight: 500 }}>Alamat Saya:</label>
                                    <div>
                                        <div>{loginUser.address}</div>
                                        <div style={{ fontSize: "16px", color: 'grey' }}>{loginUser.city}</div>
                                        <div style={{ fontSize: "16px", color: 'grey' }}>{loginUser.province}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="order-row">
                                        <span>Jumlah Pesanan:</span>
                                        <span>{Object.values(qtyMap).reduce((sum, entry) => sum + entry.totalQty, 0)} Produk</span>
                                    </div>
                                    <div className="order-row">
                                        <span>Total Pesanan:</span>
                                        <span>
                                            Rp. {Object.values(qtyMap)
                                                .reduce((total, entry) => total + (entry.totalQty * entry.price), 0)
                                                .toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-description">
                                <label>Keterangan Tambahan:</label>
                                <textarea
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="form-input-area"
                                    placeholder="Keterangan"
                                />
                            </div>
                        </div>

                        <div className="order-modal-buttons">
                            <button onClick={() => setOrderConfirmationModal(false)}>Tutup</button>
                            <button onClick={checkStockBeforeOrder}>Pesan</button>
                        </div>
                    </div>
                </div>
            )
            }

            {showOutOfStockModal && (
                <div className="modal-overlay" onClick={() => setShowOutOfStockModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Beberapa item kehabisan stok:</h3>
                        {outOfStockItems.map((item) => (
                            <div key={item.id} className="confirmation-products">
                                <div>{item.name} ({item.totalQty} diminta, stok tersedia {item.stock})</div>
                                <div style={{ color: 'red' }}>Kekurangan: {item.shortage}</div>
                            </div>
                        ))}
                        <div className="order-modal-bo-buttons">
                            <button onClick={() => setShowOutOfStockModal(false)}>Tutup</button>
                            <button onClick={() => handleBackOrderDecision('cancel')}>Batalkan Item</button>
                            <button onClick={() => handleBackOrderDecision('bo')}>Pindah ke Pesanan Tertunda</button>
                        </div>
                    </div>
                </div>
            )}




            {/* Pagination */}
            {
                !isAlgoliaTable && (
                    <div className="pagination">
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                            &laquo; Awal
                        </button>
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                            &lt; Prev
                        </button>
                        {/* <span>Hal. {currentPage} | {totalPages}</span> */}
                        <span>Hal. {currentPage} | {1}</span>
                        {/* <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}> */}
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={true}>
                            Next &gt;
                        </button>
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={true}>
                            Akhir &raquo;
                        </button>

                        <div className="items-per-page">
                            <select value={itemsPerPage} onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}>
                                <option value={8}>8</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span> per halaman</span>
                        </div>
                    </div>
                )
            }

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />

            {
                showOrderModal && (
                    <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                        <div className="modal-content" style={{ maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
                            <h3>Detail Pesanan</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "left" }}>Produk</th>
                                        <th>Qty</th>
                                        <th>Harga</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(qtyMap)
                                        .filter(([, entry]) => entry.qty > 0 || true) // tampilkan semua produk yang pernah dipilih
                                        .map(([id, entry]) => (
                                            <tr key={id}>
                                                <td>{entry.category.name || '-'} - {entry.name || ''} ({entry.brand || ''})</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                        <span>{entry.totalQty}</span>
                                                        <button onClick={() => handleEditFromQtyMap(id)}>
                                                            ✏️
                                                        </button>

                                                    </div>
                                                </td>

                                                <td style={{ textAlign: "right" }}>Rp. {entry.price.toLocaleString("id-ID")}</td>
                                                <td style={{ textAlign: "right" }}>Rp. {(entry.totalQty * entry.price).toLocaleString("id-ID")}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "red" }}
                                                        onClick={() => handleDeleteFromQtyMap(id)}
                                                        title="Hapus Item"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>

                                            </tr>
                                        ))}
                                </tbody>

                            </table>

                            <div style={{ textAlign: "right", marginTop: "20px" }}>
                                <button onClick={() => setShowOrderModal(false)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Table;
