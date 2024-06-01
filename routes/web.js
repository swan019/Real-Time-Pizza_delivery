const homeController = require('../app/http/controllers/homeController.js')
const authController = require('../app/http/controllers/authController.js')
const cartController = require('../app/http/controllers/customers/cartController.js')
const orderController = require('../app/http/controllers/customers/orderController.js')
const adminOrderController = require('../app/http/controllers/admin/orderController.js')
const statusController = require('../app/http/controllers/admin/statusController.js')

// middleware
const guest = require('../app/http/middleware/guest.js')
const auth = require('../app/http/middleware/auth.js')
const admin = require('../app/http/middleware/admin.js')

function initRoutes(app) {

    app.get('/', homeController().index);
    app.get('/login', guest, authController().login);
    app.post('/login', authController().postLogin);
    app.get('/register', guest, authController().register);
    app.post('/register', authController().postRegister);
    app.post('/logout', authController().logout);
    
    app.get('/cart', cartController().index);
    app.post('/update-cart', cartController().update);

    //customers routs
    app.post('/orders', auth,  orderController().store);
    app.get('/customer/orders', auth,  orderController().index)

    //Admin routs
    app.get('/admin/orders', admin,  adminOrderController().index)
    
    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index)
    app.post('/admin/order/status', admin, statusController().update)
    app.get('/customer/orders/:id', auth, orderController().show)


    
}

module.exports = initRoutes
