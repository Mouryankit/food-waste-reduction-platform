import "./AvailableDonations.css"; 
import { useState, useEffect } from "react";
import axios from "axios";

const getAllDonations = async function ({ setDonation }) {
    const url = "http://localhost:8080/ngo";
    const token = localStorage.getItem("token");
    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (res?.data?.result) {
            setDonation(res.data.result);
        }
    }
    catch(err){
        alert("some error occured");
    }
};

const handleAcceptDonation = async ( donationId, setIsAccept, setDonation ) => {
    const url = "http://localhost:8080/ngo/accept-donation";
    const token = localStorage.getItem("token");
    try{
        const res = await axios.post(url, {"donationId": donationId} , {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if(res?.data?.message){
            alert(res.data.message); 
            await getAllDonations({setDonation}); 
        }
    }
    catch(err){
        console.log(err.message); 
        alert("Error : " + err.message); 
    }
    setIsAccept('');
}



export default function () {
    const [donations, setDonation] = useState([]);
    const [isAccept, setIsAccept] = useState(""); 

    useEffect(() => {
        getAllDonations({ setDonation });
    }, []);

    return (
        <div className="donation-page">
            <h1 className="donation-page-heading">All Availbale Donation</h1>
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
                            
                            <div className="donation-box-status">
                                <strong>Status:</strong> {donation.valid ? "Active" : "Blocked"}
                            </div>

                            <button onClick={() => {setIsAccept(donation._id); handleAcceptDonation(donation._id, setIsAccept, setDonation)}}>
                                {isAccept == donation._id ? "processing..." : "Accept Donation"}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}