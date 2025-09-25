function PlateService(Model) {
    let service = {
      create,
      findAll,
      findPlateById,
      update,
      removeById,
    };
  
    function create(plate) {
      let newPlate = Model(plate);
      return save(newPlate);
    }
  
    function save(model) {
      return new Promise(function (resolve, reject) {
        // do a thing, possibly async, then…
        model.save(function (err) {
          if (err) reject("There is a problema with register");
  
          resolve({
            message: "Plate Created",
            plate: model,
          });
        });
      });
    }

    function findAll(pagination = { limit: 10, skip: 0 }) {
      const { limit, skip } = pagination;
  
      return new Promise(function (resolve, reject) {
        Model.find({}, {}, { skip, limit }, function (err, plates) {
          if (err) reject(err);
  
          resolve(plates);
        });
      }).then(async (plates) => {
        const totalPlates = await Model.count();
  
        return Promise.resolve({
          data: plates,
          pagination: {
            pageSize: limit,
            page: Math.floor(skip / limit),
            total: totalPlates,
          },
        });
      });
    }

    function update(id, plate) {
      return new Promise(function (resolve, reject) {
        Model.findByIdAndUpdate(id, plate, function (err, plateUpdated) {
          if (err) reject('Dont updated plate');
          resolve(plateUpdated);
        });
      });
    }

    function findPlateById(id) {
      return new Promise(function (resolve, reject) {
        Model.findById(id)
          .exec(function (err, plate) {
            if (err) {
              reject(err);
            } else {
              resolve(plate);
            }
          });
      });
    }
    
  
    function removeById(id) {
      return new Promise(function (resolve, reject) {
        Model.findByIdAndRemove(id, function (err, result) {
          if (err) {
            return reject({
              message: "Unable to remove the plate.",
            });
          }
    
          if (!result) {
            return reject({
              message: "Plate not found.",
            });
          }
    
          resolve(result);
        });
      });
    }
    
  
    return service;
  }
  
  module.exports = PlateService;
  