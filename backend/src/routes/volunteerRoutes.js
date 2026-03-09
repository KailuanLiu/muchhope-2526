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

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const volunteer = await Volunteer.findOneAndUpdate({ id }, updates, {
            new: true,
            runValidators: true,
        });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found"});
        }
        res.status(200).json(volunteer);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

module.exports = router;