



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
            {donations.length === 0 ? (
                <div className="card delivered-donations-empty">
                    <span>📦</span>
                    <h3>No delivered donations</h3>
                    <p>You haven't completed any food deliveries yet.</p>
                </div>
            ) : (
                <div className="donations-grid delivered-donations-grid">
                    {donations.map((donation, idx) => {
                        return (
                            <div key={idx} className="card donation-card delivered-donation-card">
                                <div className="donation-card-heading delivered-donation-card-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span className={`badge badge-${donation.deliveryStatus.toLowerCase()}`}>{donation.deliveryStatus}</span>
                                </div>

                                <div className="donation-card-body">
                                    {/* Prominent Quantity Display */}
                                    <div className="delivered-donation-qty">
                                        <span>🍱</span>
                                        <span>{donation.quantity} {donation.unit}</span>
                                    </div>

                                    <div className="donation-card-section">
                                        <p><strong>📍 Pickup Address</strong></p>
                                        <p className="section-text-value">{donation.pickupAddress}</p>
                                    </div>

                                    {donation.description && (
                                        <div className="donation-card-section">
                                            <p><strong>📝 Description</strong></p>
                                            <p className="section-text-value description-text">{donation.description}</p>
                                        </div>
                                    )}

                                    <div className="donation-card-section">
                                        <p><strong>📞 Contact</strong></p>
                                        <p className="section-text-value">{donation.phone}</p>
                                    </div>

                                    <div className="donation-card-section timestamp-section">
                                        <p><strong>📅 Donated at</strong></p>
                                        <p className="section-text-value">
                                            {new Date(donation.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
