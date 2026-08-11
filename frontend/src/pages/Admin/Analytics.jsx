import "./Analytics.css";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api"; 

export default function Analytics(){

    const [analytics,setAnalytics]=useState({});

    const getAnalytics=async()=>{

        try{
            const res = await API.get("/admin/analytics"); 
            
            setAnalytics(res.data.analytics);

        }catch(error){

            console.log(error);

        }

    };

    useEffect(()=>{

        getAnalytics();

    },[]);

    return(

        <div className="container analytics-page">

            <h1 className="analytics-heading">Analytics Dashboard</h1>

            <div className="analytics-grid">

                <div className="card analytics-card">
                    <h3>Total Users</h3>
                    <p>{analytics.totalUsers}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Restaurants</h3>
                    <p>{analytics.totalRestaurants}</p>
                </div>

                <div className="card analytics-card">
                    <h3>NGOs</h3>
                    <p>{analytics.totalNGOs}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Total Donations</h3>
                    <p>{analytics.totalDonations}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Pending</h3>
                    <p>{analytics.pending}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Accepted</h3>
                    <p>{analytics.accepted}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Delivered</h3>
                    <p>{analytics.delivered}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Cancelled</h3>
                    <p>{analytics.cancelled}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Today's Donations</h3>
                    <p>{analytics.dailyDonations}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Last 7 Days</h3>
                    <p>{analytics.weeklyDonations}</p>
                </div>

                <div className="card analytics-card">
                    <h3>Last 30 Days</h3>
                    <p>{analytics.monthlyDonations}</p>
                </div>

            </div>

        </div>

    );

}