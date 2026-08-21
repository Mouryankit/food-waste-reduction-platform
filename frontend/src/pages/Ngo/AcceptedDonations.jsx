import "./AcceptedDonations.css"; 
import { useState } from "react";
import Accepted from "./AcceptedDonations/Accepted.jsx"; 
import Delivered from "./AcceptedDonations/Delivered.jsx"; 

export default function AcceptedDonations(){
    const [activeTab, setActiveTab] = useState("accepted"); 
    const onClickAccepted = () => {
        setActiveTab("accepted"); 
    }
    const onClickDelivered = () => {
        setActiveTab("delivered")
    }
    return (
        <div className="container accepted-donations-page">
            <h1 className="accepted-donations-heading">Donation History</h1>
            <div className="ngo-tabs">
                <button type="button" className={`button ngo-tab-btn ${activeTab === "accepted" ? "active" : ""}`} onClick={onClickAccepted}>Accepted</button>
                <button type="button" className={`button ngo-tab-btn ${activeTab === "delivered" ? "active" : ""}`} onClick={onClickDelivered}>Delivered</button>
            </div>
            <div>
                {activeTab === "accepted" ? <Accepted/> : <Delivered/>}
            </div>
        </div>
    )
}
