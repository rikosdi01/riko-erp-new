import { useParams } from 'react-router-dom';
import SalesOrderRepository from '../../../../../../repository/sales/SalesOrderRepository';
import './DeliveryOrderPrintPreview.css'
import { useEffect, useRef } from "react";

const DeliveryOrderPrintPreview = ({ isOpen, onClose, data }) => {
  const { id } = useParams();
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // HAPUS dari sini
  };

  useEffect(() => {
    console.log('Functions Run...');
    const handleAfterPrint = async () => {
      console.log('Is Print...');
      await SalesOrderRepository.updateValueAfterPrint(id);
      // window.location.reload(); // pindahkan reload ke sini
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [data.id]);


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
          <p>Nama: {data.customer?.name}</p>
          <p>No. Telpon: {data.phone}</p>
          <p>Status: {data.isActive ? "Aktif" : "Tidak Aktif"}</p>
        </div>


        <div className="modal-footer">
          <button onClick={handlePrint}>Cetak</button>
        </div>
      </div>
    </div>
  );
};


export default DeliveryOrderPrintPreview;