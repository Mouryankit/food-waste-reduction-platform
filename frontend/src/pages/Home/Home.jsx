import "./Home.css";

export default function Home() {
    return (
        <div className="home-page">

            <section className="home-hero">

                <h1>Food Waste Reduction Platform</h1>

                <p>
                    Donate surplus food and help NGOs deliver it to
                    people in need.
                </p>

                <div className="home-hero-buttons">
                    <button className="button home-hero-btn">Donate Food</button>
                    <button className="button home-hero-btn">View Donations</button>
                </div>

            </section>

            <section className="home-about">

                <h2>About Us</h2>

                <p>
                    Our platform connects restaurants with NGOs to
                    reduce food waste. Restaurants can donate extra food,
                    NGOs can accept donations, and together we help feed
                    people in need.
                </p>

            </section>

            <section className="home-features">

                <h2>Features</h2>

                <div className="home-feature-container">

                    <div className="card home-feature-card">
                        <h3>Donate Food</h3>
                        <p>Restaurants can donate surplus food.</p>
                    </div>

                    <div className="card home-feature-card">
                        <h3>NGO Support</h3>
                        <p>NGOs can accept and distribute food.</p>
                    </div>

                    <div className="card home-feature-card">
                        <h3>Dashboard</h3>
                        <p>Track donations and monitor activities.</p>
                    </div>

                </div>

            </section>

            <footer className="home-footer">

                <p>
                    © 2026 Food Waste Reduction Platform
                </p>

            </footer>

        </div>
    );
}