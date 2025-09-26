import '../src/App.css'
import axios from 'axios'
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../src/AuthContext';
import Cookies from 'js-cookie';

function HomePage () {
    // definition of all the variable states
    const [message, setMessage] = useState([]);
    const [filter, setfilter] = useState('all');
    const [priceSort, setPriceSort] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cart, setCart] = useState([]);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // delivery form field state
    const [deliveryForm, setDeliveryForm] = useState({
        phoneNumber: '',
        address: '',
        city: '',
        pincode: '',
        country: ''
    });
    
    // delivery form errors state
    const [formErrors, setFormErrors] = useState({
        phoneNumber: '',
        address: '',
        city: '',
        pincode: '',
        country: ''
    });
    
    const navigate = useNavigate();
    const { setIsAuthenticated, user } = useContext(AuthContext);

    // handles the logout button functionality
    const handleLogOut = async (e) => {
        e.preventDefault();
        setIsAuthenticated(false);
        navigate('/login');
    };

    const handleMyOrders = async (e) => {
        e.preventDefault();
        navigate('/myorders');
    }

    // handles fetching the pizzas from the backend including filter, sort and pagination functionalities
    const fetchPizzas = async (filterQuery, page = 1, sort = '', searchQuery = '') => {
        try {
            let url = 'https://slice-heaven-insl.onrender.com/v1/pizzas';
            if (filterQuery && filterQuery !== 'all') {
                url += `/filter?veg=${filterQuery}&page=${page}&limit=12`;
            } else {
                url += `/filter?page=${page}&limit=12`;
            }
            if (sort) {
                url += `&sort=${sort}`;
            }
            if (searchQuery) {
                url += `&name=${searchQuery}`;
            }
            // calling the API with all the queries and setting the variables
            const response = await axios.get(url);
            setMessage(response.data.pizzas || response.data);
            setCurrentPage(response.data.page || 1);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch pizzas from backend');
        }
    };

    // keeping track of the filter, currentPage and priceSort functionalities on change
    useEffect (() => {
        fetchPizzas(filter, currentPage, priceSort, searchQuery);
    }, [filter, currentPage, priceSort, searchQuery]);

    // loading cart from cookies and handling reorder items
    useEffect(() => {
        // Check for reorder items from navigation state
        const location = window.location;
        const reorderItems = location.state?.reorderItems;
        
        if (reorderItems && reorderItems.length > 0) {
            // Process reorder items
            const processedItems = reorderItems.map(item => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.qty || 1,
                imageUrl: item.imageUrl || '',
                description: item.description || ''
            }));
            
            setCart(processedItems);
            const totalQuantity = processedItems.reduce((acc, item) => acc + item.quantity, 0);
            setCartQuantity(totalQuantity);
            
            // Clear the reorder items from state after processing
            window.history.replaceState({}, document.title);
        } else {
            // Load from cookies as fallback
            const savedCart = Cookies.get('cart');
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    setCart(parsedCart);
                    const totalQuantity = parsedCart.reduce((acc, item) => acc + item.quantity, 0);
                    setCartQuantity(totalQuantity);
                } catch (error) {
                    console.error('Error loading cart from cookies:', error);
                }
            }
        }
    }, []);

    // saves cart to cookies whenever cart changes
    useEffect(() => {
        Cookies.set('cart', JSON.stringify(cart), { expires: 7 }); // Expires in 7 days
    }, [cart]);

    // handles filter click functionality
    const handleFilterClick = (filterType) => {
        setfilter(filterType);
        setCurrentPage(1); // reset to first page on filter change
    };

    // handles pagination functionality
    const handlePrevPage = () => {
        if (currentPage > 1)
            setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages)
            setCurrentPage(currentPage + 1);
    };

    // handles added cart functionality
    const handleAddToCart = (pizza) => {
        // checking if pizza already exists in cart
        let updatedCart = [];
        const existingPizzaIndex = cart.findIndex(item => item._id === pizza._id);
        if (existingPizzaIndex !== -1) {
            // updating the quantity
            updatedCart = cart.map((item, index) => {
                // checking if the item is the one we want to update
                if (index === existingPizzaIndex) {
                    // incrementing the quantity
                    return {...item, quantity: item.quantity + 1};
                }
                return item;
            });
        } else {
            // adding new pizza to cart
            updatedCart = [...cart, {...pizza, quantity: 1}];
        }
        setCart(updatedCart);
        const totalQuantity = updatedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartQuantity(totalQuantity);
    };

    // toggle cart dialog visibility
    const showCart = () => {
        setIsCartOpen(!isCartOpen);
        setFormErrors('');
    };

    // handle quantity change in cart
    const handleQuantityChange = (pizzaId, delta) => {
        // updating the quantity of pizza in the cart
        const updatedCart = cart.map(item => {
            if (item._id === pizzaId) {
                const newQuantity = item.quantity + delta;
                return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
            }
            return item;
        });
        setCart(updatedCart);
        const totalQuantity = updatedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartQuantity(totalQuantity);
    };

    // handle empty cart functionality
    const handleEmptyCart = () => {
        setCart([]);
        setCartQuantity(0);
        setFormErrors('');
    };

    // handle delete item from cart
    const handleDeleteItem = (pizzaId) => {
        const updatedCart = cart.filter(item => item._id !== pizzaId);
        setCart(updatedCart);
        const totalQuantity = updatedCart.reduce((acc, item) => acc + item.quantity, 0);
        setCartQuantity(totalQuantity);
        setFormErrors('');
    };

    // validating delivery form fields
    const validateDeliveryForm = () => {
        const errors = {
            phoneNumber: '',
            address: '',
            city: '',
            pincode: '',
            country: ''
        };
        let isValid = true;

        // Phone number validation (5 digits)
        if (!deliveryForm.phoneNumber || deliveryForm.phoneNumber.length !== 5 || !/^\d+$/.test(deliveryForm.phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid 5-digit phone number';
            isValid = false;
        }
        // Address validation (minimum 5 characters)
        if (!deliveryForm.address || deliveryForm.address.trim().length < 5) {
            errors.address = 'Please enter a valid delivery address (at least 5 characters)';
            isValid = false;
        }
        // City validation (minimum 3 characters)
        if (!deliveryForm.city || deliveryForm.city.trim().length < 3) {
            errors.city = 'Please enter a valid city name (at least 3 characters)';
            isValid = false;
        }
        // Pincode validation (3 digits)
        if (!deliveryForm.pincode || deliveryForm.pincode.length !== 3 || !/^\d+$/.test(deliveryForm.pincode)) {
            errors.pincode = 'Please enter a valid 3-digit pincode';
            isValid = false;
        }
        // Country validation (minimum 2 characters)
        if (!deliveryForm.country || deliveryForm.country.trim().length < 2) {
            errors.country = 'Please enter a valid country name (at least 2 characters)';
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };

    // handle Order functionality
    const handleOrder = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items to your cart before placing an order.');
            return;
        }

        // Validating delivery form fields
        if (!validateDeliveryForm())
            return;
        
        try {
            // calculate total price
            const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
            
            // Use the logged-in user from AuthContext
            if (!user || !user._id) {
                alert('User not logged in. Please log in again.');
                return;
            }

            // prepare order data
            const orderData = {
                userId: user._id,
                orderItems: cart.map(item => ({
                    _id: item._id,
                    name: item.name,
                    qty: item.quantity,
                    price: item.price
                })),
                deliveryAddress: deliveryForm,
                totalPrice
            };

            // send order to backend 
            const response = await axios.post('https://slice-heaven-insl.onrender.com/v1/orders/add', orderData);
            
            if (response.status === 201) {
                alert('Order placed successfully!');

                // clear the cart and form after successful order placement
                setCart([]);
                setCartQuantity(0);
                setDeliveryForm({
                    phoneNumber: '',
                    address: '',
                    city: '',
                    pincode: '',
                    country: ''
                });
                setFormErrors({
                    phoneNumber: '',
                    address: '',
                    city: '',
                    pincode: '',
                    country: ''
                });
                setIsCartOpen(false);
            }
        } catch (error) {
            console.error('Error placing order:', error.message);
            alert('Failed to place order. This could be possible because you are trying to place the same order at same place. Please try again later after 10 minutes.');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="loader">
                <div className="spinner"></div>
                <p>Loading Slice Heaven...</p>
            </div>
        );
    }
    
    return (
        <div className="home-page">
            {/* Header Section */}
            <div className="home-header">
                <h1 className="home-title">Slice Heaven Pizza Menu</h1>
                <div className="header-buttons">
                    <button type='button' className='header-btn' onClick={handleMyOrders}>My Orders</button>
                    <button type='button' id='cart-box' className='header-btn' onClick={() => showCart()}>
                        🛒 Cart ({cartQuantity})
                    </button>
                    <button type='button' className='header-btn' onClick={handleLogOut}>Log Out</button>
                </div>
            </div>
            
            {/* Cart Dialog - Floating Modal */}
            {isCartOpen && (
                <div className="cart-modal-overlay">
                    <div className="cart-dialog">
                        <div className="cart-content">
                            <button type='button' className='empty-btn' onClick={handleEmptyCart} disabled={cartQuantity <= 0} title="Empty cart">E</button>
                            <button type='button' className="close-btn" onClick={() => showCart()} title="Close cart box">X</button>
                            <h2>Your Pizza Cart</h2>
                            
                            {cart.length === 0 ? (
                                <div className="empty-cart">
                                    <p>Your cart is empty.</p>
                                    <p>Add some delicious pizzas to get started!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-grid-container">
                                        <div className="cart-grid">
                                            {cart.map((item, id) => (
                                                <div key={id} className="cart-grid-item">
                                                    <div className="item-column">
                                                        <h3>{item.name}</h3>
                                                        <p className="item-price">₹{item.price} each</p>
                                                    </div>
                                                    <div className="quantity-column">
                                                        <div className="quantity-controls">
                                                            <button
                                                                type='button'
                                                                className="qty-btn" 
                                                                onClick={() => handleQuantityChange(item._id, -1)}
                                                                disabled={item.quantity <= 1}
                                                                title="decrease quantity"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="quantity">{item.quantity}</span>
                                                            <button 
                                                                type='button'
                                                                className="qty-btn" 
                                                                onClick={() => handleQuantityChange(item._id, 1)}
                                                                title="increase quantity"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="delete-column">
                                                            <button type='button' className="delete-btn" onClick={() => handleDeleteItem(item._id)} title="Remove pizza">🗑️</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* delivery address form */}
                                        <form className='addAddress-form' style={{position: 'static', backgroundColor: '#f8f9fa', margin: '0', maxWidth: '100%'}}>
                                            <label className='name-label'>
                                                Phone No (5 digits)
                                                <input 
                                                    type="tel" 
                                                    name="phoneNumber"
                                                    value={deliveryForm.phoneNumber}
                                                    onChange={(e) => setDeliveryForm({...deliveryForm, phoneNumber: e.target.value})}
                                                    placeholder="12345"
                                                    maxLength="5"
                                                    required
                                                />
                                            </label>
                                            {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
                                            <br />
                                            <label className='name-label'>
                                                Delivery Address
                                                <input 
                                                    type="text" 
                                                    name="address"
                                                    value={deliveryForm.address}
                                                    onChange={(e) => setDeliveryForm({...deliveryForm, address: e.target.value})}
                                                    placeholder="Sector 8 Greater Noida"
                                                    required
                                                />
                                            </label>
                                            {formErrors.address && <span className="error-message">{formErrors.address}</span>}
                                            <br />
                                            <label className='name-label'>
                                                City
                                                <input 
                                                    type="text" 
                                                    name="city"
                                                    value={deliveryForm.city}
                                                    onChange={(e) => setDeliveryForm({...deliveryForm, city: e.target.value})}
                                                    placeholder="Delhi"
                                                    required
                                                />
                                            </label>
                                            {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                                            <br />
                                            <label className='name-label'>
                                                Pincode (3 digits)
                                                <input 
                                                    type="text" 
                                                    name="pincode"
                                                    value={deliveryForm.pincode}
                                                    onChange={(e) => setDeliveryForm({...deliveryForm, pincode: e.target.value})}
                                                    placeholder="123"
                                                    maxLength="3"
                                                    required
                                                />
                                            </label>
                                            {formErrors.pincode && <span className="error-message">{formErrors.pincode}</span>}
                                            <br />
                                            <label className='name-label'>
                                                Country
                                                <input 
                                                    type="text" 
                                                    name="country"
                                                    value={deliveryForm.country}
                                                    onChange={(e) => setDeliveryForm({...deliveryForm, country: e.target.value})}
                                                    placeholder="India"
                                                    required
                                                />
                                            </label>
                                            {formErrors.country && <span className="error-message">{formErrors.country}</span>}
                                        </form>
                                        
                                        
                                        <div className="cart-summary">
                                            <div className="total-section">
                                                <h3>Total: ₹{cart.reduce((acc, item) => acc + item.price * item.quantity, 0)}</h3>
                                            </div>
                                            <div className="cart-actions">
                                                <button type='button' className="continue-btn" onClick={showCart}>
                                                    Continue Shopping
                                                </button>
                                                <button type='submit' className="order-btn" onClick={handleOrder}>
                                                    Place Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className='home-content'>
                {/* Filter and Search Section */}
                <div className="filter-section">
                    <div className="filter-menu">
                        <ul className="filter-tabs">
                            <li><button type='button' onClick={() => handleFilterClick('all')} className={filter === 'all' ? 'filter-tab active' : 'filter-tab'}>All</button></li>
                            <li><button type='button' onClick={() => handleFilterClick('true')} className={filter === 'true' ? 'filter-tab active' : 'filter-tab'}>Veg</button></li>
                            <li><button type='button' onClick={() => handleFilterClick('false')} className={filter === 'false' ? 'filter-tab active' : 'filter-tab'}>Non-Veg</button></li>
                        </ul>
                        
                        <div className="search-sort-container">
                            <input 
                                className='search-box' 
                                type="search" 
                                placeholder='Search your pizza...' 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className='price-sort'>
                            <label htmlFor="price-sort">Sort by: </label>
                            <select 
                                name="price-sort" 
                                id="price-sort" 
                                value={priceSort} 
                                onChange={(e) => { setPriceSort(e.target.value); setCurrentPage(1); }}
                                className="sort-select"
                            >
                                <option value="default">Default: Oldest first</option>
                                <option value="asc">Price: Low to High</option>
                                <option value="desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pizza Grid */}
                <div className='pizza-grid'>
                    {message.length === 0 ? (
                        <p className='no-orders'>No Pizza found</p>
                    ) : (
                        message.map((card, id) => (
                            <div className="pizza-card" key={id}>
                                <img src={card.imageUrl} className="pizza-image" alt={card.name} />
                                <div className="pizza-info">
                                    <h3 className="pizza-name">{card.name}</h3>
                                    <p className="pizza-description">{card.description}</p>
                                    <div className="pizza-footer">
                                        <p className="pizza-price"><strong>₹{card.price}</strong></p>
                                        <button type='button' className="add-to-cart-btn" onClick={() => handleAddToCart(card)}>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {error && <p className="error-message">{error}</p>}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            type='button'
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className='pagination-btn prev-btn'
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type='button'
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className='pagination-btn next-btn'
                        >
                            Next
                        </button>
                    </div>
                )} 
            </div>
        </div>
    )
};

export default HomePage;
