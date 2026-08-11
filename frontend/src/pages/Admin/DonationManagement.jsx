
import "./DonationManagement.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api";

export default function DonationManagement() {

    const navigate = useNavigate();

    const [donations, setDonations] = useState([]);

    const [status, setStatus] = useState("");

    const getDonations = async () => {

        try {
            let url = "/admin/donations";
            if (status !== "") {
                url += `?status=${status}`;
            }

            const res = await API.get(url);

            setDonations(res.data.donations);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        getDonations();

    }, [status]);

    const updateStatus = async (id, value) => {

        try {
            await API.patch(`/admin/donation-status/${id}`, {deliveryStatus: value}); 

            getDonations();

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="container admin-donations-page">

            <header className="admin-page-header">
                <h1 className="admin-donations-heading">Donation Management</h1>
                <p className="admin-page-subtitle">
                    Track, verify, and update status of all platform donations.
                </p>
            </header>

            <div className="filter-container admin-donations-filters">

                <label htmlFor="status-select">Status : </label>

                <select
                    id="status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >

                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>

                </select>

            </div>

            <table className="table admin-donations-table">

                <thead>

                    <tr>

                        <th>Food</th>
                        <th>Quantity</th>
                        <th>Restaurant</th>
                        <th>NGO</th>
                        <th>Status</th>
                        <th>Expiry</th>
                        <th>Edit</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        donations.map((donation) => (

                            <tr key={donation._id}>

                                <td>{donation.foodName}</td>

                                <td>
                                    {donation.quantity} {donation.unit}
                                </td>

                                <td>

                                    {
                                        donation.userObjectId?.name
                                    }

                                </td>

                                <td>

                                    {
                                        donation.ngoObjectId
                                            ?
                                            donation.ngoObjectId.name
                                            :
                                            "Not Accepted"
                                    }

                                </td>

                                <td>

                                    <select

                                        value={donation.deliveryStatus}

                                        onChange={(e) =>
                                            updateStatus(
                                                donation._id,
                                                e.target.value
                                            )
                                        }

                                    >

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="accepted">
                                            Accepted
                                        </option>

                                        <option value="delivered">
                                            Delivered
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>

                                    </select>

                                </td>

                                <td>

                                    {

                                        new Date(
                                            donation.expiryDate
                                        ).toLocaleDateString()

                                    }

                                </td>
                                <td>
                                    <button
                                        className="button primary-button admin-donations-edit-btn"
                                        onClick={() => navigate(`/admin/edit-donation/${donation._id}`)}
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