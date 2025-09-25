function RestaurantService(Model) {
    let service = {
      create,
      findAll,
      update,
      addPlate,
      findRestaurantById,
      removeById,
    };
  
    function create(restaurant) {
      let newRestaurant = Model(restaurant);
      return save(newRestaurant);
    }
  
    function save(model) {
      return new Promise(function (resolve, reject) {
        model.save(function (err) {
          if (err) reject("There is a problema with register");
  
          resolve({
            message: "Restaurant Created",
            restaurant: model,
          });
        });
      });
    }

    function findAll(pagination = { limit: 10, skip: 0 }) {
      const { limit, skip } = pagination;
    
      return new Promise(function (resolve, reject) {
        Model.find({}, {}, { skip, limit })
          .populate('plates')
          .exec(function (err, restaurants) {
            if (err) reject(err);
    
            resolve(restaurants);
          });
      })
        .then(async (restaurants) => {
          const total = await Model.count();
    
          return Promise.resolve({
            data: restaurants,
            pagination: {
              pageSize: limit,
              page: Math.floor(skip / limit),
              total: total,
            },
          });
        });
    }

    function findRestaurantById(id) {
      return new Promise(function (resolve, reject) {
        Model.findById(id)
        .populate('plates')
          .exec(function (err, restaurant) {
            if (err) {
              reject(err);
            } else {
              resolve(restaurant);
            }
          });
      });
    }
  
    function update(id, restaurant) {
      return new Promise(function (resolve, reject) {
        if (restaurant.plates && restaurant.plates.length > 10) {
          return reject("The plates array cannot have more than 10 items.");
        }
        Model.findByIdAndUpdate(id, restaurant, function (err, restaurantUpdated) {
          if (err) reject('Dont updated restaurant');
          resolve(restaurantUpdated);
        });
      });
    }

    function addPlate(id, updateData) {
      return new Promise(function (resolve, reject) {
        const { plateId } = updateData;
    
        const updateQuery = plateId
          ? { $push: { plates: plateId } }
          : updateData;
    
        Model.findByIdAndUpdate(
          id,
          updateQuery,
          { new: true, runValidators: true },
          function (err, restaurantUpdated) {
            if (err) {
              reject("Failed to update restaurant");
            } else {
              resolve(restaurantUpdated);
            }
          }
        );
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
  
  module.exports = RestaurantService;
  