

import "./EditUser.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditUser() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState({
        name: "",
        email: "",
        role: ""
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {

        try {

            const res = await axios.get(
                `http://localhost:8080/admin/user/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res?.data?.user) {
                setUser(res.data.user);
            }

        } catch (error) {
            console.log(error);
            alert("Failed to load user.");
        }

    };

    const updateUser = async () => {

        try {

            const res = await axios.put(
                `http://localhost:8080/admin/user/${id}`,
                {
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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

        <div className="edit-user">

            <div className="edit-user-form">

                <label>Name</label>

                <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                        setUser({
                            ...user,
                            name: e.target.value
                        })
                    }
                />

                <label>Email</label>

                <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                        setUser({
                            ...user,
                            email: e.target.value
                        })
                    }
                />

                <label>Role</label>

                <select
                    value={user.role}
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

                <button
                    onClick={updateUser}
                >
                    Update User
                </button>

            </div>

        </div>

    );

}