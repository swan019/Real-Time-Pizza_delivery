const Order = require('../../../models/order');
const moment = require('moment');

function orderController() {
    return {
        async store(req, res) {
            const { phone, address } = req.body;
            if (!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address
            });

            try {
                const result = await order.save();
                const placedOrder = await Order.populate(result, { path: 'customerId' });
                req.flash('success', 'Order placed successfully');
                delete req.session.cart;

                // Emit event
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', placedOrder);

                return res.redirect('/customer/orders');
            } catch (err) {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            }
        },

        async index(req, res) {
            try {
                const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } });
                res.header('Cache-Control', 'no-store');
                res.render('customers/orders', { orders: orders, moment: moment });
            } catch (err) {
                req.flash('error', 'Something went wrong');
                res.redirect('/');
            }
        },

        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id);
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/singleOrder', { order });
                }
                req.flash('error', 'Not authorized');
                return res.redirect('/');
            } catch (err) {
                req.flash('error', 'Something went wrong');
                return res.redirect('/');
            }
        }
    };
}

module.exports = orderController;
