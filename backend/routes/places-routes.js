const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controller/places-controller');

const router = express.Router();


router.get('/:pid', placesControllers.getPlaceById);
router.get('/user/:uid', placesControllers.getPlaceByUserId);
router.post('/new',
    [
        check('title')
            .not()
            .isEmpty(),
        check('description')
            .isLength({
                min: 5
            }),
        check('address')
            .not()
            .isEmpty(),
    ],
    placesControllers.createPlace);

router.patch('/update/:pid',
    [
        check('title')
            .not()
            .isEmpty(),
        check('description')
            .isLength({
                min: 5
            }),
    ],
    placesControllers.updatePlaceById);

router.delete('/delete/:pid', placesControllers.deletePlaceById);

module.exports = router;