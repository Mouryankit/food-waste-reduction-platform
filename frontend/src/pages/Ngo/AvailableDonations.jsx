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
    } catch (err) {
        alert("some error occured");
    }
};

const handleAcceptDonation = async (
    donationId,
    setIsAccept,
    setDonation
) => {

    const url = "http://localhost:8080/ngo/accept-donation";
    const token = localStorage.getItem("token");
    try {
        const res = await axios.post(
            url,
            { donationId: donationId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (res?.data?.message) {
            alert(res.data.message);
            await getAllDonations({
                setDonation
            });
        }
    } catch (err) {
        console.log(err.message);
        alert("Error : " + err.message);
    }
    setIsAccept("");
};

// Distance calculation
// const calculateDistance = (
//     lat1,
//     lon1,
//     lat2,
//     lon2
// ) => {
//     const R = 6371; // Earth radius in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// };

export default function () {
    const [donations, setDonation] = useState([]);
    const [isAccept, setIsAccept] = useState("");
    const [searchFood, setSearchFood] = useState("");
    const [freshness, setFreshness] = useState("");
    const [distance, setDistance] = useState("");
    const [ngoLocation, setNgoLocation] = useState(null);

    // Get donations
    useEffect(() => {
        getAllDonations({
            setDonation
        });
    }, []);

    // Get NGO current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setNgoLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.log(error);
            }
        );
    }, []);

    // FILTER DONATIONS
    const filteredDonations = donations.filter((donation) => {

        // FOOD NAME SEARCH

        if (
            searchFood !== "" && !donation.foodName
                .toLowerCase()
                .includes(searchFood.toLowerCase())
        ) {
            return false;
        }

        // FRESHNESS FILTER

        // if (freshness !== "") {
        //     const today = new Date();
        //     const expiry = new Date(
        //         donation.expiryDate
        //     );
        //     const difference = expiry.getTime() - today.getTime();
        //     const daysLeft =
        //         difference /
        //         (1000 * 60 * 60 * 24);
        //     if (
        //         freshness === "today" &&
        //         daysLeft > 1
        //     ) {
        //         return false;
        //     }

        //     if (
        //         freshness === "3days" &&
        //         daysLeft > 3
        //     ) {
        //         return false;
        //     }

        //     if (
        //         freshness === "7days" &&
        //         daysLeft > 7
        //     ) {
        //         return false;
        //     }
        // }

        // DISTANCE FILTER

        // if (
        //     distance !== "" &&
        //     ngoLocation &&
        //     donation.pickupLocation
        // ) {
        //     const donationDistance =
        //         calculateDistance(
        //             ngoLocation.latitude,
        //             ngoLocation.longitude,
        //             donation.pickupLocation.latitude,
        //             donation.pickupLocation.longitude
        //         );
        //     if (
        //         donationDistance >
        //         Number(distance)
        //     ) {
        //         return false;
        //     }
        // }

        return true;
    });

    return (
        <div className="donation-page">
            <h1 className="donation-page-heading">
                All Available Donations
            </h1>

            {/* FILTERS */}
            <div className="donation-filters">
                <div>
                    <label>Search Food</label>
                    <input
                        type="text"
                        placeholder="Enter food name"
                        value={searchFood}
                        onChange={(e) =>
                            setSearchFood(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>Freshness</label>
                    <select
                        value={freshness}
                        onChange={(e) =>
                            setFreshness(
                                e.target.value
                            )
                        }
                    >
                        <option value="">Any</option>
                        <option value="today">Within 1 day</option>
                        <option value="3days">Within 3 days</option>
                        <option value="7days">Within 7 days</option>
                    </select>
                </div>
                <div>

                    <label>Distance</label>
                    <select
                        value={distance}
                        onChange={(e) =>
                            setDistance(
                                e.target.value
                            )
                        }
                    >
                        <option value="">Any distance</option>
                        <option value="5">Within 5 km</option>
                        <option value="10">Within 10 km</option>
                        <option value="20">Within 20 km</option>
                    </select>
                </div>
            </div>

            {/* DONATIONS */}
            <div className="donations">
                {filteredDonations.map(
                    (donation, idx) => {
                        return (
                            <div
                                key={idx}
                                className="donation-box"
                            >
                                <div className="donation-box-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span>{donation.deliveryStatus}</span>
                                </div>
                                <div className="donation-box-quantity">
                                    <p>
                                        <strong>Quantity:</strong>{" "}
                                        {donation.quantity}{" "}
                                        {donation.unit}
                                    </p>
                                </div>
                                <div className="donation-box-phone">
                                    <p>
                                        <strong>Mobile No:</strong>
                                    </p>
                                    <p>{donation.phone}</p>
                                </div>
                                <div className="donation-box-description">
                                    <p>
                                        <strong>Description:</strong>
                                    </p>
                                    <p>
                                        {donation.description}
                                    </p>
                                </div>
                                <div className="donation-box-pickup-address">
                                    <p>
                                        <strong>Pickup Address:</strong>
                                    </p>
                                    <p>
                                        {donation.pickupAddress}
                                    </p>
                                </div>

                                <div className="donation-box-time">

                                    <p>
                                        <strong>Donated at:</strong>
                                    </p>

                                    <p>
                                        {new Date(
                                            donation.createdAt
                                        ).toLocaleString(
                                            "en-US",
                                            {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true
                                            }
                                        )}
                                    </p>
                                </div>

                                <button
                                    className="donation-box-accept-btn"
                                    onClick={() => {
                                        setIsAccept(
                                            donation._id
                                        );
                                        handleAcceptDonation(
                                            donation._id,
                                            setIsAccept,
                                            setDonation
                                        );
                                    }}
                                >
                                    {isAccept === donation._id
                                        ? "Processing..."
                                        : "Accept Donation"
                                    }
                                </button>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}
