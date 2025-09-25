import Order from "../models/ordermodel.js";
import User from "../models/usermodel.js";

// get order Stats
export const getOrderStats = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email");
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        const totalItems = orders.reduce((acc, order) => acc + order.orderItems.length, 0);
        const totalUsers = await User.countDocuments();
        const orderStats = {
            totalOrders,
            totalAmount,
            totalItems,
            totalUsers
        };
        res.status(200).json(orderStats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order stats", error: error.message });
    }
}

// get order stats for a specific user
export const getUserOrderStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const ordersForUser = await Order.find({ user: { $elemMatch: { _id: userId } } });
        const totalOrders = ordersForUser.length;
        const totalAmount = ordersForUser.reduce((acc, order) => acc + order.totalPrice, 0);
        const totalItems = ordersForUser.reduce((acc, order) => acc + order.orderItems.length, 0);
        
        const orderStats = {
            totalOrders,
            totalAmount,
            totalItems
        };
        res.status(200).json(orderStats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user order stats", error: error.message });
    }
}

// get all orders for all users
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").sort({createdAt: -1});
        if (!orders)
            return res.status(404).json('There are no orders');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({message: "Error fetching orders", error: error.message});
    }
}

// get paginated orders with optional filters and sorting
export const getPaginatedOrders = async (req, res) => {
    try {
        let filter = {};
        let sort = { createdAt: -1 };

        // Filters
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { _id: { $regex: searchRegex } },
                { 'orderItems.name': { $regex: searchRegex } },
                { 'user.name': { $regex: searchRegex } },
                { 'user.email': { $regex: searchRegex } }
            ];
        }

        // Date filter
        if (req.query.dateFilter) {
            const now = new Date();
            if (req.query.dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filter.createdAt = { $gte: weekAgo };
            } else if (req.query.dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filter.createdAt = { $gte: monthAgo };
            }
        }

        // Sorting
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'date-desc':
                    sort = { createdAt: -1 };
                    break;
                case 'date-asc':
                    sort = { createdAt: 1 };
                    break;
                case 'amount-desc':
                    sort = { totalPrice: -1 };
                    break;
                case 'amount-asc':
                    sort = { totalPrice: 1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("user", "name email")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            orders,
            page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching paginated orders", error: error.message });
    }
}

// get all orders for a user
export const getOrderByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.params.id;
        if (!userId)
            return res.status(400).json({ message: "User ID is required" });
        const ordersForUser = await Order.find({ user: { $elemMatch: { _id: userId } } }).populate("user", "name email").sort({ createdAt: -1 });
        if (!ordersForUser || ordersForUser.length === 0)
            return res.status(404).json({ message: "No orders found for this user" });
        res.status(200).json(ordersForUser);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders by user ID", error: error.message });
    }
}

// add order
export const addOrder = async (req, res) => {
    try {
        const { userId, ...orderData } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required to create order" });
        }
        // Fetch user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Create new order with user info
        const newOrder = new Order({
            ...orderData,
            user: [{
                _id: user._id,
                name: user.name,
                email: user.email
            }]
        });
        // check for duplicate orders - same user, same items within last 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        // First check if there's an existing order with same user within the time window
        const recentOrders = await Order.find({
            'user._id': user._id,
            createdAt: { $gte: tenMinutesAgo }
        });

        // Check if any recent order has the exact same items (in any order) and same delivery address
        const isDuplicate = recentOrders.some(recentOrder => {
            if (recentOrder.orderItems.length !== newOrder.orderItems.length) {
                return false;
            }
            
            // Check if delivery addresses match
            const recentAddress = recentOrder.deliveryAddress;
            const newAddress = newOrder.deliveryAddress;
            
            // Compare delivery address fields - all must match exactly
            const addressFieldsMatch = recentAddress && newAddress &&
                recentAddress.phoneNumber === newAddress.phoneNumber &&
                recentAddress.address === newAddress.address &&
                recentAddress.city === newAddress.city &&
                recentAddress.pincode === newAddress.pincode &&
                recentAddress.country === newAddress.country;
            
            if (!addressFieldsMatch) {
                return false;
            }
            
            // creating copies of the arrays to avoid mutating originals
            const recentItems = [...recentOrder.orderItems];
            const newItems = [...newOrder.orderItems];
            
            // sort both arrays by _id for consistent comparison
            recentItems.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
            newItems.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
            
            // Check if all items match (same _id, qty, and price) regardless of original order
            return recentItems.every((recentItem, index) => {
                const newItem = newItems[index];
                return recentItem._id.toString() === newItem._id.toString() &&
                       recentItem.qty === newItem.qty &&
                       recentItem.price === newItem.price;
            });
        });

        if (isDuplicate) {
            return res.status(400).json({message: "Duplicate order detected. You have already placed this order recently."});
        }
        const savedOrder = await newOrder.save();
        res.status(201).json({message: "Order created successfully", savedOrder});
    } catch (error) {
        res.status(500).json({message: "Error adding order", error: error.message});
    }
}

// update order - updates orderItems, deliveryAddress, and status ONLY
export const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { orderItems, deliveryAddress, status } = req.body;
        if (!orderId)
            return res.status(400).json({ message: "Order ID is required" });
        const order = await Order.findById(orderId);
        if (!order)
            return res.status(404).json({ message: "Order not found" });

        // Check if order can be modified based on status transition rules
        const currentStatus = order.status;
        const allowedTransitions = {
            'Pending': ['Confirmed', 'Cancelled'],
            'Confirmed': ['Preparing', 'Cancelled'],
            'Preparing': ['Out for Delivery', 'Cancelled'],
            'Out for Delivery': ['Delivered', 'Cancelled'],
            'Delivered': [],
            'Cancelled': ['Pending']
        };
        
        // Allow status transitions according to the rules defined in order model
        if (status && currentStatus !== status) {
            if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(status)) {
                return res.status(400).json({ 
                    message: `Cannot change status from ${currentStatus} to ${status}. Allowed transitions: ${allowedTransitions[currentStatus]?.join(', ') || 'none'}` 
                });
            }
        }
        
        // Allow orderItems and deliveryAddress updates only for orders that can be modified
        // (Pending, Confirmed, Preparing - but not Out for Delivery, Delivered, or Cancelled)
        const modifiableStatuses = ['Pending', 'Confirmed', 'Preparing', 'Cancelled'];
        const canModifyOrder = modifiableStatuses.includes(currentStatus);
        
        if ((orderItems || deliveryAddress) && !canModifyOrder) {
            return res.status(400).json({ 
                message: "Order items and delivery address can only be modified when order status is Pending, Confirmed, or Preparing",
                currentStatus: currentStatus 
            });
        }

        // Prepare update object
        const updateData = {};

        // Update orderItems if provided
        if (orderItems && Array.isArray(orderItems)) {
            if (orderItems.length === 0)
                return res.status(400).json({ message: "Order must have at least one item" });
            
            // Validate each order item
            for (const item of orderItems) {
                if (!item._id || !item.name || !item.qty || !item.price) {
                    return res.status(400).json({ 
                        message: "Each order item must have _id, name, qty, and price" 
                    });
                }
                if (item.qty < 1) {
                    return res.status(400).json({ 
                        message: "Quantity must be greater than 0" 
                    });
                }
                if (item.price < 0) {
                    return res.status(400).json({ 
                        message: "Price must be a positive number" 
                    });
                }
            }
            updateData.orderItems = orderItems;
            
            // Recalculate total price based on new order items
            const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            updateData.totalPrice = itemsTotal + (order.GST || 0) + (order.deliveryCharges || 0);
        }

        // Update deliveryAddress if provided
        if (deliveryAddress) {
            const requiredFields = ['phoneNumber', 'address', 'city', 'pincode', 'country'];
            for (const field of requiredFields) {
                if (!deliveryAddress[field]) {
                    return res.status(400).json({ 
                        message: `Delivery address must include ${field}` 
                    });
                }
            }
            
            // Validate phone number
            if (deliveryAddress.phoneNumber.length < 5) {
                return res.status(400).json({ 
                    message: "Phone number must be at least 5 digits" 
                });
            }
            
            // Validate pincode
            if (deliveryAddress.pincode.length !== 3) {
                return res.status(400).json({ 
                    message: "Pincode must be 3 digits" 
                });
            }
            
            updateData.deliveryAddress = deliveryAddress;
        }

        // Update status if provided
        if (status) {
            const allowedStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ 
                    message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` 
                });
            }
            
            // Status transition check is already handled above
            updateData.status = status;
            updateData.statusUpdatedAt = new Date();
            
            // Set deliveredAt if status is Delivered
            if (status === 'Delivered')
                updateData.deliveredAt = new Date();

            // Set cancelledAt if status is Cancelled
            if (status === 'Cancelled')
                updateData.cancelledAt = new Date();
        }

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate( orderId, updateData, { new: true, runValidators: true });

        res.status(200).json({ message: "Order updated successfully", order: updatedOrder });

    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
}

// Remove the order from the server database
export const removeOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId)
            return res.status(400).json({ message: "Order ID is required" });
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder)
            return res.status(404).json({ message: "Order not found" });
        const updatedOrders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json({
            message: `Order with ID: ${orderId} has been successfully removed from the server database`,
            orders: updatedOrders,
            deletedOrder: deletedOrder
        });
    } catch (error) {
        console.error("Error removing order:", error);
        res.status(500).json({ message: "Error removing order", error: error.message });
    }
}
