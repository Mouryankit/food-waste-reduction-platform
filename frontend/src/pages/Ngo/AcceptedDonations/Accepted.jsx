
import "./Accepted.css"; 
import { useState, useEffect } from "react";
import API from "../../../api"; 


const getAcceptedDonations = async function ({ setDonation }) {
    try {
        const res = await API.get('/ngo/accepted-donation');
        if (res?.data?.result) {
            setDonation(res.data.result);
        }
    }
    catch(err){
        alert("some error occured");
    }
};

const handleDelivered = async ( donationId, setIsAccept, setDonation ) => {
    try{
        const res = await API.post('/ngo/deliver-donation', {"donationId": donationId});
        if(res?.data?.message){
            alert(res.data.message);  
            await getAcceptedDonations({setDonation}); 
        }
    }
    catch(err){
        console.log(err.message); 
        alert("Error : " + err.message); 
    }
    setIsAccept('');
}


export default function Accepted() {
    const [donations, setDonation] = useState([]);
    const [isDeliver, setIsDeliver] = useState(""); 

    useEffect(() => {
        getAcceptedDonations({ setDonation });
    }, []);

    return (
        <div className="accepted-donations-list">
            <h1 className="accepted-donations-list-heading" style={{ textAlign: "center", marginBottom: "20px" }}>Accepted Donations</h1>
            <div className="donations-grid accepted-donations-grid">
                {donations.map((donation, idx) => {
                    return (
                        <div key={idx} className="card donation-card accepted-donation-card">
                            <div className="donation-card-heading accepted-donation-card-heading">
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
                            
                            <button className="button primary-button accepted-donation-deliver-btn" style={{ width: "100%", marginTop: "15px" }} onClick={() => {setIsDeliver(donation._id); handleDelivered(donation._id, setIsDeliver, setDonation)}}>
                                {isDeliver == donation._id ? "processing..." : "Mark Delivered"}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
