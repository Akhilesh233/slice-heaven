/* eslint-disable react-hooks/exhaustive-deps */
import '../src/App.css'
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../src/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';

function MyOrdersPage () {
    // definition of all variables and their states
    const [error, setError] = useState('');
    const [message, setMessage] = useState([]);
    const [OrderDetails, setOrderDetails] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [showOrderModal, setShowOrderModal] = useState(false);
    // const [showReorderConfirm, setShowReorderConfirm] = useState(false);
    // const [orderToReorder, setOrderToReorder] = useState([]);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelOrder, setCancelOrder] = useState([]);

    const ordersPerPage = 5;
    const navigate = useNavigate();
    const { setIsAuthenticated, user } = useContext(AuthContext);

    // handles back to home page functionality
    const handleBackToHome = async (e) => {
        e.preventDefault();
        navigate('/home');
    };

    // handles log out functionality
    const handleLogOut = async (e) => {
        e.preventDefault();
        setIsAuthenticated(false);
        navigate('/login');
    };

    // handles custom date format functionality (i.e. August 9, 2025 at 10:02 AM)
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
    }

    // handles fetching orders stats functionality
    const fetchOrderStats = async () => {
        try {
            if (!user || !user._id) {
                setError('User not logged in');
                return;
            }
            const response = await axios.get(`https://slice-heaven-insl.onrender.com/v1/orders/userOrderStats/${user._id}`);
            setMessage(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch orders from backend', error);
        }
    }

    // handles fetching orders details functionality
    const fetchOrderDetails = async () => {
        try {
            if (!user || !user._id) {
                setError('User not logged in');
                return;
            }
            const response = await axios.get(`https://slice-heaven-insl.onrender.com/v1/orders/${user._id}`);
            setOrderDetails(response.data);
            setFilteredOrders(response.data);
        } catch (error) {
            console.error('Error fetching order details from backend:', error.message);
            // setError('Failed to fetch order details from backend', error);
        }
    }

    useEffect(() => {
        fetchOrderStats();
        fetchOrderDetails();
    }, []);

    useEffect(() => {
        let filtered = [...OrderDetails];

        // Search filter functionality (Based on order id or any item/pizza name)
        if (searchFilter) {
            filtered = filtered.filter((order) => 
                order._id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                order.orderItems.some((item) => item.name.toLowerCase().includes(searchFilter.toLowerCase()))
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
        setCurrentPage(1);
    }, [searchFilter, statusFilter, dateFilter, sortBy, OrderDetails]);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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

    // handle reorder functionality
    // const handleReorder = (order) => {
    //     setOrderToReorder(order);
    //     setShowReorderConfirm(true);
    // };

    // handle cancel functionality
    const handleCancel = (orderId) => {
        setCancelOrder(orderId);
        setShowCancelConfirm(true);
    }

    // handle reorder confirm functionality [TO BE IMPLEMENTED]
    // const confirmReorder = () => {
    //     // Navigate to home with order items pre-added to cart
    //     navigate({ pathname: '/home', state: orderToReorder.orderItems });
    // };

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
            setError('Failed to cancel order', error);
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(!showOrderModal);
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
        doc.text(`Address: ${selectedOrder.deliveryAddress.address}`, 20, 105);
        doc.text(`City: ${selectedOrder.deliveryAddress.city}`, 20, 112);
        doc.text(`Pincode: ${selectedOrder.deliveryAddress.pincode}`, 20, 119);
        doc.text(`Phone: ${selectedOrder.deliveryAddress.phoneNumber}`, 20, 126);
        
        // Items table header
        doc.setFont('helvetica', 'bold');
        doc.text('Items Ordered:', 20, 145);
        
        // Table headers
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, 155);
        doc.text('Qty', 100, 155);
        doc.text('Price', 130, 155);
        doc.text('Total', 160, 155);
        
        // Draw line under headers
        doc.line(20, 158, 190, 158);
        
        // Items
        let yPosition = 165;
        selectedOrder.orderItems.forEach((item) => {
            doc.setFont('helvetica', 'normal');
            doc.text(item.name, 20, yPosition);
            doc.text(item.qty.toString(), 100, yPosition);
            doc.text(`Rs ${item.price}`, 130, yPosition);
            doc.text(`Rs ${item.price * item.qty}`, 160, yPosition);
            yPosition += 10;
        });
        
        // Total
        doc.line(20, yPosition + 5, 190, yPosition + 5);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Amount:', 130, yPosition + 15);
        doc.text(`Rs ${selectedOrder.totalPrice}`, 160, yPosition + 15);
        
        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Thank you for your order!', 105, yPosition + 35, { align: 'center' });
        doc.text('For any queries, please contact our customer support.', 105, yPosition + 42, { align: 'center' });
        
        // Save the PDF
        doc.save(`invoice-${selectedOrder._id.slice(-8)}.pdf`);
    };

    return (
        <div className="admin-page">
            {/* Header Section */}
            <div className="admin-header">
                <h1 className="admin-title">My Orders</h1>
                <div className="admin-header-buttons">
                    <button type='button' className='header-btn' onClick={handleBackToHome}>Home</button>
                    <button type='button' className='header-btn' onClick={handleLogOut}>Log Out</button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className='admin-content'>
                <div className='admin-grid-container'>
                    <div className='admin-stats-card'>
                        <h2 className='admin-stats-title'>Total Orders</h2>
                        <h3 className='admin-stats-value'>{message.totalOrders}</h3>
                    </div>
                    <div className='admin-stats-card'>
                        <h2 className='admin-stats-title'>Total Amount</h2>
                        <h3 className='admin-stats-value'>₹{message.totalAmount}</h3>
                    </div>
                    <div className='admin-stats-card'>
                        <h2 className='admin-stats-title'>Total Items</h2>
                        <h3 className='admin-stats-value'>{message.totalItems}</h3>
                    </div>
                </div>

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
                {error && <p style={{color: 'red', margin: '0 0 0 10px'}}>{error}</p>}

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
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className='status-card' style={{ backgroundColor: getStatusColor(order.status) }}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                        <p className='price-card'>₹{order.totalPrice}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Items:</p>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {order.orderItems.slice(0, 3).map((item, idx) => (
                                            <span key={idx} className='items-list-card'>{item.name} x{item.qty}</span>
                                        ))}
                                        {order.orderItems.length > 3 && (
                                            <span className='items-list-card'>+{order.orderItems.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* View details, cancel and Reorder button */}
                                <div className='myorders-orderdetails-reorder-card'>
                                    <button type='button' onClick={() => openOrderModal(order)} className='myorders-order-details-btn'>
                                        View Order Details
                                    </button>
                                    <button type='button' onClick={() => handleCancel(order._id)}
                                        disabled={
                                            order.status == 'Out for Delivery'||
                                            order.status == 'Cancelled' ||
                                            order.status == 'Delivered'
                                        }
                                        className='myorders-cancel-btn'>
                                        Cancel Order
                                    </button>
                                    {/* <button type='button' onClick={() => handleReorder(order)} className='myorders-reorder-btn'>
                                        Reorder
                                    </button> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Order List Pagination */}
                {totalPages > 1 && (
                    <div className='pagination-controls'>
                        <button
                            type='button'
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className='pagination-btn prev-btn'
                        >
                            Previous
                        </button>
                        <span style={{padding: '8px 16px' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type='button'
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className='pagination-btn next-btn'
                        >
                            Next
                        </button>
                    </div>
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
                            <button type='button' onClick={handleDownloadInvoice} className='invoice-btn'>
                                Download Invoice
                            </button>
                            <button type='button' onClick={() => setShowOrderModal(false)} className='exit-btn'>
                                Close
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
        </div>
    )
}

export default MyOrdersPage;
