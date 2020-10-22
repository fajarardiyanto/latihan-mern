const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Fajar',
        email: 'asd@asd.com',
        password: 'asdas'
    }
]

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again', 500);
        return next(error);
    }

    res.json({
        users: users.map(user => user.toObject({ getters: true }))
    });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check yout data.', 422));
    }

    const { name, email, password } = req.body;
    
    // const hasUser = DUMMY_USERS.find(u => u.email === email);
    // if (hasUser) {
    //     throw new HttpError('Could not create user, email already exist', 422);
    // }
    let existingUser;
    try{
        existingUser = await User.findOne({ email: email });
    } catch(err) {
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User existing already, please login instead', 422);
        return next(error);
    }

    // const createdUser = {
    //     id: uuid.v4(),
    //     name,
    //     email,
    //     password
    // };
    const createdUser = new User({
        name,
        email,
        image: 'https://rimage.gnst.jp/livejapan.com/public/article/detail/a/00/03/a0003978/img/basic/a0003978_main.jpg?20200129074829&q=80&rw=750&rh=536',
        password,
        places: []
    });

    // DUMMY_USERS.push(createdUser);

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Creating user failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    // const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    // if (!identifiedUser || identifiedUser.password !== password) {
    //     throw new HttpError('Could not identify user, credentials seem to  be wrong.', 401);
    // }

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Login failed, please try again.', 500);
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }

    res.json({ message: 'Logged In!', user: existingUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;