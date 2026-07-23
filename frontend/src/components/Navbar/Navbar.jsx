import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./Navbar.css"; 




function Navbar(){
    const navigate = useNavigate(); 
    const token = localStorage.getItem('token'); 
    useEffect(() => {
        if(!token || token == "null" || token == "undefined") return;
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            navigate("/login"); // Redirect to login page
        } else {
            console.log("Token is valid");
        }
    }, [token]); 

    const handleLogout = (event) => {
        event.preventDefault(); 
        localStorage.removeItem('token');
        // console.log("logout succesefull");
        alert("logout succeseful"); 
        navigate("/login"); 
    }

    return(
        <div className="navbar">
            
            {token ? 
                <>
                <NavLink className="navlink" to="/login">Login</NavLink>
                <button className="navlink" onClick={handleLogout}>Logout</button>
                </>
            : 
                <>
                <NavLink className="navlink" to="/">Home</NavLink>
                <NavLink className="navlink" to="/login">Login</NavLink>
                <NavLink className="navlink" to="/signup">Signup</NavLink>
                </>
            }
        </div>
    )
}

export default Navbar;