import './SalesOrderPrintPreview.css'
import { useRef } from "react";

const SalesOrderPrintPreview = ({ isOpen, onClose, data }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload untuk kembalikan React state
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-print">
        <div className="modal-header">
          <h2>Preview Cetak</h2>
          <button onClick={onClose}>Tutup</button>
        </div>

        <div ref={printRef} className="print-content">
          <h3>Data Kurir</h3>
          <p>Nama: {data.name}</p>
          <p>No. Telpon: {data.phone}</p>
          <p>Status: {data.isActive ? "Aktif" : "Tidak Aktif"}</p>
          <p>Tanggal Dibuat: {data.createdAt?.toDate().toLocaleString()}</p>
        </div>

        <div className="modal-footer">
          <button onClick={handlePrint}>Cetak</button>
        </div>
      </div>
    </div>
  );
};


export default SalesOrderPrintPreview;