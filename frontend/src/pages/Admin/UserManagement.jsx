

import "./UserManagement.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api"; 

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate(); 
    const getUsers = async () => {
        try {
            const res = await API.get(`/admin/users`); 
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
            await API.patch(`/admin/block-user/${id}`);
            getUsers();
        } catch (error) {
            console.log(error);
        }
    };
    const unblockUser = async (id) => {
        try {
            await API.patch(`/admin/unblock-user/${id}`);
            getUsers();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="container user-management-page">
            <h1 className="user-management-heading">User Management</h1>
            <table className="table user-management-table">
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
                                    <span className={`badge ${user.valid ? 'badge-accepted' : 'badge-cancelled'}`}>
                                        {user.valid ? "Active" : "Blocked"}
                                    </span>
                                </td>
                                <td>
                                    {
                                        user.valid
                                            ?
                                            <button
                                                className="button danger-button user-action-btn"
                                                onClick={() => blockUser(user._id)}
                                            >
                                                Block
                                            </button>
                                            :
                                            <button
                                                className="button secondary-button user-action-btn"
                                                onClick={() => unblockUser(user._id)}
                                            >
                                                Unblock
                                            </button>
                                    }
                                </td>
                                <td>
                                    <button
                                        className="button primary-button user-edit-btn"
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