import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./Navbar.css";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [role, setRole] = useState("");

    const token = localStorage.getItem('token');
    useEffect(() => {
        if (!token || token == "null" || token == "undefined") return;
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            navigate("/login"); // Redirect to login page
        } else {
            // console.log(decoded); 
            setRole(decoded.role);
            // console.log("Token is valid");
        }
    }, [token]);

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token');
        // console.log("logout succesefull");
        // setToken(null);
        setRole(null);
        setMenuOpen(!menuOpen);
        alert("logout succeseful");
        navigate("/login");
    }

    const changeMenu = () => setMenuOpen(!menuOpen);
    
    return (
        <nav className="navbar">
            <h2 className="logo">FWRP</h2>
            <div
                className="hamburger"
                onClick={changeMenu}
            >
                &#9776;
            </div>

            <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                <NavLink className="navlink" to="/" onClick={changeMenu}>Home</NavLink>
                {token ? (
                    <>
                        {role === "restaurant" && (
                            <>
                                <NavLink onClick={changeMenu} className="navlink" to="/restaurant/add-donation">
                                    Add Donation
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navlink" to="/restaurant/my-donation">
                                    My Donations
                                </NavLink>
                            </>
                        )}

                        {role === "ngo" && (
                            <>
                                <NavLink onClick={changeMenu} className="navlink" to="/ngo/available-donations">
                                    Available Donations
                                </NavLink>

                                <NavLink onClick={changeMenu} className="navlink" to="/ngo/accepted-donations">
                                    Accepted Donations
                                </NavLink>
                            </>
                        )}

                        {role === "admin" && (
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

                        <NavLink
                            className="navlink"
                            onClick={handleLogout}
                        >
                            Logout
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink onClick={changeMenu} className="navlink" to="/login">
                            Login
                        </NavLink>

                        <NavLink onClick={changeMenu} className="navlink" to="/signup">
                            Signup
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;