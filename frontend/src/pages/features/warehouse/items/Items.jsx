import { useNavigate } from 'react-router-dom';
import { ALGOLIA_INDEX_ITEMS, clientItems, rackIndex } from '../../../../../config/algoliaConfig';
import CustomAlgoliaContainer from '../../../../components/customize/custom_algolia_container/CustomAlgoliaContainer';
import ItemsRepository from '../../../../repository/warehouse/ItemsRepository';
import Formatting from '../../../../utils/format/Formatting';
import './Items.css';
import roleAccess from '../../../../utils/helper/roleAccess';
import { useUsers } from '../../../../context/auth/UsersContext';
import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';

const Items = () => {
    // Hooks
    const navigate = useNavigate();
    const { loginUser, accessList } = useUsers();
    const [rack, setRack] = useState([]);

    useEffect(() => {
        const fetchRack = async () => {
            try {
                const { hits } = await rackIndex.search("", {
                    hitsPerPage: 50, // atur limit
                });
                setRack(hits);
            } catch (error) {
                console.error("Error fetching Algolia data:", error);
            }
        };

        fetchRack();
    }, []);

    useEffect(() => {
        console.log('Rack: ', rack);
    }, [rack]);

    const rackMap = rack.reduce((map, r) => {
        map[r.id] = r.name;
        return map;
    }, {});


    console.log('Access List: ', accessList);


    const columns = [
        {
            header: "Kode Item",
            accessor: "codeItemCategory",
            renderCell: (_, item) => {
                const code = item?.code ?? "";
                const categoryCode = item?.category?.code ?? "";
                return categoryCode + '-' + code;
            }
        },
        { header: "Nama Item", accessor: "name" },
        { header: "Kategori", accessor: "category.name" },
        { header: "Motor", accessor: "brand" },
        {
            header: "Stok",
            accessor: "stock",
            renderCell: (_, item) => {
                const userStock = loginUser?.location
                    ? Object.values(item?.stock?.[loginUser.location] ?? {}).reduce((a, b) => a + b, 0)
                    : 0;

                const sets = Array.isArray(item?.set) ? item.set : [];
                const unit = sets.find((s) => s?.set)?.set ?? "";

                // mapping stok per rack
                const stockByRack = item?.stock?.[loginUser?.location] ?? {};
                const stockDetails = Object.entries(stockByRack).map(([rackId, qty]) => {
                    const rackName = rackMap[rackId] || rackId;
                    return `${rackName}: ${qty} ${unit}`;
                });

                return (
                    <Tippy
                        content={
                            stockDetails.length > 0 ? (
                                <div className="tooltip-container">
                                    {stockDetails.map((detail, idx) => (
                                        <div key={idx} className="tooltip-item">
                                            {detail}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>Tidak ada stok di lokasi ini</span>
                            )
                        }
                        appendTo={document.body}
                    >
                        <span>{`${userStock} ${unit}`}</span>
                    </Tippy>

                );
            }
        },
        {
            header: "Harga Jual",
            accessor: "salePrice",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        },
        {
            header: "Stok Global",
            accessor: "stock",
            renderCell: (_, item) => {
                const stock = item.stock ?? {};

                // ambil semua angka stok dari nested object
                const totalStock = Object.values(stock).reduce((sum, val) => {
                    if (typeof val === "number") {
                        // kalau ternyata langsung angka (old data model)
                        return sum + val;
                    } else if (typeof val === "object" && val !== null) {
                        // kalau nested object (new data model)
                        return sum + Object.values(val).reduce((s, v) => s + v, 0);
                    }
                    return sum;
                }, 0);

                const sets = Array.isArray(item?.set) ? item.set : [];
                const unit = sets.find((s) => s?.set)?.set ?? "";

                return `${totalStock} ${unit}`;
            }
        }
    ]

    const adminColumns = [
        {
            header: "Kode Item",
            accessor: "codeItemCategory",
            renderCell: (_, item) => {
                const code = item?.code ?? "";
                const categoryCode = item?.category?.code ?? "";
                return categoryCode + '-' + code;
            }
        },
        { header: "Nama Item", accessor: "name" },
        { header: "Kategori", accessor: "category.name" },
        { header: "Motor", accessor: "brand" },
        {
            header: "Stok Medan",
            accessor: "stock",
            renderCell: (_, item) => {
                const userStock = 'medan'
                    ? Object.values(item?.stock?.medan ?? {}).reduce((a, b) => a + b, 0)
                    : 0;

                const sets = Array.isArray(item?.set) ? item.set : [];
                const unit = sets.find((s) => s?.set)?.set ?? "";

                // mapping stok per rack
                const stockByRack = item?.stock?.medan ?? {};
                const stockDetails = Object.entries(stockByRack).map(([rackId, qty]) => {
                    const rackName = rackMap[rackId] || rackId;
                    return `${rackName}: ${qty} ${unit}`;
                });

                return (
                    <Tippy
                        content={
                            stockDetails.length > 0 ? (
                                <div className="tooltip-container">
                                    {stockDetails.map((detail, idx) => (
                                        <div key={idx} className="tooltip-item">
                                            {detail}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>Tidak ada stok di lokasi ini</span>
                            )
                        }
                        appendTo={document.body}
                    >
                        <span>{`${userStock} ${unit}`}</span>
                    </Tippy>

                );
            }
        },
        {
            header: "Stok Jakarta",
            accessor: "stock",
            renderCell: (_, item) => {
                const userStock = 'jakarta'
                    ? Object.values(item?.stock?.jakarta ?? {}).reduce((a, b) => a + b, 0)
                    : 0;

                const sets = Array.isArray(item?.set) ? item.set : [];
                const unit = sets.find((s) => s?.set)?.set ?? "";

                // mapping stok per rack
                const stockByRack = item?.stock?.jakarta ?? {};
                const stockDetails = Object.entries(stockByRack).map(([rackId, qty]) => {
                    const rackName = rackMap[rackId] || rackId;
                    return `${rackName}: ${qty} ${unit}`;
                });

                return (
                    <Tippy
                        content={
                            stockDetails.length > 0 ? (
                                <div className="tooltip-container">
                                    {stockDetails.map((detail, idx) => (
                                        <div key={idx} className="tooltip-item">
                                            {detail}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>Tidak ada stok di lokasi ini</span>
                            )
                        }
                        appendTo={document.body}
                    >
                        <span>{`${userStock} ${unit}`}</span>
                    </Tippy>

                );
            }
        },
        {
            header: "Harga Jual",
            accessor: "salePrice",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        }
    ]


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateItems = () => {
        navigate('/inventory/items/new');
    }

    // const navigateToCreateItems = () => {
    //     window.open('/inventory/items/new', '_blank');
    // }


    return (
        <CustomAlgoliaContainer
            pageLabel="Item"
            searchClient={clientItems}
            indexName={ALGOLIA_INDEX_ITEMS}
            columns={loginUser?.location ? columns : adminColumns}
            createOnclick={navigateToCreateItems}
            subscribeFn={ItemsRepository.subscribeToItemsChanges}
            enableExport={false}
            enableImport={false}
            enableDropdown={true}
            dropdownAttribute={'category.name'}
            dropdownTitle={'Kategori'}
            enableDropdown2={true}
            dropdownAttribute2={'brand'}
            dropdownTitle2={'Motor'}
            enableDropdown3={true}
            dropdownAttribute3={'name'}
            dropdownTitle3={'Model'}
            // enableCheckbox1={true}
            // checkbox1Label="Stok Tersedia"
            // checkbox1Attribute="stock"
            canEdit={roleAccess(accessList, 'mengedit-data-item')}
            canAdd={roleAccess(accessList, 'menambah-data-item')}
        />
    )
}

export default Items;