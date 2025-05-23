import ContentHeader from "../../../components/content_header/ContentHeader";
import ImagePath from "../../../Utils/Constants/ImagePath";
import "./SignUp.css";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import React from "react";

const SignUp = () => {
    return (
        <div className="signin-container">
            <div className="signin-content">
                <div className="signin-left">
                    <img src={ImagePath.logoRIKO} className="signin-image" alt="RIKO Parts Logo" />
                    <div className="signin-image-title">RIKO Motorcycle Parts</div>
                </div>

                <div className="signin-right">
                    <ContentHeader title={"Sign Up"} />
                    <div className="signin-subtitle">RIKO Parts Manajemen Stok</div>

                    <form>
                        {/* Username Input */}
                        <div className="input-group">
                            <label>Username:</label>
                            <div className="input-wrapper">
                                <User className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="input-group">
                            <label>Email:</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="input-group">
                            <label>Password:</label>
                            <div className="input-wrapper">
                                <LockKeyhole className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Password"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 2.8rem" }}
                                />
                                <span className="toggle-password">
                                    <EyeOff />
                                </span>
                            </div>
                        </div>

                        {/* Role Dropdown */}
                        <div className="input-group">
                            <label>Role:</label>
                            <div className="input-wrapper">
                                <select className="signin-input" style={{ padding: "0.75rem 1rem" }}>
                                    <option value="">Pilih Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="CSO">CSO</option>
                                    <option value="Stok Controller">Stok Controller</option>
                                    <option value="Logistic">Logistic</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="signin-button">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
