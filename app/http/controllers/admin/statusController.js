const Order = require('../../../models/order');

function statusController() {
    return {
        async update(req, res) {
            try {
                const { orderId, status } = req.body;

                if (!orderId || !status) {
                    return res.status(400).json({ message: 'Order ID and status are required' });
                }

                const result = await Order.updateOne({ _id: orderId }, { status });

                if (result.nModified === 0) {
                    return res.status(404).json({ message: 'Order not found or status not modified' });
                }

                // Emit event
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderUpdated', { id: orderId, status });

                return res.redirect('/admin/orders');

            } catch (error) {

                console.error('Error updating order status:', error);
                return res.redirect('/admin/orders');
                
            }
        }
    };
}

module.exports = statusController;

