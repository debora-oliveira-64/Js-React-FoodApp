function OrdersService(Model) {
    let service = {
      create,
      findAll,
      update,
      removeById,
      findOrderById,
      findOrdersByUser,
      findOrdersByRestaurant
    };
  
    function create(order) {
      let newOrder = Model(order);
      return save(newOrder);
    }
  
    function save(model) {
      return new Promise(function (resolve, reject) {
        model.save(function (err) {
          if (err) reject("There is a problema with register");
  
          resolve({
            message: "Order Created",
            order: model,
          });
        });
      });
    }

    function findAll(pagination = { limit: 10, skip: 0 }) {
      const { limit, skip } = pagination;
    
      return new Promise(function (resolve, reject) {
        Model.find({}, {}, { skip, limit }, function (err, orders) {
          if (err) reject(err);
    
          resolve(orders);
        });
      }).then(async (orders) => {
        const totalOrders = await Model.count();
    
        return Promise.resolve({
          data: orders,
          pagination: {
            pageSize: limit,
            page: Math.floor(skip / limit),
            total: totalOrders,
          },
        });
      });
    }
    
    function findOrderById(id) {
      return new Promise(function (resolve, reject) {
        Model.findById(id)
        .populate('plates')
          .exec(function (err, order) {
            if (err) {
              reject(err);
            } else {
              resolve(order);
            }
          });
      });
    }

    function findOrdersByUser(userId, pagination = { limit: 10, skip: 0 }) {
      const { limit, skip } = pagination;
  
      return new Promise(function (resolve, reject) {
        Model.find({ user: userId }, {}, { skip, limit })
        .populate({
          path: "plates.restaurant",
          select: "email", 
        })
        .populate({
          path: "plates.plate",
        })
        .populate({
          path: "plates.restaurant.ifRestaurant",
          model: "Restaurant", 
        })
          .exec(async function (err, orders) {
            if (err) {
              reject("Error finding orders by user.");
            } else {
              const totalOrders = await Model.countDocuments({ user: userId });

              resolve({
                data: orders,
                pagination: {
                  pageSize: limit,
                  page: Math.floor(skip / limit),
                  total: totalOrders,
                },
              });
            }
          });
      });
    }

    function findOrdersByRestaurant(restaurantId, pagination = { limit: 10, skip: 0 }) {
      const { limit, skip } = pagination;
  
      return new Promise(function (resolve, reject) {
        Model.find({ "plates.restaurant": restaurantId }, {}, { skip, limit })
        .populate({
          path: "user",
          select: "username",
          select: "email", 
        })
        .populate({
          path: "plates.plate",
        })
        .populate({
          path: "plates.restaurant.ifRestaurant",
          model: "Restaurant", 
        })
          .populate("plates.plate")
          .exec(async function (err, orders) {
            if (err) {
              reject("Error finding orders by restaurant.");
            } else {
              const totalOrders = await Model.countDocuments({ "plates.restaurant": restaurantId });
  
              resolve({
                data: orders,
                pagination: {
                  pageSize: limit,
                  page: Math.floor(skip / limit),
                  total: totalOrders,
                },
              });
            }
          });
      });
    }
  
    function update(id, order) {
      return new Promise(function (resolve, reject) {
        Model.findByIdAndUpdate(id, order, function (err, orderUpdated) {
          if (err) reject('Dont updated order');
          resolve(orderUpdated);
        });
      });
    }
  
    function removeById(id) {
      return new Promise(function (resolve, reject) {
        Model.findByIdAndRemove(id, function (err) {
          if (err)
            reject({
              message: "Does not possible remove",
            });
  
          resolve();
        });
      });
    }
  
    return service;
  }
  
  module.exports = OrdersService;
  