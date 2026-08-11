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
            <nav className="navbar main-navbar">
                <div className="navbar-container">
                    <h2 className="navbar-brand">🌱 FWRP</h2>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar main-navbar">
            <div className="navbar-container">

                <h2 className="navbar-brand" onClick={() => navigate("/")}>
                    🌱 FWRP
                </h2>

                <div 
                    className="navbar-toggle" 
                    onClick={changeMenu} 
                    aria-label="Toggle navigation menu"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') changeMenu(); }}
                > 
                    {menuOpen ? "✕" : "☰"} 
                </div>

                <div className={`navbar-links-wrapper ${menuOpen ? "active" : ""}`}>
                    
                    <div className="navbar-links">
                        <NavLink className="nav-link navbar-link" to="/" onClick={changeMenu}>
                            Home
                        </NavLink>

                        {user && (
                            <>
                                {/* Restaurant */}
                                {user.role === "restaurant" && (
                                    <>
                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/restaurant/add-donation">
                                            Add Donation
                                        </NavLink>

                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/restaurant/my-donation">
                                            My Donations
                                        </NavLink>
                                    </>
                                )}

                                {/* NGO */}
                                {user.role === "ngo" && (
                                    <>
                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/ngo/available-donations">
                                            Available Donations
                                        </NavLink>

                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/ngo/accepted-donations">
                                            Accepted Donations
                                        </NavLink>
                                    </>
                                )}

                                {/* Admin */}
                                {user.role === "admin" && (
                                    <>
                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/admin/all-donations">
                                            Donations
                                        </NavLink>

                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/admin/user-management">
                                            Users
                                        </NavLink>

                                        <NavLink onClick={changeMenu} className="nav-link navbar-link" to="/admin/analytics">
                                            Analytics
                                        </NavLink>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="navbar-actions">
                        {user ? (
                            <div className="navbar-user-section">
                                <div className="navbar-user-info">
                                    <span className="navbar-user-avatar">👤</span>
                                    <div className="navbar-user-details">
                                        <span className="navbar-user-name">
                                            {user.name || user.username || "User"}
                                        </span>
                                        <span className="navbar-user-role">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    className="button secondary-button navbar-logout-btn" 
                                    onClick={handleLogout}
                                > 
                                    Logout 
                                </button>
                            </div>
                        ) : (
                            <div className="navbar-auth-buttons">
                                <NavLink 
                                    onClick={changeMenu} 
                                    className="nav-link navbar-link navbar-login-link" 
                                    to="/login"
                                >
                                    Login
                                </NavLink>

                                <button 
                                    onClick={() => { changeMenu(); navigate("/signup"); }} 
                                    className="button primary-button navbar-signup-btn"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </nav>
    );
}

export default Navbar;