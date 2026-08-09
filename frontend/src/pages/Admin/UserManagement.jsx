

import "./UserManagement.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate(); 
    const token = localStorage.getItem("token");
    const getUsers = async () => {
        try {
            const url = "http://localhost:8080/admin/users";
            const res = await axios.get(
                url,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setUsers(res.data.users);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        getUsers();
    }, []);
    const blockUser = async (id) => {
        try {
            await axios.patch(
                `http://localhost:8080/admin/block-user/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            getUsers();
        } catch (error) {
            console.log(error);
        }
    };
    const unblockUser = async (id) => {
        try {
            await axios.patch(
                `http://localhost:8080/admin/unblock-user/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            getUsers();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="user-management">
            <h1>User Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    {
                                        user.valid
                                            ? "Active"
                                            : "Blocked"
                                    }
                                </td>
                                <td>
                                    {
                                        user.valid
                                            ?
                                            <button
                                                onClick={() => blockUser(user._id)}
                                            >
                                                Block
                                            </button>
                                            :
                                            <button
                                                onClick={() => unblockUser(user._id)}
                                            >
                                                Unblock
                                            </button>
                                    }
                                </td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}