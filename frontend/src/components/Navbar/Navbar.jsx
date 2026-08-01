import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./Navbar.css"; 



function Navbar(){
    const navigate = useNavigate(); 
    const [role, setRole] = useState(""); 
    // const [token, setToken] = useState(localStorage.getItem('token')); 
    const token = localStorage.getItem('token'); 
    useEffect(() => {
        if(!token || token == "null" || token == "undefined") return;
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
        alert("logout succeseful"); 
        navigate("/login"); 
    }

    return(
        <div className="navbar">
            <NavLink className="navlink" to="/">Home</NavLink>
            {token ? 
                <>
                {/* <NavLink className="navlink" to="/">Home</NavLink> */}
                {role === "restaurant" && (
                    <>
                    <NavLink className="navlink" to="/restaurant/add-donation">Add Donation</NavLink>
                    <NavLink className="navlink" to="/restaurant/my-donation">My Donation</NavLink>
                    </>
                )}
                
                {role === "ngo" && (
                    <>
                    <NavLink className="navlink" to="/ngo/available-donations">Available Donations</NavLink>
                    <NavLink className="navlink" to="/ngo/accepted-donations">Accepted Donations</NavLink>
                    </>
                )}
                {role === "admin" && (
                    <>
                    <NavLink className="navlink" to="/ngo/all-donations">Donations</NavLink>
                    <NavLink className="navlink" to="/ngo/analytics">Analytics</NavLink>
                    <NavLink className="navlink" to="/ngo/user-management">User Management</NavLink>
                    </>
                )}
                <NavLink className="navlink" onClick={handleLogout}>Logout</NavLink>
                </>
            : 
                <>
                {/* <NavLink className="navlink" to="/">Home</NavLink> */}
                <NavLink className="navlink" to="/login">Login</NavLink>
                <NavLink className="navlink" to="/signup">Signup</NavLink>
                </>
            }
            
        </div>
    )
}

export default Navbar;