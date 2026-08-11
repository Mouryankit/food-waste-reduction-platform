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
                <h2 className="logo">FWRP</h2>
            </nav>
        );
    }

    return (
        <nav className="navbar">

            <h2 className="logo">FWRP</h2>

            <div className="hamburger" onClick={changeMenu}> &#9776; </div>

            <div className={`nav-links ${menuOpen ? "active" : ""}`}>

                <NavLink className="navlink" to="/" onClick={changeMenu}>Home</NavLink>

                {user ? (
                    <>
                        {/* Restaurant */}
                        {user.role === "restaurant" && (
                            <>
                                <NavLink onClick={changeMenu} className="navlink" to="/restaurant/add-donation">
                                    Add Donation
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navlink" to="/restaurant/my-donation">
                                    My Donations
                                </NavLink>
                            </>
                        )}

                        {/* NGO */}
                        {user.role === "ngo" && (
                            <>
                                <NavLink onClick={changeMenu} className="navlink" to="/ngo/available-donations">
                                    Available Donations
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navlink" to="/ngo/accepted-donations">
                                    Accepted Donations
                                </NavLink>
                            </>
                        )}

                        {/* Admin */}
                        {user.role === "admin" && (
                            <>
                                <NavLink onClick={changeMenu} className="navlink" to="/admin/all-donations">
                                    Donations
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navlink" to="/admin/user-management">
                                    Users
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navlink" to="/admin/analytics">
                                    Analytics
                                </NavLink>
                            </>
                        )}

                        <NavLink className="navlink" onClick={handleLogout}> Logout </NavLink>

                    </>
                ) : (
                    <>
                        <NavLink onClick={changeMenu} className="navlink" to="/login">Login</NavLink>

                        <NavLink onClick={changeMenu} className="navlink" to="/signup">Signup</NavLink>
                    </>
                )}

            </div>
        </nav>
    );
}

export default Navbar;