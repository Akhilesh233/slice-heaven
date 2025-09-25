import { Schema, model } from 'mongoose';

// Order Schema for MongoDB using Mongoose defining the structure of an order document
const orderSchema = new Schema(
  {
    user: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        }
      }
    ],
    orderItems: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Pizza',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          min: 1,
          validate: {
            validator: v => v >= 1,
            message: 'Quantity must be a greater than 1',
          }
        },
        price: {
          type: Number,
          required: true,
          min: 0,
          validate: {
            validator: v => v >= 0,
            message: 'Price must be a positive number',
          }
        },
      },
    ],
    deliveryAddress: {
      phoneNumber: {
        type: String,
        required: true,
        validate: {
          validator: v => v.length >= 5,
          message: 'Phone number must be at least 5 digits',
        }
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        validate: {
          validator: v => v.length >= 3,
          message: 'City name must be at least 3 characters',
        }
      },
      pincode: {
        type: String,
        required: true,
        validate: {
          validator: v => v.length === 3,
          message: 'Pincode must be 3 digits',
        }
      },
      country: {
        type: String,
        required: true,
        validate: {
          validator: v => v.length >= 2,
          message: 'Country name must be at least 2 characters',
        }
      },
    },
    GST: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      validate: {
        validator: v => v >= 0,
        message: 'Total Price must be a positive number',
      }
    },
    payment: {
      method: {
        type: String,
        enum: ['stripe', 'razorpay'],
        // required: true,
      },
      stripePaymentIntentId: { type: String }, // For Stripe payments
      razorpayOrderId: { type: String }, // For Razorpay payments
      status: { type: String }, // Payment status
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    estimatedDeliveryTime: Date,
    statusUpdatedAt: Date,
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for total amount
orderSchema.virtual('totalAmount').get(function() {
  if (!this.orderItems) return 0;
  return this.orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
});

// Pre-save middleware for validations/calculation
orderSchema.pre('save', async function(next) {
  if (!this.isModified('orderItems')) return next();
  if (this.orderItems.length === 0) {
    return next(new Error('Order must have at least one item'));
  }
  // Optionally, verify pizza snapshot/prices here from DB (if required)
  for (const item of this.orderItems) {
    if (item.price < 0 || item.qty <= 0) {
      return next(new Error('Price/quantity invalid'));
    }
  }
  next();
});

// Define allowed status transitions
const allowedTransitions = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Preparing', 'Cancelled'],
  'Preparing': ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Cancelled'],
  'Delivered': [],
  'Cancelled': []
};

// Status transition check
orderSchema.pre('save', function(next) {
  if (!this.isModified('status')) return next();
  if (!this.isNew) {
    const prev = this.get('status', null, { getters: false, virtuals: false });
    if (prev && allowedTransitions[prev] && !allowedTransitions[prev].includes(this.status) && this.status !== prev) {
      return next(new Error(`Transition from ${prev} to ${this.status} not allowed`));
    }
  }
  next();
});

// Instance methods
orderSchema.methods.canBeModified = function() {
  return ['Pending'].includes(this.status);
};

// Placeholder for delivery time estimation
orderSchema.methods.calculateEstimatedDelivery = function() {
  // For demo: 30 min after creation
  return new Date(new Date(this.createdAt).getTime() + 30 * 60 * 1000);
};

// Static: findByUserPaginated
orderSchema.statics.findByUserPaginated = function(userId, page = 1, limit = 12) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static: getOrderStats for admin
orderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    { $group: {
      _id: "$status", count: { $sum: 1 }, total: { $sum: { $toDouble: "$totalAmount" } }
    } }
  ]);
};

export default model('Order', orderSchema);