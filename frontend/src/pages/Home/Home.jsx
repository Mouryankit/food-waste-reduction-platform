import "./Home.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDonations: 1250, // Default fallbacks as placeholder stats
        delivered: 840,
        totalRestaurants: 45,
        totalNGOs: 24
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get("/admin/analytics");
                if (res?.data?.analytics) {
                    const data = res.data.analytics;
                    setStats({
                        totalDonations: data.totalDonations || 1250,
                        delivered: data.delivered || 840,
                        totalRestaurants: data.totalRestaurants || 45,
                        totalNGOs: data.totalNGOs || 24
                    });
                }
            } catch (err) {
                console.log("Failed to fetch analytics statistics, using fallback values", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="home-page">
            
            {/* 1. HERO SECTION */}
            <section className="section hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">🌱 Food Waste Reduction</span>
                        <h1 className="hero-title">Reduce Food Waste. <br/>Feed People.</h1>
                        <p className="hero-description">
                            Connect surplus food from restaurants and donors with NGOs and communities that need it.
                        </p>
                        <div className="hero-buttons">
                            <button 
                                type="button"
                                className="button primary-button hero-cta-primary"
                                onClick={() => navigate("/restaurant/add-donation")}
                            >
                                Donate Food
                            </button>
                            <button 
                                type="button"
                                className="button secondary-button hero-cta-secondary"
                                onClick={() => navigate("/ngo/available-donations")}
                            >
                                Find Food
                            </button>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <img 
                            src="/hero_visual.jpg" 
                            alt="Food donation and sustainability illustration" 
                            className="hero-image"
                        />
                    </div>
                </div>
            </section>

            {/* 2. IMPACT STATISTICS */}
            <section className="section stats-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Our Collective Impact</h2>
                        <p className="section-subtitle">Real-time statistics of waste reduced and communities supported.</p>
                    </div>
                    <div className="stats-grid">
                        <div className="card impact-card">
                            <div className="impact-icon-wrapper">🍱</div>
                            <h3 className="impact-number">{stats.totalDonations.toLocaleString()}</h3>
                            <p className="impact-label">Food Donated (Items)</p>
                        </div>
                        <div className="card impact-card">
                            <div className="impact-icon-wrapper">🤝</div>
                            <h3 className="impact-number">{stats.delivered.toLocaleString()}</h3>
                            <p className="impact-label">Meals Provided</p>
                        </div>
                        <div className="card impact-card">
                            <div className="impact-icon-wrapper">🏪</div>
                            <h3 className="impact-number">{stats.totalRestaurants}</h3>
                            <p className="impact-label">Restaurants Joined</p>
                        </div>
                        <div className="card impact-card">
                            <div className="impact-icon-wrapper">🏡</div>
                            <h3 className="impact-number">{stats.totalNGOs}</h3>
                            <p className="impact-label">NGOs Connected</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section className="section steps-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">Three simple steps to bridge the gap between surplus and hunger.</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number-badge">01</div>
                            <div className="step-icon">📤</div>
                            <h3>Donate</h3>
                            <p>Restaurants and donors list their surplus food in seconds.</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number-badge">02</div>
                            <div className="step-icon">🔍</div>
                            <h3>Connect</h3>
                            <p>Nearby registered NGOs discover available donations on the map.</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number-badge">03</div>
                            <div className="step-icon">🚚</div>
                            <h3>Deliver</h3>
                            <p>Food is collected quickly and delivered to people in need.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. WHY USE OUR PLATFORM? */}
            <section className="section benefits-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Why Use Our Platform?</h2>
                        <p className="section-subtitle">Dedicated features designed to build a sustainable distribution loop.</p>
                    </div>
                    <div className="benefits-grid">
                        <div className="card benefit-card">
                            <div className="benefit-icon">🍃</div>
                            <h3>Reduce Food Waste</h3>
                            <p>Give surplus food a second purpose instead of throwing it away and damaging the environment.</p>
                        </div>
                        <div className="card benefit-card">
                            <div className="benefit-icon">❤️</div>
                            <h3>Help Communities</h3>
                            <p>Connect available food with local NGOs and shelter homes who distribute to families in need.</p>
                        </div>
                        <div className="card benefit-card">
                            <div className="benefit-icon">📍</div>
                            <h3>Find Nearby Donations</h3>
                            <p>Utilize coordinate maps and distance checking to pick up fresh food donations close to you.</p>
                        </div>
                        <div className="card benefit-card">
                            <div className="benefit-icon">📈</div>
                            <h3>Track Your Impact</h3>
                            <p>See exactly how much food you have donated, keeping logs of your environmental sustainability.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. RESTAURANT / DONOR CALLOUT SECTION */}
            <section className="section donor-section">
                <div className="section-container donor-container">
                    <div className="donor-content">
                        <span className="section-tag-light">FOR FOOD DONORS</span>
                        <h2>Have surplus food? <br/>Turn it into impact.</h2>
                        <p>
                            Instead of throwing away perfectly usable food, donate it to local verified organizations that can distribute it to people in need. Minimize waste and help your community today.
                        </p>
                        <button 
                            type="button"
                            className="button primary-button donor-cta-btn"
                            onClick={() => navigate("/restaurant/add-donation")}
                        >
                            Start Donating
                        </button>
                    </div>
                    <div className="donor-side-graphic">🏪</div>
                </div>
            </section>

            {/* 6. NGO CALLOUT SECTION */}
            <section className="section ngo-section">
                <div className="section-container ngo-container">
                    <div className="ngo-side-graphic">🏡</div>
                    <div className="ngo-content">
                        <span className="section-tag-orange">FOR NGOs</span>
                        <h2>Looking for food donations?</h2>
                        <p>
                            Discover fresh, edible available food donations from nearby restaurants and food retail donors. Claim donations instantly and organize logistics to get food to communities who need it.
                        </p>
                        <button 
                            type="button"
                            className="button accent-button ngo-cta-btn"
                            onClick={() => navigate("/ngo/available-donations")}
                        >
                            Find Donations
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. ENVIRONMENTAL/SOCIAL IMPACT CONCEPTS */}
            <section className="section environmental-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Environmental & Social Stewardship</h2>
                        <p className="section-subtitle">Food waste reduction is a primary contributor to combating climate change.</p>
                    </div>
                    <div className="impact-concepts-grid">
                        <div className="concept-card">
                            <span className="concept-emoji">🌱</span>
                            <h4>Less Food Waste</h4>
                            <p>Lowering methane output in local landfills.</p>
                        </div>
                        <div className="concept-card">
                            <span className="concept-emoji">🍱</span>
                            <h4>More Meals</h4>
                            <p>Directing edible calories towards nourishment.</p>
                        </div>
                        <div className="concept-card">
                            <span className="concept-emoji">🤝</span>
                            <h4>Stronger Communities</h4>
                            <p>Connecting local businesses with volunteers.</p>
                        </div>
                        <div className="concept-card">
                            <span className="concept-emoji">🌍</span>
                            <h4>Better Environment</h4>
                            <p>Saving precious agricultural water and energy resources.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. FINAL CALL TO ACTION */}
            <section className="section cta-section">
                <div className="cta-container">
                    <div className="cta-bg-shapes"></div>
                    <h2 className="cta-title">Together, We Can Reduce Food Waste.</h2>
                    <p className="cta-description">Every single donation can make a difference in someone's life.</p>
                    <div className="cta-buttons">
                        <button 
                            type="button"
                            className="button primary-button cta-btn-primary"
                            onClick={() => navigate("/restaurant/add-donation")}
                        >
                            Donate Food
                        </button>
                        <button 
                            type="button"
                            className="button secondary-button cta-btn-secondary"
                            onClick={() => navigate("/signup")}
                        >
                            Join as NGO
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="home-footer">
                <p>© 2026 Food Waste Reduction Platform. Working Together for a Better Tomorrow.</p>
            </footer>

        </div>
    );
}