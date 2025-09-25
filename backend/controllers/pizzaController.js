import Pizza from "../models/pizzamodel.js";

// get all pizzas
export const getAllPizzas = async (req, res) => {
    try {
        const pizza = await Pizza.find();
        res.status(200).json(pizza);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pizzas", error: error.message});
    }
};

// get pizza by ID
export const getPizzaByID = async (req, res) => {
    try {
        const pizzaById = await Pizza.findById(req.params.id);
        if (!pizzaById)
            return res.status(404).json({message: "Pizza not found"});
        res.status(200).json(pizzaById);
    } catch (error) {
        res.status(500).json({message: "Error fetching pizza by ID", error: error.message});
    }
}

// create a new pizza
export const addPizza = async (req, res) => {
    try {
        const newPizza = new Pizza(req.body);
        const savedPizza = await newPizza.save();
        res.status(201).json(savedPizza);
    } catch (error) {
        res.status(500).json({ message: "Error creating pizza", error: error.message });
    }
}

// delete a pizza
export const deletePizza = async (req, res) => {
    try {
        const pizzaToDelete = await Pizza.findByIdAndDelete(req.params.id);
        if (!pizzaToDelete) return res.status(404).json({message: "Pizza not found"});
        res.status(200).json({message: "Pizza removed successfully"});
    } catch (error) {
        res.status(500).json({ message: "Error removing pizza", error: error.message });
    }
}

// update a pizza details
export const updatePizza = async (req, res) => {
    try {
        const pizzaId = req.params.id;
        const { name, description, price, veg, imageUrl } = req.body;
        if (!pizzaId)
            return res.status(404).json({ message: "Pizza not found" });
        const updatedPizza = await Pizza.findByIdAndUpdate( 
            pizzaId,
            { name, description, price, veg, imageUrl }, 
            { new: true, runValidators: true }
        );
        if (!updatedPizza)
            return res.status(404).json({ message: "Pizza not found" });
        res.status(200).json(updatedPizza);
    } catch (error) {
        res.status(500).json({ message: "Error updating pizza", error: error.message });
    }
}

// filter pizzas by category
export const getFilterPizzas = async (req, res) => {
    try {
        // filter by veg or non-veg category if specified
        let filter = {};
        if (req.query.veg)
            filter.veg = req.query.veg === 'true';

        // sort by price if specified
        let sort = {};
        if (req.query.sort === "asc") {
            sort.price = 1;
        } else if (req.query.sort === "desc") {
            sort.price = -1;
        } else if (req.query.sort === "createdAt") {
            // sort by creation date if specified
            sort.createdAt = req.query.order === "desc" ? -1 : 1;
        }

        //get pizza by name if specified
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' }; // case-insensitive search
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1)*limit;
        const total = await Pizza.countDocuments(filter);

        const pizzas = await Pizza.find(filter).sort(sort).skip(skip).limit(limit);
        res.status(200).json({
            pizzas,
            page,
            totalPages: Math.ceil( total / limit),
            totalPizzas: total
        });
    } catch (error) {
        res.status(500).json({ message: "Error filtering/sorting pizzas", error: error.message });
    }
}
