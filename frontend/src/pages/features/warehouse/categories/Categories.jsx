import { useState } from 'react';
import { ALGOLIA_INDEX_CATEGORIES, clientCategories } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import CategoriesRepository from '../../../../repository/warehouse/CategoriesRepository';
import './Categories.css';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../../context/auth/UsersContext';
import roleAccess from '../../../../utils/helper/roleAccess';

const Categories = () => {
    // Hooks
    const navigate = useNavigate();
    const { accessList } = useUsers();


    // ================================================================================


    // Variables
    // Columns for the table
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
        { header: "Nama Kategori", accessor: "name" },
        { header: "Bagian Kategori", accessor: "part" },
        { header: "Merek", accessor: "merks.name" },
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateCategories = () => {
        navigate('/inventory/categories/new');
    }

    return (
        <CustomAlgoliaContainer
            pageLabel="Kategori"
            searchClient={clientCategories}
            indexName={ALGOLIA_INDEX_CATEGORIES}
            columns={columns}
            createOnclick={navigateToCreateCategories}
            subscribeFn={CategoriesRepository.subscribeToCategoriesChanges}
            enableDropdown={true}
            dropdownAttribute={"merks.name"}
            enableDropdown2={true}
            dropdownAttribute2={"part"}
            enableExport={false}
            enableImport={false}
            canEdit={roleAccess(accessList, 'mengedit-data-kategori')}
            canAdd={roleAccess(accessList, 'menambah-data-kategori')}
        />
    )
}

export default Categories;