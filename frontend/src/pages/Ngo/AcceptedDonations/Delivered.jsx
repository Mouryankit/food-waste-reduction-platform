



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
        <div className="donation-page">
            <h1 className="donation-page-heading">Delivered Donations</h1>
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
