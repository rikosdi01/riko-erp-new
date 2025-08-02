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

// Algolia Rack
const ALGOLIA_APP_ID_WAREHOUSE = import.meta.env.VITE_APP_ALGOLIA_APP_ID_WAREHOUSE;
const ALGOLIA_SEARCH_KEY_WAREHOUSE = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_WAREHOUSE;
const ALGOLIA_INDEX_WAREHOUSE = import.meta.env.VITE_APP_ALGOLIA_INDEX_WAREHOUSE;

// Client Warehouse
const clientItems = algoliasearch(ALGOLIA_APP_ID_ITEMS, ALGOLIA_SEARCH_KEY_ITEMS);
const clientCategories = algoliasearch(ALGOLIA_APP_ID_CATEGORIES, ALGOLIA_SEARCH_KEY_CATEGORIES);
const clientInventory = algoliasearch(ALGOLIA_APP_ID_INVENTORY, ALGOLIA_SEARCH_KEY_INVENTORY);
const clientRack = algoliasearch(ALGOLIA_APP_ID_WAREHOUSE, ALGOLIA_SEARCH_KEY_WAREHOUSE);

// Initialize indices
const productIndex = clientItems.initIndex(ALGOLIA_INDEX_ITEMS);
const categoryIndex = clientCategories.initIndex(ALGOLIA_INDEX_CATEGORIES);
const rackIndex = clientRack.initIndex(ALGOLIA_INDEX_WAREHOUSE);


// =========================================================================================================================


// Sales
// Algolia Customers
const ALGOLIA_APP_ID_CUSTOMERS = import.meta.env.VITE_APP_ALGOLIA_APP_ID_CUSTOMERS;
const ALGOLIA_SEARCH_KEY_CUSTOMERS = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_CUSTOMERS;
const ALGOLIA_INDEX_CUSTOMERS = import.meta.env.VITE_APP_ALGOLIA_INDEX_CUSTOMERS;

// Algolia Sales Order
const ALGOLIA_APP_ID_SO = import.meta.env.VITE_APP_ALGOLIA_APP_ID_SO;
const ALGOLIA_SEARCH_KEY_SO = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_SO;
const ALGOLIA_INDEX_SO = import.meta.env.VITE_APP_ALGOLIA_INDEX_SO;

// Algolia Delivery Order
const ALGOLIA_APP_ID_DO = import.meta.env.VITE_APP_ALGOLIA_APP_ID_DO;
const ALGOLIA_SEARCH_KEY_DO = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_DO;
const ALGOLIA_INDEX_DO = import.meta.env.VITE_APP_ALGOLIA_INDEX_DO;

// Algolia Invoice Order
const ALGOLIA_APP_ID_IO = import.meta.env.VITE_APP_ALGOLIA_APP_ID_IO;
const ALGOLIA_SEARCH_KEY_IO = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_IO;
const ALGOLIA_INDEX_IO = import.meta.env.VITE_APP_ALGOLIA_INDEX_IO;

// Client Sales
const clientCustomers = algoliasearch(ALGOLIA_APP_ID_CUSTOMERS, ALGOLIA_SEARCH_KEY_CUSTOMERS);
const clientSO = algoliasearch(ALGOLIA_APP_ID_SO, ALGOLIA_SEARCH_KEY_SO);
const clientDO = algoliasearch(ALGOLIA_APP_ID_DO, ALGOLIA_SEARCH_KEY_DO);
const clientIO = algoliasearch(ALGOLIA_APP_ID_IO, ALGOLIA_SEARCH_KEY_IO);

// Initialize indices for Sales
const customerIndex = clientCustomers.initIndex(ALGOLIA_INDEX_CUSTOMERS);
const soIndex = clientSO.initIndex(ALGOLIA_INDEX_SO);
const doIndex = clientDO.initIndex(ALGOLIA_INDEX_DO);
const ioIndex = clientIO.initIndex(ALGOLIA_INDEX_IO);


// Logistic
const ALGOLIA_APP_ID_EXPRESS = import.meta.env.VITE_APP_ALGOLIA_APP_ID_EXPRESS;
const ALGOLIA_SEARCH_KEY_EXPRESS = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_EXPRESS;
const ALGOLIA_INDEX_EXPRESS = import.meta.env.VITE_APP_ALGOLIA_INDEX_EXPRESS;

const clientExpress = algoliasearch(ALGOLIA_APP_ID_EXPRESS, ALGOLIA_SEARCH_KEY_EXPRESS);

// Initialize indices for Sales
const expressIndex = clientExpress.initIndex(ALGOLIA_INDEX_EXPRESS);


// Users
const ALGOLIA_APP_ID_USERS = import.meta.env.VITE_APP_ALGOLIA_APP_ID_USERS;
const ALGOLIA_SEARCH_KEY_USERS = import.meta.env.VITE_APP_ALGOLIA_SEARCH_KEY_USERS;
const ALGOLIA_INDEX_USERS = import.meta.env.VITE_APP_ALGOLIA_INDEX_USERS;

const clientUsers = algoliasearch(ALGOLIA_APP_ID_USERS, ALGOLIA_SEARCH_KEY_USERS);

// Initialize indices for Sales
const usersIndex = clientUsers.initIndex(ALGOLIA_INDEX_USERS);

export {
    // Warehouse
    productIndex,
    categoryIndex,
    rackIndex,
    usersIndex,
    clientItems,
    clientCategories,
    clientInventory,
    clientRack,
    clientUsers,
    ALGOLIA_INDEX_ITEMS,
    ALGOLIA_INDEX_CATEGORIES,
    ALGOLIA_INDEX_INVENTORY,
    ALGOLIA_INDEX_WAREHOUSE,
    ALGOLIA_INDEX_USERS,


    // Sales
    customerIndex,
    soIndex,
    doIndex,
    clientCustomers,
    clientSO,
    clientDO,
    clientIO,
    ALGOLIA_INDEX_CUSTOMERS,
    ALGOLIA_INDEX_SO,
    ALGOLIA_INDEX_DO,
    ALGOLIA_INDEX_IO,

    expressIndex,
    clientExpress,
    ALGOLIA_INDEX_EXPRESS
};