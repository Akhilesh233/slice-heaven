import '../src/App.css'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function LandingPage () {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        navigate('/login');
    };

    const handleOrderNow = async (e) => {
        e.preventDefault();
        navigate('/login');
    };
    
    if (loading) {
        return (
            <div className="loader">
                <div className="spinner"></div>
                <p>Loading Slice Heaven...</p>
            </div>
        );
    }

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Slice Heaven Pizza</h1>
                    <p className="hero-subtitle">Delicious Pizzas Made with Love and Fresh Ingredients</p>
                    <p className="hero-description">
                        Experience the perfect blend of crispy crust, savory sauces, and premium toppings.
                        From classic Margherita to gourmet specialties, we've got a pizza for every craving.
                    </p>
                    <div className="hero-buttons">
                        <button type='button' className='order-now-button' onClick={handleOrderNow}>Order Now</button>
                        <button type='button' className='login-btn' onClick={handleLogin}>Log In</button>
                    </div>
                </div>
                <div className='hero-image'>
                    <img src="/dark.jpg" alt="Delicious pizza with fresh ingredients" />
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <h2>Why Choose Slice Heaven?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🍕</div>
                        <h3>Fresh Ingredients</h3>
                        <p>We use only the freshest, locally-sourced ingredients to create our mouth-watering pizzas.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⏰</div>
                        <h3>Fast Delivery</h3>
                        <p>Hot and fresh pizzas delivered to your doorstep in 30 minutes or less, guaranteed!</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌟</div>
                        <h3>Quality Guarantee</h3>
                        <p>100% satisfaction guarantee on every pizza. If you're not happy, we'll make it right.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Variety of Choices</h3>
                        <p>Over 20 different pizza varieties, plus sides, drinks, and desserts to complete your meal.</p>
                    </div>
                </div>
            </div>

            {/* Popular Pizzas Section */}
            <div className="popular-pizzas">
                <h2>Customer Favorites</h2>
                <div className="pizzas-grid">
                    <div className="pizza-card">
                        <img className='pizza-image' src="https://www.thursdaynightpizza.com/wp-content/uploads/2022/06/veggie-pizza-side-view-out-of-oven.png" alt="Veggie Supreme" />
                        <h3 className='pizza-name'>Veggie Supreme</h3>
                        <p className='pizza-description'>Fully loaded with fresh vegetables and mozzarella cheese on top</p>
                        <div className='pizza-footer'>
                            <p className="pizza-price">₹189</p>
                            <button type='button' className="add-to-cart-btn" onClick={handleLogin}>
                                Login to Order
                            </button>
                        </div>
                    </div>
                    <div className="pizza-card">
                        <img className='pizza-image' src="https://th.bing.com/th/id/OIP.aO3Dd0RcpmlzxO-rSaiLpgHaFj?w=182&h=136&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="BBQ Chicken" />
                        <h3 className='pizza-name'>BBQ Chicken</h3>
                        <p className='pizza-description'>Pizza topped with grilled chicken, BBQ sauce, and red onions</p>
                        <div className='pizza-footer'>
                            <p className="pizza-price">₹239</p>
                            <button type='button' className="add-to-cart-btn" onClick={handleLogin}>
                                Login to Order
                            </button>
                        </div>
                    </div>
                    <div className="pizza-card">
                        <img className='pizza-image' src="https://th.bing.com/th/id/OIP._lEq8-xpPFCOjxDjCA2QjwHaC3?w=320&h=135&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="Veggie Paradise" />
                        <h3 className='pizza-name'>Veggie Paradise</h3>
                        <p className='pizza-description'>Fresh veggies, mozzarella, and our signature tomato sauce</p>
                        <div className='pizza-footer'>
                            <p className="pizza-price">₹199</p>
                            <button type='button' className="add-to-cart-btn" onClick={handleLogin}>
                                Login to Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Satisfy Your Pizza Cravings?</h2>
                    <p>Join thousands of happy customers who choose Slice Heaven for their pizza needs.</p>
                    <button type='button' className='cta-button' onClick={handleOrderNow}>Start Ordering Now</button>
                </div>
            </div>

            {/* Footer */}
            <div className="landing-footer">
                <p>&copy; 2025 Slice Heaven Pizza. All rights reserved.</p>
                <p>Fresh ingredients, perfect crust, unforgettable taste.</p>
            </div>
        </div>
    )
}

export default LandingPage;
