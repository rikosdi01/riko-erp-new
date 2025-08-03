import { ALGOLIA_INDEX_ADJUSTMENT, clientAdjustment } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import './Adjustment.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';
import Formatting from '../../../../utils/format/Formatting';
import AdjustmentRepository from '../../../../repository/warehouse/AdjustmentRepository';

const Adjustment = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
    const columns = [
        { header: "Kode Penyesuaian", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDateByTimestamp(value)
        },
        { header: "Deskripsi", accessor: "description" },
    ]

    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateAdjustment = () => {
        navigate('/inventory/adjustment/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Penyesuaian"
            searchClient={clientAdjustment}
            indexName={ALGOLIA_INDEX_ADJUSTMENT}
            columns={columns}
            createOnclick={navigateToCreateAdjustment}
            subscribeFn={AdjustmentRepository.subscribeToAdjustmentChanges}
            enableExport={false}
            enableImport={false}
            canEdit={roleAccess(accessList, 'mengedit-data-penyesuaian-pesanan')}
            canAdd={roleAccess(accessList, 'menambah-data-penyesuaian-pesanan')}
        />
    )
}

export default Adjustment;