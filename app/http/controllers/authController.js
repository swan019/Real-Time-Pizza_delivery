const passport = require('passport');
const User = require('../../models/user');
const bcrypt = require('bcrypt');


function authController() {
    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req, res, next) {
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message)
                        return next(err)
                    }

                    return res.redirect('/')
                })

            })(req, res, next)
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
                const userExists = await User.exists({ email: email });
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
                    fname: fname,
                    lname: lname,
                    email: email,
                    number: number,
                    password: hashedPassword,
                });

                // Save user
                await user.save();
                return res.redirect('/');
            } catch (err) {
                console.error('Error during registration:', err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            }
        },

        logout(req, res) {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/login'); // Redirect to login page after logging out
            });
        }
    }
}

module.exports = authController;
