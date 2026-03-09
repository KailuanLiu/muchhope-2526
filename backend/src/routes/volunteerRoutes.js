const express = require("express");
const router = express.Router();
const { Volunteer } = require("../database/initModels");

router.get("/", async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.status(200).json(volunteers);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})