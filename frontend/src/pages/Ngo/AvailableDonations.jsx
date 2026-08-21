import "./AvailableDonations.css";
import { useState, useEffect } from "react";
import API from "../../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../../context/AuthContext";

// Red marker icon for NGO
const ngoIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Green marker icon for Donations
const donationIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const getAllDonations = async function ({ setDonations }) {
    try {
        const res = await API.get(`/ngo`);
        if (res?.data?.result) {
            setDonations(res.data.result);
        }
    } catch (err) {
        console.error("Failed to fetch available donations:", err.message || err);
        alert("some error occured");
    }
};

const handleAcceptDonation = async (
    donationId,
    setIsAccept,
    setDonations
) => {

    try {

        const res = await API.post(`/ngo/accept-donation`, {
            donationId: donationId
        });

        if (res?.data?.message) {
            alert(res.data.message);
            await getAllDonations({
                setDonations
            });
        }
    } catch (err) {
        console.log(err.message);
        alert("Error : " + err.message);
    }
    setIsAccept("");
};

// Distance calculation
const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const matchesFoodSearch = (foodName, searchFood) => {
    if (searchFood === "") return true;
    return foodName.toLowerCase().includes(searchFood.toLowerCase());
};

const matchesFreshness = (expiryDate, freshness) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry.getTime() - today.getTime();
    const daysLeft = difference / (1000 * 60 * 60 * 24);

    // Always hide already expired donations
    if (daysLeft <= 0) return false;

    if (freshness === "") return true;
    if (freshness === "today" && daysLeft > 1) return false;
    if (freshness === "3days" && daysLeft > 3) return false;
    if (freshness === "7days" && daysLeft > 7) return false;
    return true;
};

const matchesDistance = (pickupLocation, distance, ngoLocation) => {
    if (distance === "" || !ngoLocation || !pickupLocation) return true;

    const donationDistance = calculateDistance(
        ngoLocation.latitude,
        ngoLocation.longitude,
        pickupLocation.latitude,
        pickupLocation.longitude
    );
    return donationDistance <= Number(distance);
};


// Inside the component:




export default function AvailableDonations() {
    const [donations, setDonations] = useState([]);
    const [isAccept, setIsAccept] = useState("");
    const [searchFood, setSearchFood] = useState("");
    const [freshness, setFreshness] = useState("");
    const [distance, setDistance] = useState("");
    const [ngoLocation, setNgoLocation] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const { user } = useAuth();

    // Get donations
    useEffect(() => {
        getAllDonations({
            setDonations
        });
    }, []);

    useEffect(() => {
        if (user?.location?.latitude && user?.location?.longitude) {
            setNgoLocation(user.location);
            console.log("Using NGO profile location from Auth Context:", user.location);
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setNgoLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    console.log("Using browser geolocated coordinates:", position.coords);
                },
                (error) => {
                    console.log("Geolocation error:", error.message);
                }
            );
        }
    }, [user]); // Add user as a dependency

    
    // FILTER DONATIONS
    const filteredDonations = donations.filter((donation) => {
        if (!matchesFoodSearch(donation.foodName, searchFood)) return false;
        if (!matchesFreshness(donation.expiryDate, freshness)) return false;
        if (!matchesDistance(donation.pickupLocation, distance, ngoLocation)) return false;
        return true;
    });

    const hasActiveFilters = searchFood !== "" || freshness !== "" || distance !== "";

    return (
        <div className="container available-donations-page">
            
            {/* 1. PAGE HEADER & 2. MAP BUTTON */}
            <header className="available-donations-header">
                <div className="available-donations-header-text">
                    <h1 className="available-donations-title">Available Food Donations</h1>
                    <p className="available-donations-subtitle">
                        Discover surplus food donations near you and help connect them with people in need.
                    </p>
                </div>
                <button 
                    type="button"
                    className="button view-map-btn available-donations-map-btn" 
                    onClick={() => setShowMapModal(true)}
                >
                    🗺️ View on Map
                </button>
            </header>

            {/* 3. FILTER SECTION & 13. CLEAR FILTERS */}
            <section className="filter-container available-donations-filter-panel">
                <h3 className="filter-panel-title">🔎 Find Donations</h3>
                
                <div className="filter-panel-row">
                    <div className="filter-panel-field search-field">
                        <label htmlFor="search-input">Search food</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="🔍 Search food name..."
                            value={searchFood}
                            onChange={(e) => setSearchFood(e.target.value)}
                            className="input available-donations-search-input"
                        />
                    </div>

                    <div className="filter-panel-field select-field">
                        <label htmlFor="freshness-select">Freshness</label>
                        <select
                            id="freshness-select"
                            value={freshness}
                            onChange={(e) => setFreshness(e.target.value)}
                            className="input available-donations-select"
                        >
                            <option value="">Any</option>
                            <option value="today">Within 1 day</option>
                            <option value="3days">Within 3 days</option>
                            <option value="7days">Within 7 days</option>
                        </select>
                    </div>

                    <div className="filter-panel-field select-field">
                        <label htmlFor="distance-select">Distance</label>
                        <select
                            id="distance-select"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="input available-donations-select"
                        >
                            <option value="">Any distance</option>
                            <option value="5">Within 5 km</option>
                            <option value="10">Within 10 km</option>
                            <option value="20">Within 20 km</option>
                        </select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="filter-actions-row">
                        <button 
                            type="button"
                            className="button secondary-button clear-filters-btn"
                            onClick={() => {
                                setSearchFood("");
                                setFreshness("");
                                setDistance("");
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>

            {/* 12. EMPTY STATE & 7. DONATIONS GRID */}
            {filteredDonations.length === 0 ? (
                <div className="card available-donations-empty">
                    <span className="empty-icon">🍱</span>
                    <h3>No donations found</h3>
                    <p>We couldn't find donations matching your current filters.</p>
                    <button 
                        type="button"
                        className="button secondary-button"
                        onClick={() => {
                            setSearchFood("");
                            setFreshness("");
                            setDistance("");
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="donations-grid available-donations-grid">
                    {filteredDonations.map((donation, idx) => {
                        const hasDistance = ngoLocation && donation.pickupLocation;
                        const computedDistanceVal = hasDistance
                            ? calculateDistance(
                                  ngoLocation.latitude,
                                  ngoLocation.longitude,
                                  donation.pickupLocation.latitude,
                                  donation.pickupLocation.longitude
                              )
                            : null;

                        return (
                            <div
                                key={donation._id}
                                className="card donation-card available-donation-card"
                            >
                                <div className="donation-card-heading available-donation-card-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span className={`badge badge-${donation.deliveryStatus.toLowerCase()}`}>
                                        {donation.deliveryStatus}
                                    </span>
                                </div>

                                <div className="donation-card-body">
                                    {/* Prominent Quantity Display */}
                                    <div className="available-donation-qty">
                                        <span className="qty-emoji">🍱</span>
                                        <span className="qty-value">{donation.quantity} {donation.unit}</span>
                                    </div>

                                    {/* Prominent Distance Display */}
                                    {computedDistanceVal !== null && (
                                        <div className="available-donation-distance-row">
                                            <span className="distance-icon">📍</span>
                                            <span className="distance-value">{computedDistanceVal.toFixed(1)} km away</span>
                                        </div>
                                    )}

                                    <div className="donation-card-section">
                                        <p><strong>Pickup Location</strong></p>
                                        <p className="section-text-value">{donation.pickupAddress}</p>
                                    </div>

                                    {donation.description && (
                                        <div className="donation-card-section">
                                            <p><strong>Description</strong></p>
                                            <p className="section-text-value description-text">{donation.description}</p>
                                        </div>
                                    )}

                                    <div className="donation-card-section">
                                        <p><strong>📞 Contact</strong></p>
                                        <p className="section-text-value">{donation.phone}</p>
                                    </div>

                                    <div className="donation-card-section timestamp-section">
                                        <p><strong>📅 Donated</strong></p>
                                        <p className="section-text-value">
                                            {new Date(donation.createdAt).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="button primary-button available-donation-accept-btn"
                                    disabled={isAccept === donation._id}
                                    onClick={() => {
                                        setIsAccept(donation._id);
                                        handleAcceptDonation(
                                            donation._id,
                                            setIsAccept,
                                            setDonations
                                        );
                                    }}
                                >
                                    {isAccept === donation._id ? "Processing..." : "Accept Donation"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 14. MAP MODAL & 15. MAP HEADER & 16. POPUPS */}
            {showMapModal && (
                <div className="modal-overlay map-modal-overlay">
                    <div className="modal-content map-modal-content">
                        <div className="map-modal-header">
                            <div className="map-modal-header-text">
                                <h2>Nearby Donations</h2>
                                <p>Find available food donations around your location.</p>
                            </div>
                            <button 
                                type="button"
                                className="map-modal-close-icon-btn" 
                                onClick={() => setShowMapModal(false)}
                                aria-label="Close Map"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="map-container-wrapper">
                            <MapContainer
                                center={ngoLocation ? [ngoLocation.latitude, ngoLocation.longitude] : [22.7196, 75.8577]}
                                zoom={12}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />

                                {/* NGO Marker */}
                                {ngoLocation && (
                                    <Marker position={[ngoLocation.latitude, ngoLocation.longitude]} icon={ngoIcon}>
                                        <Popup>
                                            <div className="ngo-map-popup">
                                                <strong>Your Location (NGO)</strong>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Donation Markers */}
                                {filteredDonations.map((donation) => {
                                    if (donation.pickupLocation?.latitude && donation.pickupLocation?.longitude) {
                                        return (
                                            <Marker
                                                key={donation._id}
                                                position={[donation.pickupLocation.latitude, donation.pickupLocation.longitude]}
                                                icon={donationIcon}
                                            >
                                                <Popup>
                                                    <div className="donation-map-popup">
                                                        <h3>{donation.foodName}</h3>
                                                        <p className="popup-qty">🍱 {donation.quantity} {donation.unit}</p>
                                                        <p className="popup-address">📍 {donation.pickupAddress}</p>
                                                        <p className="popup-phone">📞 {donation.phone}</p>
                                                        {ngoLocation && (
                                                            <p className="popup-distance">
                                                                {calculateDistance(
                                                                    ngoLocation.latitude,
                                                                    ngoLocation.longitude,
                                                                    donation.pickupLocation.latitude,
                                                                    donation.pickupLocation.longitude
                                                                ).toFixed(1)} km away
                                                            </p>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    }
                                    return null;
                                })}
                            </MapContainer>
                        </div>
                        <div className="map-modal-legend">
                            <span className="legend-item"><span className="legend-color green-color">🟢</span> Available Donation</span>
                            <span className="legend-item"><span className="legend-color red-color">🔴</span> Your Location (NGO)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
