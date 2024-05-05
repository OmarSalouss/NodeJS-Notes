const Note = require('../models/Notes');
const mongoose = require('mongoose');

exports.dashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;

    const locals = {
        title: "Dashboard",
        description: "Free NodeJs Notes App"
    }

    try {
        Note.aggregate([
            {
                $sort: {
                    createdAt: -1,
                }
            },
            {
                $match: { user: mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $project: {
                    title: { $substr: ['$title', 0, 50] },
                    body: { $substr: ['$body', 0, 100] }
                }
            }

        ])
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec(function (err, notes) {
                Note.count().exec(function (err, count) {
                    if (err) return next(err);
                    res.render('dashboard/index', {
                        username: req.user.firstName,
                        locals,
                        notes,
                        layout: '../views/layouts/dashboard',
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                })
            })
    } catch (error) {
        console.log("Err " + error);
    }
}

exports.dashboardViewNote = async (req, res) => {
    const note = await Note.findById({ _id: req.params.id })
        .where({ user: req.user.id }).lean();
    console.log(note.title)
    if (note) {
        res.render('dashboard/view-note', {
            noteID: req.params.id,
            note,
            layout: '../views/layouts/dashboard'
        })
    } else {
        res.send("Something went wrong!!!")
    }

}

exports.dashboardUpdateNote = async (req, res) => {
    try {
        await Note.findOneAndUpdate(
            { _id: req.params.id },
            { title: req.body.title, body: req.body.body }
        ).where({ user: req.user.id });

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}

exports.dashboardDeleteNote = async (req, res) => {
    try {
        await Note.findOneAndDelete(
            { _id: req.params.id }
        ).where({ user: req.user.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}

exports.dashboardAddNote = async (req, res) => {
    res.render('dashboard/add', {
        layout: '../views/layouts/dashboard'
    });
}

exports.dashboardAddNoteSubmit = async (req, res) => {
    try {
        req.body.user = req.params.id;
        await Note.create(req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}

exports.dashboardSearch = async (req, res) => {
    try {
        res.render('dashboard/search', {
            searchResults: '',
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.log(error);
    }
}

exports.dashboardSearchSubmit = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const searchResult = await Note.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChars, 'i') } }
            ]
        }).where({ user: req.user.id });

        res.render('dashboard/search', {
            searchResults: searchResult,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.log(error);
    }
}