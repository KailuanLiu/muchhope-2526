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

router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;
        const volunteer = await Volunteer.findOne({email});

        if (!volunteer) {
            return res.status(404).json({message: "Volunteer not found"});
        }
        res.status(200).json(volunteer);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});