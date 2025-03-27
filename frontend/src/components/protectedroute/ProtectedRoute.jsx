import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    console.log(currentUser);
    console.log(children);

    if (!currentUser) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;