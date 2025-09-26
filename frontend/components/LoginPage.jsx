import axios from 'axios'
import {useState, useContext, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../src/AuthContext';
import '../src/App.css'

function Login () {
    const [FormData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [, setUsers] = useState([]); // this is the state that holds the user data and this the is format
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { setIsAuthenticated, loginUser } = useContext(AuthContext);

    // previous way of email -> password checking (legacy code) [DO NOT REMOVE]
    // const credentials = new Map();
    // credentials.set('user@example.com', 'user1234');
    // credentials.set('admin@example.com', 'admin1234');

    const validate = (users) => {
        const newErrors = {};

        // validating email
        if (!FormData.email || (!/\S+@\S+\.\S+/.test(FormData.email))) newErrors.email = 'Email is Invalid';
        else if (!users.some(user => user.email === FormData.email)) newErrors.email = 'You are not authorized'; 
        // else if (credentials.has(FormData.email) === false) newErrors.email = 'You are not authorized'; (legacy code) [DO NOT REMOVE]

        // validating password
        if (!FormData.password || FormData.password.length < 7) newErrors.password = 'Password must be at least 8 characters';
        else {
            const user = users.find(user => user.email === FormData.email);
            if (user && user.password !== FormData.password) newErrors.password = 'Incorrect password';
        }
        
        // checking email -> password; (legacy code) [DO NOT REMOVE]
        // else if (credentials.get(FormData.email) !== FormData.password) newErrors.password = 'Incorrect password';
            
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...FormData,
            [name]: value
        });

        // remove error when re typing
        setErrors({ name: '', value: ''})

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get('https://slice-heaven-insl.onrender.com/v1/users');
            setUsers(response.data);
            const formErrors = validate(response.data);
            if (Object.keys(formErrors).length === 0) {
                const user = response.data.find(user => user.email === FormData.email);
                loginUser(user); // Store user information
                setIsAuthenticated(true);
                if (FormData.email === 'admin@example.com') navigate('/admin');
                else if (FormData.email !== 'admin@example.com') navigate('/home');
                console.log(`${user.name}, ${user.email}, ${user.password}`);
            } else {
                setErrors(formErrors);
            }
        } catch (error) {
            alert('Failed to fetch user details from backend. Please check your connection');
            setErrors(error, {fetch: 'Failed to fetch user details from backend'});
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100);
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
        <div className="login-page">
            <div className="login-hero-section">
                <div className="login-hero-content">
                    <h1>Welcome Back to Slice Heaven</h1>
                    <p className="login-subtitle">Sign in to continue your pizza journey</p>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-tooltip" title="Use admin@example.com/admin1234 or user@example.com/user1234">💡</div>
                        <div className="form-group">
                            <label className="form-label">
                                Email Address
                                <input
                                    type="email"
                                    id='email'
                                    name='email'
                                    autoComplete='email'
                                    value={FormData.email}
                                    onChange={handleChange}
                                    placeholder='Enter your email'
                                    className="form-input"
                                    required />
                            </label>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Password
                                <input
                                    type="password"
                                    id='password'
                                    name='password'
                                    value={FormData.password}
                                    onChange={handleChange}
                                    placeholder='Enter your password'
                                    className="form-input"
                                    required />
                            </label>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                        <button type="submit" className="login-submit-button">Log In</button>
                    </form>
                    {/* <p className="login-footer-text">
                        Don't have an account? <span className="login-link">Contact support to get started</span>
                    </p> */}
                </div>
                <div className='login-hero-image'>
                    <img src="/dark.jpg" alt="Delicious pizza waiting for you" />
                </div>
            </div>
        </div>
    )
}

export default Login;
