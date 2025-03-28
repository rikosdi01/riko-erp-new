import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import CategoriesRepository from '../../repository/warehouse/CategoriesRepository';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = CategoriesRepository.getCategories((fetchedCategories) => {
            setCategories(fetchedCategories);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, isLoading }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => useContext(CategoryContext);