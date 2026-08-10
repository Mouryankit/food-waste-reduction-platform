import "./MyDonation.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getDonations = async function ({ setDonation }) {
    const url = "http://localhost:8080/restaurant";
    const token = localStorage.getItem("token");

    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(res.data.result);

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
            const result = await axios.delete(
                `http://localhost:8080/restaurant/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
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
        <div className="my-donation-page">
            <h1 className="my-donation-heading">
                My Donation Page
            </h1>
            {/* Status Filter */}
            <div className="donation-filter">
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

            <div className="donations">
                {filteredDonations.length === 0 ? (
                    <p className="no-donations">
                        No donations found.
                    </p>
                ) : (
                    filteredDonations.map((donation) => {
                        return (
                            <div
                                key={donation._id}
                                className="donation-box"
                            >
                                <div className="donation-box-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span>{donation.deliveryStatus}</span>
                                </div>

                                <div className="donation-box-quantity">
                                    <p>
                                        <strong>Quantity:</strong>{" "}
                                        {donation.quantity} {donation.unit}
                                    </p>
                                </div>

                                <div className="donation-box-phone">
                                    <p><strong>Mobile No:</strong></p>
                                    <p>{donation.phone}</p>
                                </div>

                                <div className="donation-box-description">
                                    <p><strong>Description:</strong></p>
                                    <p>{donation.description}</p>
                                </div>

                                <div className="donation-box-pickup-address">
                                    <p><strong>Pickup Address:</strong></p>
                                    <p>{donation.pickupAddress}</p>
                                </div>

                                <div className="donation-box-ngo-name">
                                    <p><strong>Accepted By:</strong></p>
                                    <p>{donation.ngoObjectId ? donation.ngoObjectId.name : "Not Accepted"}</p>
                                </div>

                                <div className="donation-box-time">
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

                                <div className="donation-box-time">
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

                                <div>
                                    <button
                                        onClick={() => {
                                            navigate(
                                                `/restaurant/edit-donation/${donation._id}`
                                            );
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
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