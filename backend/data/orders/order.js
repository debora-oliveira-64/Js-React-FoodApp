let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let status = require("./status");

let plateSchema = new Schema({
  restaurant:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
  plate: {type: mongoose.Schema.Types.ObjectId, ref: "Plate"},
  dose : {type: String},
  price: {type: Number, min: 0}
})

let OrderSchema = new Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  date: {type: Date},
  plates: [plateSchema],
  status: { type: String, enum: [status.OnTheWay, status.Delivered], default: status.OnTheWay},
  totalPrice: { type: Number}
});

let Order = mongoose.model("Order", OrderSchema);

module.exports = Order;