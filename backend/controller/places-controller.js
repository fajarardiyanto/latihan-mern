const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/places');
const User = require('../models/user');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Orde State Building',
        description: 'One of the most famous sky scrapers in the world',
        // imageUrl: 'https://www.designboom.com/wp-content/uploads/2019/12/niko-architect-house-in-the-landscape-moscow-designboom-1200.jpg',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        address: 'Columbia',
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Legiun State Building',
        description: 'One of the most famous sky scrapers in the world',
        // imageUrl: 'https://i.ytimg.com/vi/RueQCUgQ1eM/maxresdefault.jpg',
        location: {
            lat: 666,
            lng: -666
        },
        address: 'Swiss',
        creator: 'u2'
    },
]

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    // const place = DUMMY_PLACES.find(p => {
    //     return p.id === placeId;
    // });

    let place;
    
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place', 500);
        return next(error);
    }

    if (!place) {
        // return res.status(404).json({
        //     message: 'Could not find a place for the provide id.'
        // });
        
        // Use middleware
        const error = new HttpError('Could not find a place for the provide id.', 404);
        return next(error);
    }

    res.json({
        place: place.toObject({
            getters: true
        }) // { place } => { place: place }
    });
};

const getPlaceByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    // const place = DUMMY_PLACES.filter(p => {
    //     return p.creator === userId;
    // });
    let place;
    let userWithPlaces
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again!', 500);
        console.log(err)
        return next(error);
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        // return res.status(404).json({
        //     message: 'Could not find a place for the provide user id.'
        // });

        // Use middleware
        return next(new HttpError('Could not find a place for the provide user id.', 404));
    }

    res.json({
        places: userWithPlaces.places.map(place => place.toObject({ getters: true }))
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check yout data.', 422));
    }

    const { title, description, address, creator } = req.body;
    // same => const title = req.body.title;

    let coordinates; 
    coordinates = await getCoordsForAddress(address);
    
    const createdPlace = new Place({
        title, // title: title same=> title,
        description,
        address,
        location: coordinates,
        image: 'https://i.ytimg.com/vi/RueQCUgQ1eM/maxresdefault.jpg',
        creator
    });

    let user;

    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    if (!user){
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    // console.log(user);

    // DUMMY_PLACES.push(createdPlace);
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess }); 
        user.places.push(createdPlace); 
        await user.save({ session: sess }); 
        await sess.commitTransaction();
      } catch (err) {
        const error = new HttpError('Creating place failed, please try again.',500);
        console.log(err);
        return next(error);
      }

    res.status(201).json({place: createdPlace});
};

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check yout data.', 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id)
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    // DUMMY_PLACES[placeIndex] = updatedPlace;
    try{
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });

};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    // if (DUMMY_PLACES.find(p => p.id === placeId)) {
    //     throw new HttpError('Could not find a place for that id.', 404);
    // }

    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    res.status(200).json({
        message: 'Delete Place.'
    });
};

exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.deletePlaceById = deletePlaceById;
exports.updatePlaceById = updatePlaceById;
exports.getPlaceByUserId = getPlaceByUserId;