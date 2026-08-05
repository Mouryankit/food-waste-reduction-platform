import "./MyDonation.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getDonations = async function ({ setDonation }) {
    const url = "http://localhost:8080/restaurant";
    const token = localStorage.getItem("token");
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(res.data.result);
    if (res?.data?.result) {
        setDonation(res.data.result);
    }
};

export default function () {
    const navigate = useNavigate();
    const [donations, setDonation] = useState([]);

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
            setDonation((prev) => prev.filter((item) => item._id !== id));
            // Remove the deleted donation from state
            // or fetch the donations again
        } catch (error) {
            console.log(error);
            alert("Failed to delete donation");
        }
    };

    return (
        <div className="my-donation-page">
            <h1 className="my-donation-heading">My Donation Page</h1>
            <div className="donations">
                {donations.map((donation, idx) => {
                    return (
                        <div key={idx} className="donation-box">
                            <div className="donation-box-heading">
                                <h2>{donation.foodName}</h2>
                                <span>
                                    {donation.deliveryStatus}
                                </span>
                            </div>

                            <div className="donation-box-quantity">
                                <p><strong>Quantity:</strong> {donation.quantity} {donation.unit}</p>
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

                            <div className="donation-box-time">
                                <p><strong>Expired at:</strong></p>
                                <p>
                                    {new Date(donation.expiryDate).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div className="donation-box-time">
                                <p><strong>Donated at:</strong></p>
                                <p>
                                    {new Date(donation.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </p>
                            </div>

                            <div className="donation-box-status">
                                <strong>Status:</strong> {donation.valid ? "Active" : "Blocked"}
                            </div>
                            <div>
                                <button onClick={() => {
                                    navigate(`/restaurant/edit-donation/${donation._id}`);
                                }}> Edit</button>

                                <button onClick={() => deleteDonation(donation._id)}> Delete </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

    );
}
