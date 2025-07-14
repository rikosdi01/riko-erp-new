import { createContext, useContext, useEffect, useState } from 'react';
import UserRepository from '../../repository/authentication/UserRepository';
import { AuthContext } from '../AuthContext';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);

    const [loginUser, setLoginUser] = useState(null); // bisa null daripada []
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLoginUser = async () => {
            if (currentUser) {
                try {
                    const user = await UserRepository.getUserByUID(currentUser.uid);
                    setLoginUser(user);
                } catch (error) {
                    console.error("Error fetching login user: ", error);
                }
            }
            setIsLoading(false); // ✅ letakkan di luar if agar tetap false meski currentUser tidak ada
        };

        fetchLoginUser();
    }, [currentUser]);

    return (
        <UsersContext.Provider value={{ loginUser, isLoading }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = () => useContext(UsersContext);
