const config = require("../../config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function UserService(UserModel) {
  let service = {
    create,
    createToken,
    verifyToken,
    findUser,
    findAll,
    findUserById,
    autorize,
    update,
    findUserByRestaurant,
    findUserByEmail,
    getUserIdsByRestaurantIds,
  };

  function create(user) {
    return createPassword(user).then((hashPassword, err) => {
      if (err) {
        return Promise.reject("Not saved the user");
      }

      let newUserWithPassword = {
        ...user,
        password: hashPassword,
      };

      let newUser = UserModel(newUserWithPassword);
      return save(newUser);
    });
  }

  function createToken(user) {
    let token = jwt.sign({ id: user._id, role: user.role.scopes}, config.secret, {
      expiresIn: config.expiresPassword,
    });

    return { auth: true, token };
  }


  function verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          reject(err);
        }     
        return resolve(decoded);
      });
    });
  }

  function save(model) {
    return new Promise(function (resolve, reject) {
      model.save(function (err) {
        if (err) reject(err);

        resolve({
            message: 'User saved',
            user: model,
        });
      });
    });
  }

  function update(id, user) {
    console.log('user', user);
    return new Promise(function (resolve, reject) {
      console.log('user', user);
      UserModel.findByIdAndUpdate(id, user, function (err, userUpdated) {
        if (err) reject('Dont updated User');
        resolve(userUpdated);
      });
    });
  }

  function findUserById(id) {
    return new Promise(function (resolve, reject) {
      UserModel.findById(id)
      .populate({
        path: 'ifRestaurant',
        populate: {
          path: 'plates', 
          model: 'Plate', 
        },
      })
        .exec(function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    });
  }

  function findUser({ username, password }) {
    return new Promise(function (resolve, reject) {
      UserModel.findOne({ username }, function (err, user) {
        if (err) reject(err);

        if (!user) {
          reject("This data is wrong");
        }
        resolve(user);
      });
    }).then((user) => {
      return comparePassword(password, user.password).then((match) => {
        if (!match) return Promise.reject("User not valid");
        return Promise.resolve(user);
      });
    });
  }

  function findAll(pagination) {
    const { limit, skip } = pagination;

    return new Promise(function (resolve, reject) {
      UserModel.find({}, {}, { skip, limit }, function (err, users) {
        if (err) reject(err);

        resolve(users);
      });
    }).then(async (users) => {
      const totalUsers = await UserModel.count();

      return Promise.resolve({
        data: users,
        pagination: {
          pageSize: limit,
          page: Math.floor(skip / limit),
          hasMore: skip + limit < totalUsers,
          total: totalUsers,
        },
      });
    });
  }

  function createPassword(user) {
    return bcrypt.hash(user.password, config.saltRounds);
  }

  function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  function autorize(scopes) {
    return (request, response, next) => {

      const { roleUser } = request;
      console.log(roleUser);
      console.log(scopes);
      const hasAutorization = scopes.some(scope => roleUser.includes(scope));

      if (roleUser && hasAutorization) {
        next();
      } else {
        response.status(403).json({ message: "Forbidden" }); 
      }
    };
  }

  function findUserByEmail(email) {
    return new Promise(function (resolve, reject) {
      UserModel.findOne({ email: email }, function (err, user) {
        if (err) {
          return reject(err);
        }
  
        if (!user) {
          return reject("No user found with this email"); 
        }
  
        resolve(user);
      });
    });
  }
  

  function findUserByRestaurant(ifRestaurant) {
    return new Promise(function (resolve, reject) {
      UserModel.findOne({ ifRestaurant }, function (err, user) {
        if (err) reject(err);

        if (!user) {
          reject("This data is wrong");
        }
        resolve(user);
      });
    }).then((user) => {
      return Promise.resolve(user);
    });
  }

  async function getUserIdsByRestaurantIds(plates) {
    const restaurantIds = plates.map((plate) => plate.restaurant); 
  
    try {
      const userPromises = restaurantIds.map(async (restaurantId) => {
        try {
          const user = await findUserByRestaurant(restaurantId); 
          return user._id; 
        } catch (error) {
          console.error(`Error finding user for restaurant ${restaurantId}:`, error);
          return null; 
        }
      });
  
      const userIds = (await Promise.all(userPromises)).filter(Boolean);
      
      return userIds; 
    } catch (error) {
      console.error("Error in processing restaurant IDs:", error);
      throw error;
    }
  }

  return service;
}

module.exports = UserService;
