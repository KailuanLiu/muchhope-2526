// wouldnt let me push without commenting this out, still having that weird unused var: error error thing
/*const express = require("express");
const router = express.Router();
const { Event } = require("../database/initModels");

//get
router.get("/", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
   } catch (error) {
        res.status(500).json({ error: "Failed to fetch events" });
   }
 });

//post
router.post("/", async (req, res) => {
   try {
     const event = await Event.create(req.body);
     res.status(201).json(event);
   } catch (error) {
     res.status(400).json({ error: "Failed to create event" });
   }
 });

  //put
router.put("/:id", async (req, res) => {
   try {
     const updatedEvent = await Event.findByIdAndUpdate(
       req.params.id,
       req.body,
       { new: true }
     );
     res.json(updatedEvent);
   } catch (error) {
     res.status(400).json({ error: "Failed to update event" });
   }
 });

  //delete
 router.delete("/:id", async (req, res) => {
   try {
     await Event.findByIdAndDelete(req.params.id);
     res.json({ message: "Event deleted" });
   } catch (error) {
     res.status(400).json({ error: "Failed to delete event" });
   }
 });

 module.exports = router; */
