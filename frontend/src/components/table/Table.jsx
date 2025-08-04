import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Table.css";
import AccessAlertModal from "../modal/access_alert_modal/AccessAlertModal";
import { useUsers } from "../../context/auth/UsersContext";
import { useFormats } from "../../context/personalization/FormatContext";
import CounterRepository from "../../repository/personalization/CounterRepository";
import { useRacks } from "../../context/warehouse/RackWarehouseContext";
import { serverTimestamp } from "firebase/firestore";
import { useToast } from "../../context/ToastContext";
import { Check, Plus } from "lucide-react";
import IconButton from "../button/icon_button/IconButton";
import ActionButton from "../button/actionbutton/ActionButton";
import { expressIndex, rackIndex } from "../../../config/algoliaConfig";
import Tippy from "@tippyjs/react";
import ItemsRepository from "../../repository/warehouse/ItemsRepository";
import SalesOrderRepository from "../../repository/sales/SalesOrderRepository";
import TransferRepository from "../../repository/warehouse/TransferRepository";

const DEFAULT_TIMER_SECONDS = 24 * 60 * 60;

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
    const [timerModal, setTimerModal] = useState(false);
    const [addressModal, setAddressModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showLimitWarningMap, setShowLimitWarningMap] = useState({});
    const [soID, setSOID] = useState('');
    const [SOCreatedDate, setSOCreatedDate] = useState('');

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [unitQtyMap, setUnitQtyMap] = useState({}); // simpan jumlah per satuan
    const [isEditingQty, setIsEditingQty] = useState(false);
    const [express, setExpress] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(() => {
        if (
            loginUser &&
            loginUser.addresses &&
            loginUser.selectedAddress
        ) {
            const foundIndex = loginUser.addresses.findIndex(
                (addr) =>
                    addr.address === loginUser.selectedAddress.address &&
                    addr.city === loginUser.selectedAddress.city
            );
            return foundIndex !== -1 ? foundIndex : 0;
        }
        return 0;
    });

    useEffect(() => {
        if (express && express.length > 0 && !selectedShipping) {
            setSelectedShipping(express[0]);
        }
    }, [express]);


    const handleOpenTimerModal = (id) => {
        const existingStartTime = localStorage.getItem(`startTime_${id}`);
        if (!existingStartTime) {
            const now = Date.now();
            localStorage.setItem(`startTime_${id}`, now.toString());
        }
        setTimerModal(true);
    };

    const orderIdRef = useRef(null);
    const [timers, setTimers] = useState({});
    const [transferProof, setTransferProof] = useState(null);

    useEffect(() => {
        if (!soID || !timerModal) return;

        const startTimeStr = localStorage.getItem(`startTime_${soID}`);
        if (!startTimeStr) return;

        const startTime = parseInt(startTimeStr, 10);

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const timeLeft = Math.max(DEFAULT_TIMER_SECONDS - elapsedSeconds, 0);

            setTimers((prev) => ({ ...prev, [soID]: timeLeft }));

            if (timeLeft === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [soID, timerModal]);

    const currentTime = soID && timers[soID] !== undefined
        ? timers[soID]
        : DEFAULT_TIMER_SECONDS;


    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };


    const totalQty = Object.values(qtyMap).reduce((sum, entry) => sum + entry.totalQty, 0);


    const { formats } = useFormats();
    const formatCode = formats.presets?.sales?.code;
    const formattedSO = formats?.presets?.sales?.rackMedan || '';
    const yearFormat = formats.yearFormat;
    const monthFormat = formats.monthFormat;
    const uniqueFormat = formats.uniqueFormat;

    useEffect(() => {
        const loadExpressOptions = async (inputValue) => {
            const searchTerm = inputValue || ""; // pastikan tetap "" jika kosong
            const { hits } = await expressIndex.search(searchTerm, {
                hitsPerPage: 10,
            });

            console.log('Hits: ', hits);

            const hitsData = hits.map(hit => ({
                id: hit.id || hit.objectID,
                name: hit.name,
                price: hit.price,
                estimationStart: hit.estimationStart,
                estimationEnd: hit.estimationEnd,
            }));

            setExpress(hitsData);
        };

        loadExpressOptions();
    }, [])

    useEffect(() => {
        console.log('Safe Data: ', safeData);
    }, [safeData]);

    useEffect(() => {
        console.log('Qty Map: ', qtyMap);
    }, [qtyMap]);

    console.log('Formats: ', formats);

    useEffect(() => {
        console.log('Selected Products: ', selectedProduct);
    }, [selectedProduct]);


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

    const getTotalStock = (stockObj) => {
        if (!stockObj || typeof stockObj !== 'object') return 0;
        return Object.values(stockObj).reduce((sum, val) => sum + val, 0);
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


    const handleCreateOrder = async () => {
        setLoading(true);

        try {
            const newCode = await CounterRepository.getNextCode(formatCode, uniqueFormat, monthFormat, yearFormat);
            const clientCreatedDate = Date.now(); // dipakai untuk timer
            const SOCreatedDate = serverTimestamp(); // disimpan ke Firestore

            setSOCreatedDate(clientCreatedDate);

            const transformedItems = Object.entries(qtyMap).map(([id, data]) => ({
                discount: 0,
                item: {
                    id,
                    code: data.category?.code + '-' + data.code,
                    name: data.category?.name + ' - ' + data.name,
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
                customer: loginUser,
                description,
                isPrint: false,
                express: selectedShipping,
                status: "menunggu",
                statusPayment: "menunggu pembayaran",
                items: transformedItems,
                totalPayment: totalPrice + selectedShipping?.price || 0,
                createdAt: SOCreatedDate, // untuk backend
                udpatedAt: serverTimestamp(),
            }


            try {
                const soID = await SalesOrderRepository.createSalesOrder(orderData);
                localStorage.setItem(`startTime_${soID}`, clientCreatedDate.toString());
                setSOID(soID); // trigger useEffect timer

                const userCity = loginUser.selectedAddress?.city?.toLowerCase(); // 'medan' / 'jakarta'
                const otherCity = userCity === 'medan' ? 'jakarta' : 'medan';

                const transferItems = [];

                for (const item of transformedItems) {
                    const itemId = item.item.id;
                    const qtyNeeded = item.qty;

                    const itemData = await ItemsRepository.getItemsById(itemId);
                    console.log('Table || Item Data: ', itemData);
                    const stock = itemData.stock || {};
                    console.log('Table || Stock - 265: ', stock);

                    let remainingQty = qtyNeeded;

                    // Step 1: Kurangi stok dari kota pelanggan dulu
                    let fromUserCityStock = stock[userCity] || 0;
                    const deductFromUserCity = Math.min(fromUserCityStock, remainingQty);
                    if (deductFromUserCity > 0) {
                        stock[userCity] = fromUserCityStock - deductFromUserCity;
                        remainingQty -= deductFromUserCity;
                    }

                    // Step 2: Jika masih kurang, kurangi dari cabang lain
                    if (remainingQty > 0) {
                        const fromOtherCityStock = stock[otherCity] || 0;
                        const deductFromOtherCity = Math.min(fromOtherCityStock, remainingQty);

                        if (deductFromOtherCity > 0) {
                            stock[otherCity] = fromOtherCityStock - deductFromOtherCity;
                            remainingQty -= deductFromOtherCity;

                            // Simpan item ini untuk keperluan transfer
                            transferItems.push({
                                itemId: itemId,
                                code: item.item.code,
                                name: item.item.name,
                                qty: deductFromOtherCity,
                                price: item.price
                            });
                        }
                    }

                    console.log('Table || Item ID: ', itemId);
                    console.log('Table || Stock: ', stock);

                    await ItemsRepository.updateStockOrder(itemId, stock)
                }

                const transferData = {
                    soCode: newCode,
                    locationFrom: otherCity,
                    locationTo: userCity,
                    items: transferItems,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                }

                if (transferItems.length > 0) {
                    await TransferRepository.createTransfer(transferData);
                }

            } catch (submitError) {
                console.error("Error during onSubmit: ", submitError);
                showToast("gagal", "Gagal menyimpan pemesanan!");
                return;
            }

            showToast('berhasil', 'Pemesanan berhasil dilakukan!');
            resetForm();
            handleOpenTimerModal(soID);
            setOrderConfirmationModal(false);
        } catch (e) {
            console.error(e); // jangan kosongin catch, bantu debug
            showToast("gagal", "Gagal menyimpan pemesanan!");
        } finally {
            setLoading(false);
        }
    };


    const handleSelectAddress = (index) => {
        setSelectedAddressIndex(index);
        setModalOpen(false);
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

    useEffect(() => {
        if (!selectedProduct?.set) return;

        const newWarnings = {};

        selectedProduct.set.forEach((satuan) => {
            const val = unitQtyMap[satuan.set] || 0;
            const additionalQty = satuan.qty;

            const otherQty = selectedProduct.set.reduce((total, s) => {
                const count = unitQtyMap[s.set] || 0;
                return total + (s.set === satuan.set ? 0 : count * s.qty);
            }, 0);

            const totalIfChanged = otherQty + val * additionalQty;

            newWarnings[satuan.set] = totalIfChanged > (selectedProduct.stock || 0);
        });

        setShowLimitWarningMap(newWarnings);
    }, [unitQtyMap, selectedProduct]);


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
                                                {qtyMap[item.id || item.objectID] ? (
                                                    <Tippy content="Item sudah ada dipesanan.">
                                                        <span>
                                                            <IconButton
                                                                icon={<Check size={20} />}
                                                                background="#28a745" // hijau
                                                                color="#fff"
                                                                padding="5px"
                                                                disabled={true} // nonaktifkan supaya tidak bisa klik lagi
                                                            />
                                                        </span>
                                                    </Tippy>
                                                ) : (
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
                                                )}
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
                        <p>
                            {`Stok Tersedia: ${getTotalStock(selectedProduct.stock)}`}
                        </p>

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
                                                        const additionalQty = satuan.qty;

                                                        const otherQty = selectedProduct.set?.reduce((total, s) => {
                                                            const count = unitQtyMap[s.set] || 0;
                                                            return total + (s.set === satuan.set ? 0 : (count * s.qty));
                                                        }, 0) || 0;

                                                        const totalIfChanged = otherQty + (val * additionalQty);
                                                        const totalStock = getTotalStock(selectedProduct.stock);

                                                        if (totalIfChanged <= totalStock) {
                                                            setUnitQtyMap((prev) => ({
                                                                ...prev,
                                                                [satuan.set]: val
                                                            }));
                                                            setShowLimitWarningMap((prev) => ({
                                                                ...prev,
                                                                [satuan.set]: false
                                                            }));
                                                        } else {
                                                            setShowLimitWarningMap((prev) => ({
                                                                ...prev,
                                                                [satuan.set]: true
                                                            }));
                                                        }
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
                                                    disabled={
                                                        (() => {
                                                            const currentCount = unitQtyMap[satuan.set] || 0;
                                                            const additionalQty = satuan.qty;

                                                            // Hitung total tanpa memasukkan satuan yang sedang ditekan
                                                            const otherQty = selectedProduct.set?.reduce((total, s) => {
                                                                const count = unitQtyMap[s.set] || 0;
                                                                return total + (s.set === satuan.set ? 0 : (count * s.qty));
                                                            }, 0) || 0;

                                                            const totalIfAdded = otherQty + ((currentCount + 1) * additionalQty);
                                                            const totalStock = getTotalStock(selectedProduct.stock);

                                                            return totalIfAdded > totalStock;
                                                        })()
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {showLimitWarningMap[satuan.set] && (
                                                <p style={{ color: "red", marginTop: "4px", fontSize: "12px" }}>
                                                    Melebihi stok! Maksimal {getTotalStock(selectedProduct.stock)} pcs.
                                                </p>
                                            )}

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
                                    setUnitQtyMap({});
                                    setShowLimitWarningMap({});
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
                                                stock: selectedProduct.stock,
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
                                <div className="confirmation-sub-header-products">
                                    <div className="confirmation-items-order">
                                        <div>{entry.category?.name} - {entry.name || "-"} ({entry.brand})</div>
                                        <div>x{entry.totalQty || 0}</div>
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'grey' }}>Rp. {entry.price.toLocaleString("id-ID")}</div>
                                </div>
                                <div>Rp. {(entry.totalQty * entry.price).toLocaleString("id-ID")}</div>
                            </div>
                        ))
                        }

                        <div className="confirmation-foooter-products">
                            <div className="confirmation-footer-sub-header">
                                <div className="confirmation-address">
                                    <div className="form-group">
                                        <div className="order-confirmation-title">Alamat Pengiriman:</div>
                                        {selectedAddressIndex !== null && loginUser.addresses[selectedAddressIndex] && (
                                            <div className="address-box selected" onClick={() => setAddressModal(true)}>
                                                <div>
                                                    Alamat: {loginUser.addresses[selectedAddressIndex].address},
                                                </div>
                                                <div>
                                                    Kota: {loginUser.addresses[selectedAddressIndex].city},
                                                </div>
                                                <div>
                                                    Provinsi: {loginUser.addresses[selectedAddressIndex].province}
                                                </div>
                                            </div>
                                        )}
                                        {/* <select
                                            value={selectedAddressIndex}
                                            onChange={(e) => setSelectedAddressIndex(parseInt(e.target.value))}
                                        >
                                            {loginUser.addresses.map((addr, idx) => (
                                                <option key={idx} value={idx}>
                                                    {addr.address}, {addr.city}, {addr.province}
                                                </option>
                                            ))}
                                        </select> */}
                                    </div>
                                </div>

                                <div className="shipping-options">
                                    <div className="order-confirmation-title">Pilih Pengiriman:</div>
                                    {express.map((exp) => (
                                        <div
                                            key={exp.id}
                                            className={`shipping-option ${selectedShipping?.id === exp.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedShipping(exp)}
                                            style={{
                                                border: selectedShipping?.id === exp.id ? '2px solid #007bff' : '1px solid #ccc',
                                                padding: '10px',
                                                marginBottom: '10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{exp.name}</div>
                                            <div>Rp. {exp.price.toLocaleString("id-ID")}</div>
                                            <div>Estimasi: {exp.estimationStart}–{exp.estimationEnd} Hari</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-payment">
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
                                    <div className="order-row">
                                        <span>Biaya Pengiriman:</span>
                                        <span>
                                            Rp. {selectedShipping?.price?.toLocaleString("id-ID") || 0}
                                        </span>
                                    </div>

                                    <div className="order-row" style={{ fontWeight: "bold" }}>
                                        <span>Total Pembayaran:</span>
                                        <span>
                                            Rp. {(
                                                Object.values(qtyMap).reduce(
                                                    (total, entry) => total + entry.totalQty * entry.price,
                                                    0
                                                ) + (selectedShipping?.price || 0)
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-description">
                                <label>Catatan Tambahan:</label>
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
                            <button onClick={handleCreateOrder}>Pesan</button>
                        </div>
                    </div>
                </div>
            )
            }


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
                            <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>🧾 Detail Pesanan</h3>

                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                                        <th style={{ textAlign: "center", padding: "8px" }}>Produk</th>
                                        <th style={{ textAlign: "center", padding: "8px" }}>Qty</th>
                                        <th style={{ textAlign: "center", padding: "8px" }}>Harga</th>
                                        <th style={{ textAlign: "center", padding: "8px" }}>Total</th>
                                        <th style={{ padding: "8px" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(qtyMap).filter(([, entry]) => entry.totalQty > 0).length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "16px" }}>
                                                Tidak ada data
                                            </td>
                                        </tr>
                                    ) : (
                                        Object.entries(qtyMap)
                                            .filter(([, entry]) => entry.totalQty > 0)
                                            .map(([id, entry]) => (
                                                <tr key={id} style={{ borderBottom: "1px solid #ddd" }}>
                                                    <td style={{ padding: "8px" }}>
                                                        <strong>{entry.name}</strong><br />
                                                        <small>{entry.category?.name || '-'} • {entry.brand || '-'}</small>
                                                    </td>
                                                    <td style={{ textAlign: "center", padding: "8px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                            <span>{entry.totalQty}</span>
                                                            <button
                                                                onClick={() => handleEditFromQtyMap(id)}
                                                                style={{ background: "none", border: "none", cursor: "pointer" }}
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "center", padding: "8px" }}>
                                                        Rp {entry.price.toLocaleString("id-ID")}
                                                    </td>
                                                    <td style={{ textAlign: "center", padding: "8px" }}>
                                                        Rp {(entry.totalQty * entry.price).toLocaleString("id-ID")}
                                                    </td>
                                                    <td style={{ textAlign: "center", padding: "8px" }}>
                                                        <button
                                                            onClick={() => handleDeleteFromQtyMap(id)}
                                                            title="Hapus Item"
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                color: "red",
                                                                cursor: "pointer",
                                                                fontSize: "16px",
                                                            }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>

                            </table>

                            <div style={{ textAlign: "right", marginTop: "20px" }}>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#007bff",
                                        border: "none",
                                        color: "white",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>

                    </div>
                )
            }

            {addressModal && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div
                        className="modal-content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="modal-title">Daftar Alamat</h3>

                        {loginUser?.addresses?.length === 0 ? (
                            <p style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
                                Tidak ada alamat yang tersedia
                            </p>
                        ) : (
                            loginUser?.addresses?.length === 0 ? (
                                <p style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
                                    Tidak ada alamat yang tersedia
                                </p>
                            ) : (
                                loginUser?.addresses?.map((addr, idx) => {
                                    const isSelected = idx === selectedAddressIndex;

                                    return (
                                        <div
                                            key={idx}
                                            className="address-box"
                                            style={{
                                                position: 'relative',
                                                padding: '10px 40px 10px 10px',
                                                border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                backgroundColor: isSelected ? '#e9f3ff' : '#fff',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleSelectAddress(idx)}
                                        >
                                            <div><strong>Alamat:</strong> {addr.address}</div>
                                            <div><strong>Kota:</strong> {addr.city}</div>
                                            <div><strong>Provinsi:</strong> {addr.province}</div>
                                        </div>
                                    );
                                })
                            )
                        )}

                        <div className="customer-profil-button">
                            <ActionButton
                                title="Tutup"
                                background="red"
                                onclick={() => setAddressModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}


            {timerModal && (
                <div className="modal-overlay" onClick={() => setTimerModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Silakan Lakukan Pembayaran</h2>
                        <p className="modal-subtitle">Waktu tersisa untuk melakukan pembayaran:</p>
                        <h3 className="countdown-timer">{formatTime(currentTime)}</h3>

                        <div className="bank-info">
                            <h4>Transfer ke Rekening:</h4>
                            <p><strong>Bank:</strong> BCA</p>
                            <p><strong>No Rek:</strong> 1234567890</p>
                            <p><strong>Atas Nama:</strong> PT. RIKO Parts</p>
                        </div>

                        <div className="upload-proof">
                            <label htmlFor="proof">Upload Bukti Transfer:</label><br />
                            <input
                                type="file"
                                id="proof"
                                accept="image/*,application/pdf"
                                onChange={(e) => setTransferProof(e.target.files[0])}
                            />
                            {transferProof && <p className="uploaded-file">File: {transferProof.name}</p>}
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setTimerModal(false)}>Tutup</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (!transferProof) {
                                        showToast("gagal", "Harap upload bukti transfer");
                                        return;
                                    }

                                    console.log("Bukti transfer: ", transferProof);
                                    showToast("berhasil", "Bukti transfer telah diupload!");
                                    setTimerModal(false);
                                }}
                            >
                                Submit Bukti Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Table;