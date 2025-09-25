let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RestaurantSchema = new Schema({
    name:{type: String, require: true},
    plates: [{type: mongoose.Schema.Types.ObjectId, ref: "Plate"}],
    category: {type: String, require: true},
    valid: {type: Boolean, default: false}
})

let Restaurant = mongoose.model("Restaurant", RestaurantSchema);

module.exports = Restaurant;