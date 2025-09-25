import express from "express";

const router = express.Router();

// route to get all admin
const adminRoute = router.get("/", (req, res) => {
    res.send("Here are all the admin!");
});

export default adminRoute;