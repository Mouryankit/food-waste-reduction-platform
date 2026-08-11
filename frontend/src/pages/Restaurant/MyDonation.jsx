import "./MyDonation.css";
import { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const getDonations = async function ({ setDonation, setIsLoading }) {
    try {
        setIsLoading(true);
        const res = await API.get("/restaurant");
        if (res?.data?.result) {
            setDonation(res.data.result);
        }
    } catch (error) {
        console.log(error);
    } finally {
        setIsLoading(false);
    }
};

export default function MyDonation() {
    const navigate = useNavigate();
    const [donations, setDonation] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDonations({ setDonation, setIsLoading });
    }, []);

    const deleteDonation = async (id) => {
        try {
            const result = await API.delete(`/restaurant/${id}`);
            alert(result.data.message);
            setDonation((prev) =>
                prev.filter((item) => item._id !== id)
            );
        } catch (error) {
            console.log(error);
            alert("Failed to delete donation");
        }
    };

    const handleDeleteConfirm = (id) => {
        if (window.confirm("Delete this donation?\n\nThis action cannot be undone.")) {
            deleteDonation(id);
        }
    };

    const isCloseToExpiry = (expiryDate) => {
        const diffTime = new Date(expiryDate) - new Date();
        const diffHours = diffTime / (1000 * 60 * 60);
        return diffHours > 0 && diffHours < 24;
    };

    // Calculate Statistics from existing donations state
    const totalCount = donations.length;
    const pendingCount = donations.filter((d) => d.deliveryStatus === "pending").length;
    const acceptedCount = donations.filter((d) => d.deliveryStatus === "accepted").length;
    const deliveredCount = donations.filter((d) => d.deliveryStatus === "delivered").length;

    // Filter donations based on status
    const filteredDonations = statusFilter === "all" ? donations : donations.filter(
        (donation) => donation.deliveryStatus === statusFilter
    );

    return (
        <div className="container my-donation-page">
            
            {/* 1. PAGE HEADER */}
            <header className="my-donation-header">
                <h1 className="my-donation-title">My Donations</h1>
                <p className="my-donation-subtitle">Manage, track, and monitor your food donations.</p>
            </header>

            {/* 2. DONATION STATISTICS */}
            <section className="my-donation-stats-section">
                <div className="my-donation-stats-grid">
                    <div className="card my-donation-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-card-title">Total Donations</span>
                            <span className="stat-card-icon">🍱</span>
                        </div>
                        <p className="stat-card-number">{totalCount}</p>
                    </div>
                    <div className="card my-donation-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-card-title">Pending</span>
                            <span className="stat-card-icon">⏳</span>
                        </div>
                        <p className="stat-card-number warning-color">{pendingCount}</p>
                    </div>
                    <div className="card my-donation-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-card-title">Accepted</span>
                            <span className="stat-card-icon">🤝</span>
                        </div>
                        <p className="stat-card-number primary-color">{acceptedCount}</p>
                    </div>
                    <div className="card my-donation-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-card-title">Delivered</span>
                            <span className="stat-card-icon">✅</span>
                        </div>
                        <p className="stat-card-number secondary-color">{deliveredCount}</p>
                    </div>
                </div>
            </section>

            {/* 3. FILTER SECTION */}
            <section className="my-donation-filter-section">
                <div className="my-donation-filter-bar">
                    <span className="filter-label">Filter by status:</span>
                    
                    {/* Desktop Pill Selectors */}
                    <div className="my-donation-filter-pills">
                        <button 
                            className={`filter-pill-btn ${statusFilter === "all" ? "active" : ""}`}
                            onClick={() => setStatusFilter("all")}
                        >
                            All ({totalCount})
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === "pending" ? "active" : ""}`}
                            onClick={() => setStatusFilter("pending")}
                        >
                            Pending ({pendingCount})
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === "accepted" ? "active" : ""}`}
                            onClick={() => setStatusFilter("accepted")}
                        >
                            Accepted ({acceptedCount})
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === "delivered" ? "active" : ""}`}
                            onClick={() => setStatusFilter("delivered")}
                        >
                            Delivered ({deliveredCount})
                        </button>
                    </div>

                    {/* Mobile Dropdown fallback */}
                    <select
                        className="my-donation-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All ({totalCount})</option>
                        <option value="pending">Pending ({pendingCount})</option>
                        <option value="accepted">Accepted ({acceptedCount})</option>
                        <option value="delivered">Delivered ({deliveredCount})</option>
                    </select>
                </div>
            </section>

            {/* 4. DONATION GRID / CARDS */}
            {isLoading ? (
                <div className="my-donation-loading">
                    <p>Loading your donations...</p>
                </div>
            ) : filteredDonations.length === 0 ? (
                /* 12. EMPTY STATE */
                <div className="card my-donation-empty">
                    <span className="empty-icon">🍱</span>
                    <h3>No donations found</h3>
                    <p>
                        {donations.length === 0 
                            ? "You don't have any donations created yet." 
                            : "You don't have any donations matching this filter."
                        }
                    </p>
                    {donations.length === 0 && (
                        <button 
                            className="button primary-button empty-action-btn"
                            onClick={() => navigate("/restaurant/add-donation")}
                        >
                            Create Donation
                        </button>
                    )}
                </div>
            ) : (
                <div className="donations-grid my-donations-grid">
                    {filteredDonations.map((donation) => {
                        const closeToExpiry = isCloseToExpiry(donation.expiryDate);
                        return (
                            <div
                                key={donation._id}
                                className="card donation-card my-donation-card"
                            >
                                <div className="donation-card-heading my-donation-card-heading">
                                    <h2>{donation.foodName}</h2>
                                    <span className={`badge badge-${donation.deliveryStatus.toLowerCase()}`}>
                                        {donation.deliveryStatus}
                                    </span>
                                </div>

                                <div className="donation-card-body">
                                    
                                    {/* Prominent Quantity */}
                                    <div className="my-donation-qty-display">
                                        <span className="qty-emoji">🍱</span>
                                        <div className="qty-text">
                                            <span className="qty-label">Quantity</span>
                                            <span className="qty-value">{donation.quantity} {donation.unit}</span>
                                        </div>
                                    </div>

                                    <div className="donation-card-section">
                                        <p><strong>📞 Mobile</strong></p>
                                        <p className="section-text-value">{donation.phone}</p>
                                    </div>

                                    {donation.description && (
                                        <div className="donation-card-section">
                                            <p><strong>📝 Description</strong></p>
                                            <p className="section-text-value description-text">{donation.description}</p>
                                        </div>
                                    )}

                                    <div className="donation-card-section">
                                        <p><strong>📍 Pickup Address</strong></p>
                                        <p className="section-text-value">{donation.pickupAddress}</p>
                                    </div>

                                    <div className="donation-card-section">
                                        <p><strong>🤝 Accepted By</strong></p>
                                        <p className="section-text-value">
                                            {donation.ngoObjectId ? (
                                                <span className="accepted-ngo-tag">NGO: {donation.ngoObjectId.name}</span>
                                            ) : (
                                                <span className="not-accepted-yet-tag">Not Accepted Yet</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Expiry Warning Style */}
                                    <div className={`donation-card-section expiry-section ${closeToExpiry ? "expiry-warning-highlight" : ""}`}>
                                        <p><strong>⏰ Expires</strong></p>
                                        <p className="section-text-value expiry-text">
                                            {new Date(donation.expiryDate).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                            {closeToExpiry && <span className="expiry-warning-badge">⚠️ Expiring Soon</span>}
                                        </p>
                                    </div>

                                    <div className="donation-card-section timestamp-section">
                                        <p><strong>📅 Donated At</strong></p>
                                        <p className="section-text-value">
                                            {new Date(donation.createdAt).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true
                                            })}
                                        </p>
                                    </div>

                                </div>

                                <div className="my-donation-card-actions">
                                    <button
                                        className="button primary-button my-donation-edit-btn"
                                        onClick={() => navigate(`/restaurant/edit-donation/${donation._id}`)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="button danger-button my-donation-delete-btn"
                                        onClick={() => handleDeleteConfirm(donation._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}