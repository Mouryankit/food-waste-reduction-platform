
import "./EditUser.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MapComponent from "../Map/Map.jsx";
import API from "../../api.js"; 

export default function EditUser() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState({
        name: "",
        email: "",
        role: ""
    });
    const [location, setLocation] = useState(null);

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {

        try {
            const res = await API.get(`/admin/user/${id}`); 

            if (res?.data?.user) {
                setUser(res.data.user);
                setLocation(res.data.user.location || null);
            }

        } catch (error) {
            console.log(error);
            alert("Failed to load user.");
        }

    };

    const updateUser = async () => {

        try {
            const res = await API.put(`/admin/user/${id}`, {
                name: user.name,
                email: user.email,
                role: user.role,
                location: location
            }); 

            alert(res.data.message);

            navigate("/admin/user-management");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to update user."
            );

        }

    };

    return (

        <div className="container edit-user-page">

            <div className="form edit-user-form">
                <h1 style={{ textAlign: "center", marginBottom: "25px", color: "#333", fontSize: "30px" }}>Edit User</h1>

                <label htmlFor="userName">Name</label>

                <input
                    id="userName"
                    type="text"
                    value={user.name}
                    className="input edit-user-input"
                    onChange={(e) =>
                        setUser({
                            ...user,
                            name: e.target.value
                        })
                    }
                />

                <label htmlFor="userEmail">Email</label>

                <input
                    id="userEmail"
                    type="email"
                    value={user.email}
                    className="input edit-user-input"
                    onChange={(e) =>
                        setUser({
                            ...user,
                            email: e.target.value
                        })
                    }
                />

                <label htmlFor="userRole">Role</label>

                <select
                    id="userRole"
                    value={user.role}
                    className="input edit-user-select"
                    onChange={(e) =>
                        setUser({
                            ...user,
                            role: e.target.value
                        })
                    }
                >
                    <option value="restaurant">
                        Restaurant
                    </option>

                    <option value="ngo">
                        NGO
                    </option>

                    <option value="admin">
                        Admin
                    </option>

                </select>

                <span style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text-title)", textAlign: "left", marginTop: "15px" }}>Location Coordinates</span>
                <MapComponent
                    height="300px"
                    width="100%"
                    location={location}
                    setLocation={setLocation}
                />
                {location && (
                    <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                        <p><strong>Latitude:</strong> {location.latitude}</p>
                        <p><strong>Longitude:</strong> {location.longitude}</p>
                    </div>
                )}

                <button
                    type="button"
                    className="button primary-button edit-user-submit-btn"
                    onClick={updateUser}
                >
                    Update User
                </button>

            </div>

        </div>

    );

}

