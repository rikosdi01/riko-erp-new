import { usePagination } from "react-instantsearch";

const CustomPagination = ({ itemsPerPage, setItemsPerPage, enableItemsPerPage = true }) => {
    const {
        currentRefinement,
        nbPages,
        refine,
    } = usePagination({ padding: 2 });
    const currentPage = currentRefinement + 1; // Algolia mulai dari 0
    const totalPages = nbPages;

    return (
        <div className="pagination">
            <button onClick={() => refine(0)} disabled={currentRefinement === 0}>
                &laquo; Awal
            </button>
            <button onClick={() => refine(currentRefinement - 1)} disabled={currentRefinement === 0}>
                &lt; Prev
            </button>

            <span>Hal. {currentPage} | {totalPages}</span>

            <button onClick={() => refine(currentRefinement + 1)} disabled={currentRefinement + 1 >= totalPages}>
                Next &gt;
            </button>
            <button onClick={() => refine(totalPages - 1)} disabled={currentRefinement + 1 >= totalPages}>
                Akhir &raquo;
            </button>

            {enableItemsPerPage && (
            <div className="items-per-page">
                <select value={itemsPerPage} onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    refine(0); // kembali ke halaman awal
                }}>
                    <option value={8}>8</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span> per halaman</span>
            </div>
            )}
        </div>
    );
};

export default CustomPagination;