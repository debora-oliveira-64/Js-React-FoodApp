let mongoose = require("mongoose");
let scopes = require("./scopes");

let Schema = mongoose.Schema;

let RoleSchema = new Schema({
  name: { type: String, required: true },
  scopes: [
    {
      type: String,
      enum: [scopes.Admin, scopes.Restaurant, scopes.Client],
    },
  ],
});

let UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: RoleSchema },
  ifRestaurant: {type: mongoose.Schema.Types.ObjectId, ref: "Restaurant"}
});

let User = mongoose.model("User", UserSchema);

module.exports = User;
