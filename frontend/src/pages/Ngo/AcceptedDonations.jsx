import "./AcceptedDonations.css"; 
import { useState } from "react";
import Accepted from "./AcceptedDonations/Accepted.jsx"; 
import Delivered from "./AcceptedDonations/Delivered.jsx"; 

export default function(){
    const [activeTab, setActiveTab] = useState("accepted"); 
    const onClickAccepted = () => {
        setActiveTab("accepted"); 
    }
    const onClickDelivered = () => {
        setActiveTab("delivered")
    }
    return (
        <div className="accepted-donations">
            <h1 className="accepted-donations-heading">Donation History</h1>
            <div className="active-tab">
                <button className="accepted" onClick={onClickAccepted}>Accepted</button>
                <button className="delivered" onClick={onClickDelivered}>Delivered</button>
            </div>
            <div>
                {activeTab === "accepted" ? <Accepted/> : <Delivered/>}
            </div>
        </div>
    )
}
