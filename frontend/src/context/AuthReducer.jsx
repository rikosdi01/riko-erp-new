const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            sessionStorage.setItem("currentUser", JSON.stringify(action.payload)); // Simpan user di sessionStorage
            return { currentUser: action.payload };

        case "LOGOUT":
            sessionStorage.removeItem("currentUser"); // Hapus data user saat logout
            sessionStorage.removeItem("accessToken"); // Pastikan accessToken juga dihapus
            return { currentUser: null };

        case "UPDATE_ACCESS_TOKEN":
            const updatedUser = { ...state.currentUser, accessToken: action.payload };
            sessionStorage.setItem("currentUser", JSON.stringify(updatedUser)); // Update user di sessionStorage
            return { currentUser: updatedUser };

        default:
            return state;
    }
};

export default AuthReducer;
