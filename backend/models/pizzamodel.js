import { Schema, model } from 'mongoose';

// Pizza Schema definition
const pizzaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    veg: {
        type: Boolean,
        default: true, // true for vegetarian, false for non-vegetarian
        required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Pizza", pizzaSchema);