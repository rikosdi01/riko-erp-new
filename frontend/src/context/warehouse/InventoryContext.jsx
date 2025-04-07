import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import InventoryRepository from '../../repository/warehouse/InventoryRepository';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = InventoryRepository.getInventory((fetchedInventory) => {
            setInventory(fetchedInventory);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <InventoryContext.Provider value={{ inventory, isLoading }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => useContext(InventoryContext);