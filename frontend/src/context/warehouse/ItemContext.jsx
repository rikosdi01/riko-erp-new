import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import ItemsRepository from '../../repository/warehouse/ItemsRepository';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = ItemsRepository.getItems((fetchedItems) => {
            setItems(fetchedItems);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <ItemContext.Provider value={{ items, isLoading }}>
            {children}
        </ItemContext.Provider>
    );
};

export const useItems = () => useContext(ItemContext);