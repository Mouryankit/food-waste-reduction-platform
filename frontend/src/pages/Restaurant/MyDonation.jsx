import "./MyDonation.css";
import { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const getDonations = async function ({ setDonation }) {
    try {
        const res = await API.get("/restaurant");
        if (res?.data?.result) {
            setDonation(res.data.result);
        }
    } catch (error) {
        console.log(error);
    }
};

export default function MyDonation() {
    const navigate = useNavigate();
    const [donations, setDonation] = useState([]);
    // Filter state
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        getDonations({ setDonation });
    }, []);

    const deleteDonation = async (id) => {
        try {
            const result = await API.delete(`/restaurant/${id}`);
            alert(result.data.message);
            setDonation((prev) =>
                prev.filter((item) => item._id !== id)
            );

        } catch (error) {
            console.log(error);
            alert("Failed to delete donation");
        }
    };

    // Filter donations based on status
    const filteredDonations = statusFilter === "all" ? donations : donations.filter(
        (donation) =>
            donation.deliveryStatus === statusFilter
    );

    return (
        <div className="container my-donation-page">
            <h1 className="my-donation-heading">
                My Donation Page
            </h1>
            {/* Status Filter */}
            <div className="filter-container my-donation-filter">
                <label htmlFor="status">
                    Filter by Status:
                </label>
                <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            <div className="donations-grid my-donations-grid">
                {filteredDonations.length === 0 ? (
                    <p className="no-donations">
                        No donations found.
                    </p>
                ) : (
                    filteredDonations.map((donation) => {
                        return (
                            <div
                                key={donation._id}
                                className="card donation-card my-donation-card"
                            >
                                <div className="donation-card-heading my-donation-card-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span className={`badge badge-${donation.deliveryStatus.toLowerCase()}`}>{donation.deliveryStatus}</span>
                                </div>

                                <div className="donation-card-section">
                                    <p>
                                        <strong>Quantity:</strong>{" "}
                                        {donation.quantity} {donation.unit}
                                    </p>
                                </div>

                                <div className="donation-card-section">
                                    <p><strong>Mobile No:</strong></p>
                                    <p>{donation.phone}</p>
                                </div>

                                <div className="donation-card-section">
                                    <p><strong>Description:</strong></p>
                                    <p>{donation.description}</p>
                                </div>

                                <div className="donation-card-section">
                                    <p><strong>Pickup Address:</strong></p>
                                    <p>{donation.pickupAddress}</p>
                                </div>

                                <div className="donation-card-section">
                                    <p><strong>Accepted By:</strong></p>
                                    <p>{donation.ngoObjectId ? donation.ngoObjectId.name : "Not Accepted"}</p>
                                </div>

                                <div className="donation-card-section">
                                    <p><strong>Expired at:</strong></p>

                                    <p>
                                        {new Date(
                                            donation.expiryDate
                                        ).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div className="donation-card-section">
                                    <p><strong>Donated at:</strong></p>

                                    <p>
                                        {new Date(
                                            donation.createdAt
                                        ).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true
                                        })}
                                    </p>
                                </div>

                                <div style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
                                    <button
                                        className="button primary-button my-donation-edit-btn"
                                        onClick={() => {
                                            navigate(
                                                `/restaurant/edit-donation/${donation._id}`
                                            );
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="button danger-button my-donation-delete-btn"
                                        onClick={() =>
                                            deleteDonation(donation._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}