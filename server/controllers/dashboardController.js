const Note = require('../models/Notes');
const mongoose = require('mongoose');

exports.dashboard = async (req, res) => {
    const locals = {
        title: "Dashboard",
        description: "Free NodeJs Notes App"
    }

    try {
        const notes = await Note.find({});
        console.log(notes);
        res.render('dashboard/index', {
            username: req.user.firstName,
            locals,
            notes,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.log("Err " + error);
    }
}