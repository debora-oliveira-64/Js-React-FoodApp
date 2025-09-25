let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let type = require("./plateType"); 
let dose = require("./dose");

let DoseSchema = new Schema({
  type: {type: String, enum: [dose.small, dose.medium, dose.large], require: true},
  price: {type: Number, require: true}
});

let PlateSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum:[type.meat, type.fish, type.vegan, type.dessert], required: true},
  dose: [{ type: DoseSchema }],
  images: [{type: String}],
  description: {type:String},
  nutrionalValue: {type: String}
});

let Plate = mongoose.model("Plate", PlateSchema);

module.exports = Plate;