import { Schema, model } from 'mongoose';

// User Schema definition
const userSchema = new Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Orders
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order', // Referencing the 'Order' model
      },
    ],

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false, // Email verification status (default is false)
    },

    verificationCode: {
      type: String,
      // unique: true,
      default: null,
    },

    // Password Reset
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    // Timestamps
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Export the user schema model
export default model('User', userSchema);