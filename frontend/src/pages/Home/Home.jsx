import "./Home.css";

export default function Home() {
    return (
        <div className="home">

            <section className="hero">

                <h1>Food Waste Reduction Platform</h1>

                <p>
                    Donate surplus food and help NGOs deliver it to
                    people in need.
                </p>

                <div className="hero-buttons">
                    <button>Donate Food</button>
                    <button>View Donations</button>
                </div>

            </section>

            <section className="about">

                <h2>About Us</h2>

                <p>
                    Our platform connects restaurants with NGOs to
                    reduce food waste. Restaurants can donate extra food,
                    NGOs can accept donations, and together we help feed
                    people in need.
                </p>

            </section>

            <section className="features">

                <h2>Features</h2>

                <div className="feature-container">

                    <div className="feature-card">
                        <h3>🍽 Donate Food</h3>
                        <p>Restaurants can donate surplus food.</p>
                    </div>

                    <div className="feature-card">
                        <h3>🤝 NGO Support</h3>
                        <p>NGOs can accept and distribute food.</p>
                    </div>

                    <div className="feature-card">
                        <h3>📊 Dashboard</h3>
                        <p>Track donations and monitor activities.</p>
                    </div>

                </div>

            </section>

            <footer>

                <p>
                    © 2026 Food Waste Reduction Platform
                </p>

            </footer>

        </div>
    );
}