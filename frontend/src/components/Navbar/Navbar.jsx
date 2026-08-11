import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, setUser, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        event.preventDefault();

        try {
            await API.post("/auth/logout");

            setUser(null);
            setMenuOpen(false);

            alert("Logout successful");
            navigate("/login");

        } catch (error) {
            console.log(error);
        }
    };

    const changeMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Don't show login/logout buttons while checking authentication
    if (loading) {
        return (
            <nav className="navbar">
                <h2 className="navbar-logo">FWRP</h2>
            </nav>
        );
    }

    return (
        <nav className="navbar">

            <h2 className="navbar-logo">FWRP</h2>

            <div className="navbar-hamburger" onClick={changeMenu}> &#9776; </div>

            <div className={`navbar-links ${menuOpen ? "active" : ""}`}>

                <NavLink className="navbar-link" to="/" onClick={changeMenu}>Home</NavLink>

                {user ? (
                    <>
                        {/* Restaurant */}
                        {user.role === "restaurant" && (
                            <>
                                <NavLink onClick={changeMenu} className="navbar-link" to="/restaurant/add-donation">
                                    Add Donation
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navbar-link" to="/restaurant/my-donation">
                                    My Donations
                                </NavLink>
                            </>
                        )}

                        {/* NGO */}
                        {user.role === "ngo" && (
                            <>
                                <NavLink onClick={changeMenu} className="navbar-link" to="/ngo/available-donations">
                                    Available Donations
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navbar-link" to="/ngo/accepted-donations">
                                    Accepted Donations
                                </NavLink>
                            </>
                        )}

                        {/* Admin */}
                        {user.role === "admin" && (
                            <>
                                <NavLink onClick={changeMenu} className="navbar-link" to="/admin/all-donations">
                                    Donations
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navbar-link" to="/admin/user-management">
                                    Users
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navbar-link" to="/admin/analytics">
                                    Analytics
                                </NavLink>
                            </>
                        )}

                        <NavLink className="navbar-link" onClick={handleLogout}> Logout </NavLink>

                    </>
                ) : (
                    <>
                        <NavLink onClick={changeMenu} className="navbar-link" to="/login">Login</NavLink>

                        <NavLink onClick={changeMenu} className="navbar-link" to="/signup">Signup</NavLink>
                    </>
                )}

            </div>
        </nav>
    );
}

export default Navbar;