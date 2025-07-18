import { createContext, useContext, useEffect, useState } from 'react';
import UserRepository from '../../repository/authentication/UserRepository';
import { AuthContext } from '../AuthContext';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);

    const [loginUser, setLoginUser] = useState(null);
    const [accessList, setAccessList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLoginUser = async () => {
            if (currentUser) {
                try {
                    const user = await UserRepository.getUserByUID(currentUser.uid);
                    setLoginUser(user);

                    // 🔑 Ambil data role-nya
                    const roleSnap = await UserRepository.getRoleAccess(user.role); // kamu perlu method ini
                    if (roleSnap.exists()) {
                        const data = roleSnap.data();
                        setAccessList(data.accessData || []);
                    }
                } catch (error) {
                    console.error("Error fetching login user/access: ", error);
                }
            }
            setIsLoading(false);
        };

        fetchLoginUser();
    }, [currentUser]);

    return (
        <UsersContext.Provider value={{ loginUser, accessList, isLoading }}>
            {children}
        </UsersContext.Provider>
    );
};


export const useUsers = () => useContext(UsersContext);
