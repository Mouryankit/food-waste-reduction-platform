
import "./Accepted.css"; 
import { useState, useEffect } from "react";
import API from "../../../api"; 


const getAcceptedDonations = async function ({ setDonations }) {
    try {
        const res = await API.get('/ngo/accepted-donation');
        if (res?.data?.result) {
            setDonations(res.data.result);
        }
    }
    catch(err){
        console.error("Failed to fetch accepted donations:", err.message || err);
        alert("some error occured");
    }
};

const handleDelivered = async ( donationId, setIsAccept, setDonations ) => {
    try{
        const res = await API.post('/ngo/deliver-donation', {"donationId": donationId});
        if(res?.data?.message){
            alert(res.data.message);  
            await getAcceptedDonations({setDonations}); 
        }
    }
    catch(err){
        console.log(err.message); 
        alert("Error : " + err.message); 
    }
    setIsAccept('');
}


export default function Accepted() {
    const [donations, setDonations] = useState([]);
    const [isDeliver, setIsDeliver] = useState(""); 

    useEffect(() => {
        getAcceptedDonations({ setDonations });
    }, []);

    return (
        <div className="accepted-donations-list">
            {donations.length === 0 ? (
                <div className="card accepted-donations-empty">
                    <span>🤝</span>
                    <h3>No accepted donations</h3>
                    <p>You haven't accepted any donations yet.</p>
                </div>
            ) : (
                <div className="donations-grid accepted-donations-grid">
                    {donations.map((donation) => {
                        return (
                            <div key={donation._id} className="card donation-card accepted-donation-card">
                                <div className="donation-card-heading accepted-donation-card-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span className={`badge badge-${donation.deliveryStatus.toLowerCase()}`}>{donation.deliveryStatus}</span>
                                </div>

                                <div className="donation-card-body">
                                    {/* Prominent Quantity Display */}
                                    <div className="accepted-donation-qty">
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
                                
                                <button 
                                    type="button"
                                    className="button primary-button accepted-donation-deliver-btn" 
                                    disabled={isDeliver === donation._id}
                                    onClick={() => {
                                        setIsDeliver(donation._id); 
                                        handleDelivered(donation._id, setIsDeliver, setDonations);
                                    }}
                                >
                                    {isDeliver === donation._id ? "Processing..." : "Mark Delivered"}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
