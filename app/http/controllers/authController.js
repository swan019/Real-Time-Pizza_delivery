const passport = require('passport');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

function authController() {

    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }

    return {
        login(req, res) {
            res.render('auth/login');
        },

        // postLogin(req, res, next) {
        //     passport.authenticate('local', (err, user, info) => {
        //         if (err) {
        //             console.error('Authentication error:', err); // Optional logging
        //             req.flash('error', 'An unexpected error occurred during authentication. Please try again.');
        //             return next(err);
        //         }
        //         if (!user) {
        //             req.flash('error', info.message || 'Invalid login credentials. Please check your email and password.');
        //             return res.redirect('/login');
        //         }
        //         req.logIn(user, (err) => {
        //             if (err) {
        //                 console.error('Login error:', err); // Optional logging
        //                 req.flash('error', 'An error occurred while logging in. Please try again.');
        //                 return next(err);
        //             }
        //             req.flash('success', 'Successfully logged in!');
        //             return res.redirect('/');
        //         });
        //     })(req, res, next);
        // },

        postLogin(req, res, next) {
            // Save the current cart data
            const cart = req.session.cart;
        
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    console.error('Authentication error:', err); // Optional logging
                    req.flash('error', 'An unexpected error occurred during authentication. Please try again.');
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message || 'Invalid login credentials. Please check your email and password.');
                    return res.redirect('/login');
                }
                req.logIn(user, (err) => {
                    if (err) {
                        console.error('Login error:', err); // Optional logging
                        req.flash('error', 'An error occurred while logging in. Please try again.');
                        return next(err);
                    }
                    
                    // Restore the cart data after login
                    req.session.cart = cart;

                    
        
                    req.flash('success', 'Successfully logged in!');
                    return res.redirect(_getRedirectUrl(req));
                });
            })(req, res, next);
        },
        
        
        register(req, res) {
            res.render('auth/register');
        },

        async postRegister(req, res) {
            const { fname, lname, email, number, password } = req.body;

            // Validate request
            if (!fname || !lname || !email || !number || !password) {
                req.flash('error', 'All fields are required');
                req.flash('fname', fname);
                req.flash('lname', lname);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/register');
            }

            try {
                // Check if email exists
                const userExists = await User.exists({ email });
                if (userExists) {
                    req.flash('error', 'Email already exists');
                    req.flash('fname', fname);
                    req.flash('lname', lname);
                    req.flash('email', email);
                    req.flash('number', number);
                    return res.redirect('/register');
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create new user
                const user = new User({
                    fname,
                    lname,
                    email,
                    number,
                    password: hashedPassword,
                });

                // Save user
                await user.save();
                req.flash('success', 'Registration successful. Please log in.');
                return res.redirect('/login');
            } catch (err) {
                console.error('Error during registration:', err);
                req.flash('error', 'Something went wrong. Please try again.');
                return res.redirect('/register');
            }
        },

        logout(req, res, next) {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
            });
            res.redirect('/login'); // Redirect to login page after logging out
        }
    };
}

module.exports = authController;
