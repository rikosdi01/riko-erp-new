import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Table.css";
import AccessAlertModal from "../modal/access_alert_modal/AccessAlertModal";

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
    setSelectedValue
}) => {
    // Hooks
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

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    return (
        <div className={!isAlgoliaTable ? 'table-wrapper' : ''} ref={tableRef}>
            <table>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>
                                <div className="table-header">
                                    {col.header}
                                    <button
                                        className="filter-btn"
                                        onClick={() => onFilterClick(col.accessor)}
                                    >
                                        {/* <Filter size={16} /> */}
                                    </button>
                                </div>
                            </th>
                        ))}
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

            {/* Pagination */}
            {!isAlgoliaTable && (
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
            )}

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    );
};

export default Table;
