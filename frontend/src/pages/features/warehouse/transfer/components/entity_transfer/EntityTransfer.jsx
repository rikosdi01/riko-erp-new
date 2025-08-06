import ContentHeader from '../../../../../../components/content_header/ContentHeader';
import Formatting from '../../../../../../utils/format/Formatting';
import './EntityTransfer.css';

const EntityTransfer = ({ initialData = {} }) => {
    // Destrukturisasi data dari initialData
    const {
        code,
        soCode,
        createdAt,
        locationFrom,
        locationTo,
        items = [] // Pastikan items selalu array
    } = initialData;

    return (
        <div className='main-container'>
            <div className="transfer-detail-page">
                <ContentHeader title={'Detail Pemindahan Stok'} enablePrint={false} />

                <div className="transfer-info-grid">
                    {/* Informasi Umum Transfer */}
                    <div className="info-card">
                        <h3 className="card-title">Informasi Pemindahan</h3>
                        <div className="info-item"><strong>Kode Transfer:</strong><span>{code || '-'}</span></div>
                        <div className="info-item"><strong>Dari Pesanan No.:</strong><span>{soCode || '-'}</span></div>
                        <div className="info-item"><strong>Tanggal Pemindahan:</strong><span>{Formatting.formatDateByTimestamp(createdAt) || '-'}</span></div>
                    </div>

                    {/* Informasi Lokasi */}
                    <div className="info-card">
                        <h3 className="card-title">Lokasi</h3>

                        <div className="info-item">
                            <strong>Dari Lokasi:</strong>
                            <span>
                                {locationFrom ? locationFrom.charAt(0).toUpperCase() + locationFrom.slice(1) : '-'}
                            </span>
                        </div>

                        <div className="info-item">
                            <strong>Ke Lokasi:</strong>
                            <span>
                                {locationTo ? locationTo.charAt(0).toUpperCase() + locationTo.slice(1) : '-'}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Daftar Item yang Dipindahkan */}
                {items.length > 0 && (
                    <div className="transfer-items-card">
                        <h3 className="card-title">Daftar Item</h3>
                        <div className="table-responsive">
                            <table className="transfer-items-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Item</th>
                                        <th>Kuantitas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name || '-'}</td>
                                            <td>{item.qty || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {items.length === 0 && (
                    <div className="no-items-message">
                        Tidak ada item yang terdaftar untuk pemindahan ini.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityTransfer;