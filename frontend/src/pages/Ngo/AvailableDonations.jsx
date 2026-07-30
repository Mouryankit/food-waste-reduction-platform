import "./AvailableDonations.css"; 
import { useState, useEffect } from "react";
import axios from "axios";

// export default function(){
//     return (
//         <div className="available-donations">
//             <h1>Available Donation page</h1>
//         </div>
//     )
// }


const getAllDonations = async function ({ setDonation }) {
    const url = "http://localhost:8080/ngo";
    const token = localStorage.getItem("token");
    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // console.log(result); 
        console.log(res.data.result);
        if (res?.data?.result) {
            setDonation(res.data.result);
        }
    }
    catch(err){
        alert("some error occured");
    }
   
};

export default function () {
    const [donations, setDonation] = useState([]);
    useEffect(() => {
        getAllDonations({ setDonation });
    }, []);

    return (
        <div className="my-donation-page">
            <h1 className="my-donation-heading">My Donation Page</h1>
            <div className="donations">
                {donations.map((donation, idx) => {
                    return (
                        <div key={idx} className="donation-box">
                            <div className="donation-box-headings">
                                <h2>{donation.foodName}</h2>
                            </div>

                            <div className="donation-box-quantity">
                                <p><strong>Quantity:</strong> {donation.quantity} {donation.unit}</p>
                            </div>

                            <div className="donation-box-phone">
                                <p><strong>Mobile No:</strong> {donation.phone}</p>
                            </div>

                            <div className="donation-box-description">
                                <p><strong>Description:</strong></p>
                                <p>{donation.description}</p>
                            </div>

                            <div className="donation-box-pickup-address">
                                <p><strong>Pickup Address:</strong></p>
                                <p>{donation.pickupAddress}</p>
                            </div>

                            <div className="donation-box-pickup-address">
                                <p><strong>Delivery Status</strong></p>
                                <p>{donation.deliveryStatus}</p>
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
                        </div>
                    )
                })}
            </div>
        </div>

    );
}

