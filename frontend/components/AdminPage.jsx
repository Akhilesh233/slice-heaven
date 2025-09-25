import '../src/App.css'
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../src/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';

function AdminPage () {
    // definition of all the variable states
    const [error, setError] = useState('');
    const [message, setMessage] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderStats, setOrderStats] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchPizzaQuery, setSearchPizzaQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [orderCurrentPage, setOrderCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddPizzaOpen, setIsAddPizzaOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isUpdatePizzaOpen, setIsUpdatePizzaOpen] = useState(false);
    const [updatePizzaForm, setUpdatePizzaForm] = useState(false);
    const [isOrderDetails, setIsOrderDetails] = useState(false);
    const [isAmountDetails, setIsAmountDetails] = useState(false);
    const [isUserDetails, setIsUserDetails] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    // const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [cancelOrder, setCancelOrder] = useState([]);
    // const [removePizza, setRemovePizza] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [statusChange, setStatusChange] = useState([]);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [userDetails, setUserDetails] = useState([]);
    const [editUser, setEditUser] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [addUser, setAddUser] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [editUserForm, setEditUserForm ] = useState(false);
    const [userErrors, setUserErrors] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
    const [deleteUser, setDeleteUser] = useState([]);
    const [visiblePasswords, setVisiblePasswords] = useState({});

    const [pizzaForm, setPizzaForm] = useState({
        name: '',
        description: '',
        price: '',
        veg: true,
        imageUrl: ''
    });
    const [pizzaErrors, setPizzaErrors] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    });

    const ordersPerPage = 5;
    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);

    // Enhanced date formatting to (21 July 2025 at 10:02 AM)
    const handleDateFormat = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        };
        return date.toLocaleString("en-US", options);
    };

    // fetch user details
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get('https://slice-heaven-insl.onrender.com/v1/users');
            setUserDetails(response.data);
        } catch (error) {
            console.log('Failed to fetch user details', error);
            setError('Failed to fetch user details');
        }
    }

    // fetch pizza order Stats
    const fetchOrderStats = async () => {
        try {
            const response = await axios.get('https://slice-heaven-insl.onrender.com/v1/orders/orderStats');
            setOrderStats(response.data);
        } catch (error) {
            console.log('Failed to fetch order Stats', error);
            setError('Failed to fetch order stats');
        }
    };

    // fetch pizza order details with pagination and filters
    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`https://slice-heaven-insl.onrender.com/v1/orders`);
            setOrderDetails(response.data || []);
            setFilteredOrders(response.data || []);
        } catch (error) {
            console.log('Failed to fetch order details', error);
            setError('Failed to fetch order details');
        }
    }

    // fetch pizzas
    const fetchPizzas = async (page = 1, searchPizzaQuery = '') => {
        try {
            let url = 'https://slice-heaven-insl.onrender.com/v1/pizzas';
            if (searchPizzaQuery)
                url += `/filter?&name=${searchPizzaQuery}&page=${page}&limit=6`;
            else
                url += `/filter?&page=${page}&limit=6`;

            const response = await axios.get(url);
            setMessage(response.data.pizzas || response.data);
            setCurrentPage(response.data.page || 1);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching data: ', error);
            setError('Failed to fetch pizzas');
        }
    };

    useEffect(() => {
        fetchOrderStats();
        fetchOrderDetails();
        fetchUserDetails();
    }, []);

    useEffect(() => {
        fetchPizzas(currentPage, searchPizzaQuery);
    }, [currentPage, searchPizzaQuery]);

    useEffect(() => {
        let filtered = [...orderDetails];

        // Search filter functionality (Based on order id or any item/pizza name)
        if (searchFilter) {
            filtered = filtered.filter((order) => 
                order._id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                order.orderItems.some((item) => item.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
                order.user[0]._id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                order.user[0].name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                order.user[0].email.toLowerCase().includes(searchFilter.toLowerCase())
            );
        }

        // Status filter functionality (Based on order status i.e. pending, confirmed, cancelled, preparing, out for delivery)
        if (statusFilter !== 'all')
            filtered = filtered.filter((order) => order.status === statusFilter);

        // Date filter functionality (Based on all time, last week and last month)
        const now = new Date();
        if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter((order) => new Date(order.createdAt) >= weekAgo);
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter((order) => new Date(order.createdAt) >= monthAgo);
        }

        // Sort orders functionality (Based on newest first, oldest first, highest amount and lowest amount)
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'amount-desc':
                    return b.totalPrice - a.totalPrice;
                case 'amount-asc':
                    return a.totalPrice - b.totalPrice;
                default:
                    return 0;
            }
        });

        setFilteredOrders(filtered);
        setOrderCurrentPage(1);
    }, [searchFilter, statusFilter, dateFilter, sortBy, orderDetails]);

    const indexOfLastOrder = orderCurrentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const orderPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // validate the pizza form fields
    const validatePizza = () => {
        const newErrors = {};
        if (!pizzaForm.name || pizzaForm.name.length < 3) newErrors.name = 'Please enter a valid pizza name (at least 3 characters)';
        if (!pizzaForm.description || pizzaForm.description.length < 10) newErrors.description = 'Please enter a valid pizza description (at least 10 characters)';
        if (!pizzaForm.price || pizzaForm.price < 0) newErrors.price = 'Please enter a valid pizza price (non-negative number)';
        if (!pizzaForm.imageUrl || !pizzaForm.imageUrl.startsWith('https')) newErrors.imageUrl = 'Please enter a valid pizza image url (start with https)';

        return newErrors;
    };

    // add pizza functionality
    const addPizza = async (e) => {
        e.preventDefault();

        // validate pizza form field before submission
        const formErrors = validatePizza();
        setPizzaErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;
        try {
            const response = await axios.post('https://slice-heaven-insl.onrender.com/v1/pizzas/add', pizzaForm);
            if (response.status === 201) {
                alert('Pizza added successfully!');
                setIsAddPizzaOpen(false);
                fetchPizzas();
            }
        } catch (error) {
            console.error('Failed to add pizza', error);
            alert('Failed to add pizza');
        }
    };

    // update pizza functionality
    const updatePizza = async (e) => {
        e.preventDefault();

        // validate pizza form field before submission
        const formErrors = validatePizza();
        setPizzaErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;
        try {
            const response = await axios.put(`https://slice-heaven-insl.onrender.com/v1/pizzas/${pizzaForm._id}`, pizzaForm);
            if (response.status === 200) {
                alert('Pizza updated successfully!');
                setUpdatePizzaForm(!updatePizzaForm);
                fetchPizzas();
            }
        } catch (error) {
            console.log('Failed to update pizza', error);
            alert('Failed to update pizza');
        }
    };

    // handle logout functionality
    const handleLogOut = async (e) => {
        e.preventDefault();
        setIsAuthenticated(false);
        navigate('/login');
    };

    // handle as user functionality
    const handleAsUser = async (e) => {
        e.preventDefault();
        setIsAuthenticated(true);
        navigate('/home');
    };

    // toggle delete user functionality
    const showDeleteUser = (user) => {
        setShowDeleteUserConfirm(true);
        setDeleteUser(user);
    }

    // handle confirm delete user functionality
    const confirmDeleteUser = async () => {
        try {
            const response = await axios.delete(`https://slice-heaven-insl.onrender.com/v1/users/${deleteUser._id}`);
            if (response.status === 200) {
                alert('User deleted successfully!');
                setShowDeleteUserConfirm(false);
                fetchUserDetails();
            }
        } catch (error) {
            console.error('Failed to delete the user', error);
            alert('Failed to delete the user');
        }
    }

    // toggle edit user functionality
    const showEditUserForm = (user) => {
        setEditUserForm(!editUserForm);
        setIsAddUserOpen(false);
        setEditUser({
            _id: user._id,
            name: user.name,
            email: user.email,
            password: user.password
        });
        setUserErrors({});
    };

    // validate user form fields
    const validateUserForm = () => {
        const newErrors = {};
        if (!editUser.name || editUser.name.length < 3) newErrors.name = 'Name should be at least 3 characters';
        if (!editUser.email || (!/\S+@\S+\.\S+/.test(editUser.email))) newErrors.email = 'Email Id is Invalid';
        if (!editUser.password || editUser.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        return newErrors;
    }

    // handle save updated user functionality
    const handleSaveUser = async (e) => {
        e.preventDefault();

        // Validate form before submission
        const formErrors = validateUserForm();
        setUserErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;
        try {
            const response = await axios.put(`https://slice-heaven-insl.onrender.com/v1/users/${editUser._id}`, editUser);
            if (response.status === 200) {
                alert('User updated successfully!');
                setEditUser({ name: '', email: '', password: '' });
                setEditUserForm(false);
                fetchUserDetails();
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    // validate the new user form fields
    const validateUser = () => {
        const newErrors = {};
        if (!addUser.name || addUser.name.length < 3) newErrors.name = 'Name should be at least 3 characters';
        if (!addUser.email || (!/\S+@\S+\.\S+/.test(addUser.email))) newErrors.email = 'Email Id is Invalid';
        if (!addUser.password || addUser.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        return newErrors;
    }

    // handle Add user functionality
    const handleAddUser = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        const formErrors = validateUser();
        setUserErrors(formErrors);
        if (Object.keys(formErrors).length > 0) return;
        try {
            const response = await axios.post('https://slice-heaven-insl.onrender.com/v1/users/add', addUser);
            if (response.status === 201) {
                alert('User added successfully!');
                setAddUser({ name: '', email: '', password: '' });
                setIsAddUserOpen(false);
                fetchUserDetails();
            }
        } catch (error) {
            console.error('Failed to add user:', error);
            alert('Failed to add user. Please try again.');
        }
    };

    // handle cancel order functionality
    const handleCancel = (orderId) => {
        setCancelOrder(orderId);
        setShowCancelConfirm(true);
    };

    // handle confirm cancel order functionality
    const confirmCancel = async () => {
        try {
            const orderId = cancelOrder;
            await axios.put(`https://slice-heaven-insl.onrender.com/v1/orders/${orderId}`, {
                status: 'Cancelled'
            });
            fetchOrderDetails();
            setError('');
        } catch (error) {
            console.error('Failed to cancel order:', error);
            alert('Failed to cancel order');
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(!showOrderModal);
    }

    // toggle add user dialog visibility
    const showAddUser = () => {
        setIsAddUserOpen(!isAddUserOpen);
        setEditUserForm(false);
        setIsAddPizzaOpen(false);
        setIsUpdatePizzaOpen(false);
        setAddUser({
            name: '',
            email: '',
            password: ''
        });
        setUserErrors({});
    }

    // toggle add pizza dialog visibility
    const showAddPizza = () => {
        setIsAddPizzaOpen(!isAddPizzaOpen);
        setIsUpdatePizzaOpen(false);
        setIsAddUserOpen(false);
        setPizzaForm({
            name: '',
            description: '',
            price: '',
            veg: true,
            imageUrl: ''
        });
        setPizzaErrors({});
    };

    // toggle update pizza dialog visibility
    const showUpdatePizza = () => {
        setIsUpdatePizzaOpen(!isUpdatePizzaOpen);
        setIsAddPizzaOpen(false);
        setIsAddUserOpen(false);
        setSearchPizzaQuery('');
        setUpdatePizzaForm(false);
        setPizzaForm({
            name: '',
            description: '',
            price: '',
            veg: '',
            imageUrl: ''
        });
        setPizzaErrors({});
    }

    // toggle update pizza form visibility
    const showUpdatePizzaForm = (pizzaData) => {
        setUpdatePizzaForm(!updatePizzaForm);
        setPizzaForm({
            _id: pizzaData._id,
            name: pizzaData.name,
            description: pizzaData.description,
            price: pizzaData.price.toString(),
            veg: pizzaData.veg,
            imageUrl: pizzaData.imageUrl
        });
        setUpdatePizzaForm(true);
        setPizzaErrors({});
    }

    // toggle remove pizza visibility
    // const handleRemovePizza = (pizzaData) => {
    //     setRemovePizza(pizzaData);
    //     setShowRemoveConfirm(true);
    // }

    // handle confirm removal of pizza
    // const confirmRemove = async () => {
    //     try {
    //         const pizzaId = removePizza._id;
    //         await axios.delete(`https://slice-heaven-insl.onrender.com/v1/pizzas/${pizzaId}`);
    //         fetchPizzas();
    //         alert(`${removePizza.name} has been removed`);
    //         setError('');
    //     } catch (error) {
    //         console.error('Failed to remove the pizza', error);
    //         alert('Failed to remove the pizza');
    //     }
    // };

    // handles pagination functionality
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // toggle order details visibility
    const showOrderDetails = () => {
        setIsOrderDetails(!isOrderDetails);
        setIsAmountDetails(false);
        setIsUserDetails(false);
    }

    // toggle Amount details visibility
    const showAmountDetails = () => {
        setIsAmountDetails(!isAmountDetails);
        setIsOrderDetails(false);
        setIsUserDetails(false);
    }

    // toggle Item details visibility
    const showUserDetails = () => {
        setIsUserDetails(!isUserDetails);
        setIsAmountDetails(false);
        setIsOrderDetails(false);
    }

    // toggle password visibility
    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    // get the order status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#6c757d';
            case 'confirmed': return '#ff6347';
            case 'preparing': return '#ffc107';
            case 'out for delivery': return '#17a2b8';
            case 'delivered': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    // get the order status icon
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '📋';
            case 'confirmed': return '✅';
            case 'preparing': return '⏳';
            case 'out for delivery': return '🚚';
            case 'delivered': return '🎉';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    // handles downloadInvoice functionality
    const handleDownloadInvoice = async () => {
        if (!selectedOrder) return;

        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('PIZZA SHOP', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Order Invoice', 105, 30, { align: 'center' });
        
        // Invoice details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Details:', 20, 45);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Order ID: ${selectedOrder._id.slice(-8)}`, 20, 55);
        doc.text(`Ordering Date: ${handleDateFormat(selectedOrder.createdAt)}`, 20, 62);
        {selectedOrder.status == 'Delivered' && doc.text(`Delivered Date: ${handleDateFormat(selectedOrder.deliveredAt)}`, 20, 69)};

        doc.text(`Status: ${selectedOrder.status}`, 20, 76);
        
        // Customer details
        doc.setFont('helvetica', 'bold');
        doc.text('Customer & Delivery Details:', 20, 92);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`User ID: ${selectedOrder.user[0]._id.slice(-8)}`, 20, 105);
        doc.text(`Name: ${selectedOrder.user[0].name}`, 20, 112);
        doc.text(`Email: ${selectedOrder.user[0].email}`, 20, 119);
        doc.text(`Address: ${selectedOrder.deliveryAddress.address}`, 20, 126);
        doc.text(`City: ${selectedOrder.deliveryAddress.city}`, 20, 133);
        doc.text(`Pincode: ${selectedOrder.deliveryAddress.pincode}`, 20, 140);
        doc.text(`Phone: ${selectedOrder.deliveryAddress.phoneNumber}`, 20, 147);
        
        // Items table header
        doc.setFont('helvetica', 'bold');
        doc.text('Items Ordered:', 20, 163);
        
        // Table headers
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, 173);
        doc.text('Qty', 100, 173);
        doc.text('Price', 130, 173);
        doc.text('Total', 160, 173);
        
        // Draw line under headers
        doc.line(20, 176, 190, 176);
        
        // Items
        let yPosition = 183;
        selectedOrder.orderItems.forEach((item) => {
            doc.setFont('helvetica', 'normal');
            doc.text(item.name, 20, yPosition);
            doc.text(item.qty.toString(), 100, yPosition);
            doc.text(`Rs ${item.price}`, 130, yPosition);
            doc.text(`Rs ${item.price * item.qty}`, 160, yPosition);
            yPosition += 10;
        });
        
        // Total
        doc.line(20, yPosition, 190, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Amount:', 130, yPosition + 8);
        doc.text(`Rs ${selectedOrder.totalPrice}`, 160, yPosition + 8);
        
        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Thank you for your order!', 105, yPosition + 30, { align: 'center' });
        doc.text('For any queries, please contact our customer support.', 105, yPosition + 37, { align: 'center' });
        
        // Save the PDF
        doc.save(`invoice-${selectedOrder._id.slice(-8)}.pdf`);
    };

    // handle status change functionality with dropdown input
    const handleStatusChange = async (order, newStatus) => {
        const updatedOrder = { ...order, status: newStatus };
        setStatusChange(updatedOrder);
        setShowStatusConfirm(true);
    };

    // handle confirm status change functionality
    const confirmStatusChange = async () => {
        try {
            const order = statusChange;
            await axios.put(`https://slice-heaven-insl.onrender.com/v1/orders/${order._id}`, {
                status: order.status
            });
            fetchOrderDetails();
            setError('');
            setShowStatusConfirm(false);
            setStatusChange(null);
        } catch (error) {
            console.error('Failed to update order status: ', error);
            alert('Requested status change is in conflict with the allowed status transition');
        }
    };

    // Status dropdown component for flexible status changes
    const StatusDropdown = ({ currentStatus, order }) => {
        const statusOptions = [
            'Pending',
            'Confirmed',
            'Preparing',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ];

        return (
            <select 
                value={currentStatus}
                onChange={(e) => handleStatusChange(order, e.target.value)}
                className="status-dropdown"
                disabled={currentStatus == 'Cancelled' || currentStatus == 'Delivered'}
                style={{ backgroundColor: getStatusColor(currentStatus), border: `1px solid ${getStatusColor(currentStatus)}` }}
            >
                {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        );
    };

    return (
        <div className="admin-page">
            {/* Header Section */}
            <div className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <div className="admin-header-buttons">
                    <button className='header-btn' onClick={handleAsUser}>As User</button>
                    <button className='header-btn' onClick={handleLogOut}>Log Out</button>
                </div>
            </div>

            <div className='admin-content'>
                <div className='admin-button-box'>
                    <button className='admin-action-btn' type='submit' onClick={showAddPizza}>Add Pizza</button>
                    <button className='admin-action-btn' type='submit' onClick={showUpdatePizza}>Update Pizza</button>
                </div>
                
                {/* Add Pizza Dialog - Floating Modal */}
                {isAddPizzaOpen && (
                    <div className='cart-modal-overlay'>
                        <div className='cart-dialog' onClick={(e) => e.stopPropagation()}>
                            <div className="cart-content">
                                <button className="close-btn" onClick={showAddPizza} title="Close">X</button>
                                <h2>Add New Pizza</h2>
                                <div>
                                    <form className='addPizza-form' onSubmit={addPizza}>
                                        <label className='name-label'>
                                            Pizza Name
                                            <input
                                                type="text"
                                                name='Pizza Name'
                                                value={pizzaForm.name}
                                                title='Enter the name of Pizza'
                                                onChange={(e) => setPizzaForm({...pizzaForm, name: e.target.value})}
                                                placeholder='Paneer Tadka Pizza' required
                                            />
                                        </label>
                                        {pizzaErrors.name && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.name}</span>}
                                        <br />
                                        <label className='name-label'>
                                            Description
                                            <input 
                                                type="text" 
                                                name="description"
                                                value={pizzaForm.description}
                                                title='Add description of the Pizza'
                                                onChange={(e) => setPizzaForm({...pizzaForm, description: e.target.value})}
                                                placeholder="Pizza with tadka paneer and spices"
                                                required
                                            />
                                        </label>
                                        {pizzaErrors.description && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.description}</span>}
                                        <br />
                                        <label className='name-label'>
                                            Price
                                            <input 
                                                type="text" 
                                                name="Price"
                                                value={pizzaForm.price}
                                                title='Set price of the Pizza'
                                                onChange={(e) => setPizzaForm({...pizzaForm, price: e.target.value})}
                                                placeholder="₹239"
                                                required
                                            />
                                        </label>
                                        {pizzaErrors.price && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.price}</span>}
                                        <br />
                                        <label className='name-label'>
                                            Veg/Non-Veg
                                            <select className='veg-non-veg'
                                                name='veg/non-veg'
                                                id='veg/non-veg'
                                                value={pizzaForm.veg}
                                                onChange={(e) => setPizzaForm({...pizzaForm, veg: e.target.value === 'true'})}
                                                required
                                            >
                                                <option value="true">Veg</option>
                                                <option value="false">Non-Veg</option>
                                            </select>
                                        </label>
                                        {pizzaErrors.veg && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.veg}</span>}
                                        <br />
                                        <label className='name-label'>
                                            Image URL
                                            <input 
                                                type="href" 
                                                name="Image Url"
                                                value={pizzaForm.imageUrl}
                                                title='Paste the image url here'
                                                onChange={(e) => setPizzaForm({...pizzaForm, imageUrl: e.target.value})}
                                                placeholder="Choose a pizza image"
                                                required
                                            />
                                        </label>
                                        {pizzaErrors.imageUrl && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.imageUrl}</span>}
                                        <br />
                                        <button className='admin-stats-btn' type='submit'>Add the Pizza</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Pizza Dialog - Floating Modal */}
                {isUpdatePizzaOpen && (
                    <div className='cart-modal-overlay'>
                        <div className='updateCart-dialog' onClick={(e) => e.stopPropagation()}>
                            <div className="cart-content">
                                <button className="close-btn" onClick={showUpdatePizza} title="Close">X</button>
                                <h1>Update Pizza</h1>
                                <nav className="filter-menu">
                                    {/* search box feature */}
                                    <input className='adminSearch-box' type="search" placeholder='Search pizza to update' onChange={(e) => setSearchPizzaQuery(e.target.value)} />
                                </nav>

                                {/* display the contents from backend in the card container */}
                                <div className='pizza-grid'>
                                    {message.map((card, id) => (
                                        <div className="pizza-card" key={id}>
                                            <img src={card.imageUrl} className="pizza-image" alt={card.name} />
                                            <div className='pizza-info'>
                                                <h3 className='pizza-name'>Pizza ID: {card._id.slice(-8)}</h3>
                                                <h3 className='pizza-name'>{card.name}</h3>
                                                <p className='pizza-description'>{card.description}</p>
                                                <div className='pizza-footer'>
                                                    <p className='pizza-price'>₹{card.price}</p>
                                                    <button className='admin-stats-btn' type='button' onClick={() => showUpdatePizzaForm(card)}>Update</button>
                                                    {/* <button type='button' onClick={() => handleRemovePizza(card)} className='reorder-no-btn'>Remove</button> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Update pizza form */}
                                    {updatePizzaForm && (
                                        <div className='cart-modal-overlay'>
                                            <div className='cart-dialog' onClick={(e) => e.stopPropagation()}>
                                                <div className="cart-content">
                                                    <button className="close-btn" onClick={showUpdatePizzaForm} title="Close">X</button>
                                                    <h2>Update {pizzaForm.name} Pizza</h2>
                                                    <div>
                                                        <form className='updatePizza-form' onSubmit={updatePizza} style={{position: 'static', borderRadius: '8px', border: '1px solid #dee2e6', margin: '0', backgroundColor: '#f8f9fa', maxWidth: '557px'}}>
                                                            <label className='name-label'>
                                                                Pizza Name
                                                                <input
                                                                    type="text"
                                                                    name='Pizza Name'
                                                                    value={pizzaForm.name}
                                                                    title='Enter the name of Pizza'
                                                                    onChange={(e) => setPizzaForm({...pizzaForm, name: e.target.value})}
                                                                    placeholder='Paneer Tadka Pizza' required
                                                                />
                                                            </label>
                                                            {pizzaErrors.name && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.name}</span>}
                                                            <br />
                                                            <label className='name-label'>
                                                                Pizza Description
                                                                <input 
                                                                    type="text" 
                                                                    name="description"
                                                                    value={pizzaForm.description}
                                                                    title='Add description of the Pizza'
                                                                    onChange={(e) => setPizzaForm({...pizzaForm, description: e.target.value})}
                                                                    placeholder="Pizza with tadka paneer and spices"
                                                                    required
                                                                />
                                                            </label>
                                                            {pizzaErrors.description && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.description}</span>}
                                                            <br />
                                                            <label className='name-label'>
                                                                Price
                                                                <input 
                                                                    type="text" 
                                                                    name="Price"
                                                                    value={pizzaForm.price}
                                                                    title='Set price of the Pizza'
                                                                    onChange={(e) => setPizzaForm({...pizzaForm, price: e.target.value})}
                                                                    placeholder="₹239"
                                                                    required
                                                                />
                                                            </label>
                                                            {pizzaErrors.price && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.price}</span>}
                                                            <br />
                                                            <label className='name-label'>
                                                                Veg/Non-Veg
                                                                <select className='veg-non-veg'
                                                                    name='veg/non-veg'
                                                                    id='veg/non-veg'
                                                                    value={pizzaForm.veg}
                                                                    onChange={(e) => setPizzaForm({...pizzaForm, veg: e.target.value === 'true'})}
                                                                    required
                                                                >
                                                                    <option value="true">Veg</option>
                                                                    <option value="false">Non-Veg</option>
                                                                </select>
                                                            </label>
                                                            {pizzaErrors.veg && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.veg}</span>}
                                                            <br />
                                                            <label className='name-label'>
                                                                Image URL
                                                                <input 
                                                                    type="href" 
                                                                    name="Image Url"
                                                                    value={pizzaForm.imageUrl}
                                                                    title='Paste the image url here'
                                                                    onChange={(e) => setPizzaForm({...pizzaForm, imageUrl: e.target.value})}
                                                                    placeholder="Choose a pizza image"
                                                                    required
                                                                />
                                                            </label>
                                                            {pizzaErrors.imageUrl && <span className='error-message' style={{ fontSize: 'small', margin: '0 0 0 170px' }}>{pizzaErrors.imageUrl}</span>}
                                                            <br />
                                                            <button className='admin-stats-btn' type='submit'>Update the Pizza</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* pagination controls */}
                                <div className="pagination-controls">
                                    <button type='button' className='pagination-btn prev-btn' onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                                    <span className="page-info">Page {currentPage} of {totalPages}</span>
                                    <button type='button' className='pagination-btn next-btn' onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className='admin-grid-container'>
                    <div className='admin-stats-card'>
                        <h2 className='admin-stats-title'>Total Orders</h2>
                        <h3 className='admin-stats-value'>{orderStats.totalOrders}</h3>
                        <button className='admin-stats-btn' type='button' onClick={showOrderDetails}>Order Details</button>
                    </div>
                    <div className='admin-stats-card'>
                        <h2 className='admin-stats-title'>Total Amount</h2>
                        <h3 className='admin-stats-value'>₹{orderStats.totalAmount}</h3>
                        <button className='admin-stats-btn' type='button' onClick={showAmountDetails}>Amount Details</button>
                    </div>
                    <div className='admin-stats-card'>
                        <h2 className='admin-stats-title'>Total Users</h2>
                        <h3 className='admin-stats-value'>{orderStats.totalUsers-1}</h3>
                        <button className='admin-stats-btn' type='button' onClick={showUserDetails}>User Details</button>
                    </div>
                </div>
                {error && <p style={{color: 'red', margin: '0 0 0 10px'}}>{error}</p>}

                {/* Order Details box */}
                {isOrderDetails && (
                    <div className='cardbox'>
                        <div className='details-card'>
                            <h1>List of all Orders</h1>
                            <div>

                                {/* Search and Filters */}
                                <div className='search-filter-box'>
                                    <div className='filter-box'>
                                        <input
                                            type="search"
                                            placeholder="Search orders..."
                                            value={searchFilter}
                                            onChange={(e) => setSearchFilter(e.target.value)}
                                            className='search-bar'
                                        />
                                        
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className='status-bar'
                                        >
                                            <option value="all">All Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Preparing">Preparing</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>

                                        <select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className='date-bar'
                                        >
                                            <option value="all">All Time</option>
                                            <option value="week">Last Week</option>
                                            <option value="month">Last Month</option>
                                        </select>

                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className='sort-bar'
                                        >
                                            <option value="date-desc">Newest First</option>
                                            <option value="date-asc">Oldest First</option>
                                            <option value="amount-desc">Highest Amount</option>
                                            <option value="amount-asc">Lowest Amount</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Orders List */}
                                <div>
                                    {currentOrders.length === 0 ? (
                                        <p className='no-orders'>No orders found</p>
                                    ) : (
                                        currentOrders.map((order) => (
                                            <div key={order._id} className='orders-list'>
                                                <div className='orders-card'>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Order ID: {order._id.slice(-8)}</h3>
                                                        <p className='date-format'>
                                                            Ordering Date: {handleDateFormat(order.createdAt)}<br/>
                                                            {order.status == 'Delivered' && <>Delivery Date: {handleDateFormat(order.deliveredAt)}</>}
                                                        </p>
                                                        <p className='date-format'>
                                                            User ID: {order.user[0]._id.slice(-8)}<br/>
                                                            User Name: {order.user[0].name}<br/>
                                                            User Email: {order.user[0].email}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <StatusDropdown
                                                            currentStatus={order.status}
                                                            order={order}
                                                        />
                                                        <p className='price-card'>₹{order.totalPrice}</p>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: '10px' }}>
                                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Items:</p>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        {order.orderItems.slice(0, 3).map((item, idx) => (
                                                            <span key={idx} className='items-list-card' style={{backgroundColor: '#f8f9fa'}}>{item.name} x{item.qty}</span>
                                                        ))}
                                                        {order.orderItems.length > 3 && (
                                                            <span className='items-list-card' style={{backgroundColor: '#e9ecef'}}>+{order.orderItems.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* View details, cancel button */}
                                                <div className='admin-button-box'>
                                                    <button onClick={() => openOrderModal(order)} className='myorders-order-details-btn'>
                                                        View Order Details
                                                    </button>
                                                    <button onClick={() => handleCancel(order._id)}
                                                        disabled={
                                                            order.status == 'Out for Delivery' ||
                                                            order.status == 'Cancelled' ||
                                                            order.status == 'Delivered'
                                                        }
                                                        className='myorders-cancel-btn'>
                                                        Cancel Order
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Order Details Modal */}
                                {showOrderModal && selectedOrder && (
                                    <div className='orderdetails-modal'>
                                        <div className='order-details-modal-content'>
                                            <div className='content-title'>
                                                <h2>Order Details</h2>
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <h3><strong>Order ID:</strong> {selectedOrder._id.slice(-8)}</h3>
                                                <p>
                                                    <strong>Ordering Date:</strong> {handleDateFormat(selectedOrder.createdAt)}<br/>
                                                    {selectedOrder.status == 'Delivered' && <><strong>Delivery Date:</strong> {handleDateFormat(selectedOrder.deliveredAt)}</>}
                                                </p>
                                                <p>
                                                    <strong>User ID: </strong>{selectedOrder.user[0]._id.slice(-8)}<br/>
                                                    <strong>User Name: </strong>{selectedOrder.user[0].name}<br/>
                                                    <strong>User Email: </strong>{selectedOrder.user[0].email}
                                                </p>
                                                <p><strong>Status: </strong> 
                                                    <span className='status-card' style={{ backgroundColor: getStatusColor(selectedOrder.status)}}>
                                                        {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                                                    </span>
                                                </p>
                                                <p><strong>Total:</strong> ₹{selectedOrder.totalPrice}</p>
                                            </div>

                                            {/* list of items Ordered */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4><strong>Items Ordered:</strong></h4>
                                                {selectedOrder.orderItems.map((item, idx) => (
                                                    <div key={idx} className='items-list-modal'>
                                                        <div>
                                                            <strong>{item.name}</strong>
                                                            <p style={{ color: '#666' }}>₹{item.price} each</p>
                                                        </div>
                                                        <div>
                                                            <p>Qty: {item.qty}</p>
                                                            <strong>₹{item.price * item.qty}</strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Delivery Address */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4><strong>Delivery Address:</strong></h4>
                                                <p>{selectedOrder.deliveryAddress.address}</p>
                                                <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.pincode}</p>
                                                <p>Phone No: {selectedOrder.deliveryAddress.phoneNumber}</p>
                                            </div>

                                            {/* Invoice and close button */}
                                            <div className='invoice-close-btn'>
                                                <button onClick={handleDownloadInvoice} className='invoice-btn'>
                                                    Download Invoice
                                                </button>
                                                <button onClick={() => setShowOrderModal(false)} className='exit-btn'>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Show Status Confirmation Modal */}
                                {showStatusConfirm && (
                                    <div className='reorder-modal'>
                                        <div className='reorder-modal-content' style={{ maxWidth: '400px', textAlign: 'center' }}>
                                            <strong>Confirm Status Change</strong>
                                            <p>Status Changing: {selectedOrder.status} to {statusChange.status}</p>
                                            <div className='orderslist-pagination'>
                                                <button type='button' onClick={() => { confirmStatusChange(); setShowStatusConfirm(false);}} className='reorder-yes-btn'>
                                                    Ok
                                                </button>
                                                <button type='button' onClick={() => setShowStatusConfirm(false)} className='reorder-no-btn'>
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cancel Confirmation Modal */}
                                {showCancelConfirm && (
                                    <div className='reorder-modal'>
                                        <div className='reorder-modal-content' style={{ maxWidth: '400px', textAlign: 'center' }}>
                                            <strong>Confirm Cancel</strong>
                                            <p>Are you sure you want to Cancel this order?</p>
                                            <div className='orderslist-pagination'>
                                                <button type='button' onClick={() => { confirmCancel(); setShowCancelConfirm(false);}} className='reorder-yes-btn'>
                                                    Yes
                                                </button>
                                                <button type='button' onClick={() => setShowCancelConfirm(false)} className='reorder-no-btn'>
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order List Pagination */}
                                {orderPages > 1 && (
                                    <div className='pagination-controls'>
                                        <button
                                            type='button'
                                            onClick={() => setOrderCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={orderCurrentPage === 1}
                                            className='pagination-btn prev-btn'
                                        >
                                            Previous
                                        </button>
                                        <span style={{ padding: '8px 16px' }}>
                                            Page {orderCurrentPage} of {orderPages}
                                        </span>
                                        <button
                                            type='button'
                                            onClick={() => setOrderCurrentPage(prev => Math.min(prev + 1, orderPages))}
                                            disabled={orderCurrentPage === orderPages}
                                            className='pagination-btn next-btn'
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Amount Details box */}
                {isAmountDetails && (
                    <div className='cardbox'>
                        <div className='details-card'>
                            <h1>Amount Analysis</h1>
                            <div className='details'>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Details box */}
                {isUserDetails && (
                    <div className='cardbox'>
                        <div className='details-card'>
                            <h1>List of Users</h1>
                            <button className='adduser-btn' type='button' onClick={showAddUser}>Add User</button>
                            <div className='details'>
                                {userDetails.length === 0 ? (
                                    <p>No users found</p>
                                ) : (
                                    <div className='users-table-container'>
                                        <table className='users-table'>
                                            <thead>
                                                <tr>
                                                    <th>User ID</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Password</th>
                                                    <th>Created At</th>
                                                    <th>Updated At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userDetails.filter(user => user.name !== 'Admin1').map((user) => (
                                                    <tr key={user._id}>
                                                        <td>{user._id.slice(-8)}</td>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                {visiblePasswords[user._id] ? user.password : '••••••••'}
                                                                <span 
                                                                    onClick={() => togglePasswordVisibility(user._id)}
                                                                    style={{ cursor: 'pointer', fontSize: '14px', padding: '0 0 0 5px' }}
                                                                    title={visiblePasswords[user._id] ? 'Hide password' : 'Show password'}
                                                                >
                                                                    {visiblePasswords[user._id] ? '👁️' : '👁️‍🗨️'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>{handleDateFormat(user.createdAt)}</td>
                                                        <td>{handleDateFormat(user.updatedAt)}</td>
                                                        <td>
                                                            <span 
                                                                onClick={() => showEditUserForm(user)} 
                                                                style={{ cursor: 'pointer', marginRight: '10px', padding: '0' }}
                                                                title="Edit user"
                                                            >
                                                                📝
                                                            </span>
                                                            <span 
                                                                onClick={() => showDeleteUser(user)}
                                                                style={{ cursor: 'pointer', padding: '0' }}
                                                                title="Delete user"
                                                            >
                                                                ❌
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add User Dialog - Floating Modal */}
                {isAddUserOpen && (
                    <div className='cart-modal-overlay'>
                        <div className='cart-dialog' style={{ width: '440px'}} onClick={(e) => e.stopPropagation()}>
                            <div className='cart-content'>
                                <button className='close-btn' onClick={showAddUser}>X</button>
                                <h2>Add User Details</h2>
                                <div>
                                    <form onSubmit={handleAddUser} style={{position: 'static', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', margin: '0'}}>
                                        <label className='email-label'>
                                            Name
                                            <input
                                                type="text"
                                                name='User name'
                                                value={addUser.name}
                                                title='Enter the user name'
                                                onChange={(e) => setAddUser({ ...addUser, name: e.target.value })}
                                                placeholder='User1' required
                                            />
                                        </label>
                                        {userErrors.name && <span className='error-message' style={{ margin: '0 0 0 95px', fontSize: 'Small' }}>{userErrors.name}</span>}
                                        <br/>
                                        <label className='email-label'>
                                            Email
                                            <input 
                                                type="email"
                                                name="User email"
                                                value={addUser.email}
                                                title='Enter the user email'
                                                onChange={(e) => setAddUser({...addUser, email: e.target.value})}
                                                placeholder="user1@example.com" required
                                            />
                                        </label>
                                        {userErrors.email && <span className='error-message' style={{ margin: '0 0 0 95px', fontSize: 'Small' }}>{userErrors.email}</span>}
                                        <br/>
                                        <label className='email-label'>
                                            Password
                                            <input 
                                                type="text"
                                                name="User password"
                                                value={addUser.password}
                                                title='Enter the user password'
                                                onChange={(e) => setAddUser({...addUser, password: e.target.value})}
                                                placeholder="user1234" required
                                            />
                                        </label>
                                        {userErrors.password && <span className='error-message' style={{ margin: '0 0 0 95px', fontSize: 'Small' }}>{userErrors.password}</span>}
                                        <br/>
                                        <button type='submit'>Add the User</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User modal form */}
                {editUserForm && (
                    <div className='cart-modal-overlay'>
                        <div className='cart-dialog' style={{ width: '440px'}} onClick={(e) => e.stopPropagation()}>
                            <div className="cart-content">
                                <button className="close-btn" onClick={showEditUserForm} title="Close">X</button>
                                <h2>Edit User Details</h2>
                                <div>
                                    <form onSubmit={handleSaveUser} style={{position: 'static', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', margin: '0'}}>
                                        <label className='email-label'>
                                            Name
                                            <input
                                                type="text"
                                                name='User name'
                                                value={editUser.name}
                                                title='Enter the user name'
                                                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                                placeholder='User1' required
                                            />
                                        </label>
                                        {userErrors.name && <span className='error-message' style={{ margin: '0 0 0 95px', fontSize: 'Small' }}>{userErrors.name}</span>}
                                        <br/>
                                        <label className='email-label'>
                                            Email
                                            <input 
                                                type="email"
                                                name="User email"
                                                value={editUser.email}
                                                title='Enter the user email'
                                                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                                                placeholder="user1@example.com" required
                                            />
                                        </label>
                                        {userErrors.email && <span className='error-message' style={{ margin: '0 0 0 95px', fontSize: 'Small' }}>{userErrors.email}</span>}
                                        <br/>
                                        <label className='password-label'>
                                            Password
                                            <input 
                                                type="text"
                                                name="User password"
                                                value={editUser.password}
                                                title='Enter the user password'
                                                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                                                placeholder="user1234" required
                                            />
                                        </label>
                                        {userErrors.password && <span className='error-message' style={{ margin: '0 0 0 95px', fontSize: 'Small' }}>{userErrors.password}</span>}
                                        <br/>
                                        <button type='submit'>Save the Changes</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                )}

                {/* Delete User Confirmation Modal */}
                {showDeleteUserConfirm && (
                    <div className='reorder-modal'>
                        <div className='reorder-modal-content' style={{ maxWidth: '400px', textAlign: 'center'}}>
                            <strong>Confirm User Deletion</strong>
                            <p>Are you sure you want to delete this user?</p>
                            <div className='orderslist-pagination'>
                                <button onClick={() => { confirmDeleteUser(); setShowDeleteUserConfirm(false);}} className='reorder-yes-btn'>
                                    Yes
                                </button>
                                <button onClick={() => setShowDeleteUserConfirm(false)} className='reorder-no-btn'>
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remove Pizza COnfirmation Modal */}
                {/* {showRemoveConfirm && (
                    <div className='reorder-modal'>
                        <div className='reorder-modal-content' style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <strong>Confirm Removal of {removePizza.name}</strong>
                            <p>Are you sure you want to remove this pizza?</p>
                            <div className='orderslist-pagination'>
                                <button onClick={() => { confirmRemove(); setShowRemoveConfirm(false);}} className='reorder-yes-btn'>
                                    Yes
                                </button>
                                <button onClick={() => setShowRemoveConfirm(false)} className='reorder-no-btn'>
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    )
}

export default AdminPage;
