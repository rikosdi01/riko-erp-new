import algoliasearch from 'algoliasearch/lite.js';

// Warehouse
// Algolia Items
const ALGOLIA_APP_ID_ITEMS = import.meta.env.VITE_APP_ALGOLIA_APP_ID_ITEMS;
const ALGOLIA_SEARCH_KEY_ITEMS = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_ITEMS;
const ALGOLIA_INDEX_ITEMS = import.meta.env.VITE_APP_ALGOLIA_INDEX_ITEMS;

// Algolia Categories
const ALGOLIA_APP_ID_CATEGORIES = import.meta.env.VITE_APP_ALGOLIA_APP_ID_CATEGORIES;
const ALGOLIA_SEARCH_KEY_CATEGORIES = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_CATEGORIES;
const ALGOLIA_INDEX_CATEGORIES = import.meta.env.VITE_APP_ALGOLIA_INDEX_CATEGORIES;

// Algolia Inventory
const ALGOLIA_APP_ID_INVENTORY = import.meta.env.VITE_APP_ALGOLIA_APP_ID_INVENTORY;
const ALGOLIA_SEARCH_KEY_INVENTORY = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_INVENTORY;
const ALGOLIA_INDEX_INVENTORY = import.meta.env.VITE_APP_ALGOLIA_INDEX_INVENTORY;

// Client Warehouse
const clientItems = algoliasearch(ALGOLIA_APP_ID_ITEMS, ALGOLIA_SEARCH_KEY_ITEMS);
const clientCategories = algoliasearch(ALGOLIA_APP_ID_CATEGORIES, ALGOLIA_SEARCH_KEY_CATEGORIES);
const clientInventory = algoliasearch(ALGOLIA_APP_ID_INVENTORY, ALGOLIA_SEARCH_KEY_INVENTORY);

// Initialize indices
const productIndex = clientItems.initIndex(ALGOLIA_INDEX_ITEMS);
const categoryIndex = clientCategories.initIndex(ALGOLIA_INDEX_CATEGORIES);



// Sales
// Algolia Customers
const ALGOLIA_APP_ID_CUSTOMERS = import.meta.env.VITE_APP_ALGOLIA_APP_ID_CUSTOMERS;
const ALGOLIA_SEARCH_KEY_CUSTOMERS = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_CUSTOMERS;
const ALGOLIA_INDEX_CUSTOMERS = import.meta.env.VITE_APP_ALGOLIA_INDEX_CUSTOMERS;

// Client Sales
const clientCustomers = algoliasearch(ALGOLIA_APP_ID_CUSTOMERS, ALGOLIA_SEARCH_KEY_CUSTOMERS);

// Initialize indices for Sales
const customerIndex = clientCustomers.initIndex(ALGOLIA_INDEX_CUSTOMERS);

export {
    // Warehouse
    productIndex,
    categoryIndex,
    clientItems,
    clientCategories,
    clientInventory,
    ALGOLIA_INDEX_ITEMS,
    ALGOLIA_INDEX_CATEGORIES,
    ALGOLIA_INDEX_INVENTORY,

    // Sales
    customerIndex,
    clientCustomers,
    ALGOLIA_INDEX_CUSTOMERS
};