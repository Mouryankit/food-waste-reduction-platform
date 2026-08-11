



import "./Delivered.css";
import { useState, useEffect } from "react";
import API from "../../../api";

const getDeliveredDonations = async function ({ setDonation }) {
    try {
        const res = await API.get('/ngo/delivered-donation');
        if (res?.data?.result) {
            setDonation(res.data.result);
        }
    }
    catch (err) {
        alert("some error occured");
    }
    console.log("working");
}


export default function Delivered() {
    const [donations, setDonation] = useState([]);

    useEffect(() => {
        getDeliveredDonations({ setDonation });
    }, []);

    return (
        <div className="delivered-donations-list">
            <h1 className="delivered-donations-list-heading" style={{ textAlign: "center", marginBottom: "20px" }}>Delivered Donations</h1>
            <div className="donations-grid delivered-donations-grid">
                {donations.map((donation, idx) => {
                    return (
                        <div key={idx} className="card donation-card delivered-donation-card">
                            <div className="donation-card-heading delivered-donation-card-heading">
                                <h2>{donation.foodName}</h2>
                                <span className={`badge badge-${donation.deliveryStatus.toLowerCase()}`}>{donation.deliveryStatus}</span>
                            </div>

                            <div className="donation-card-section">
                                <p><strong>Quantity:</strong> {donation.quantity} {donation.unit}</p>
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
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
