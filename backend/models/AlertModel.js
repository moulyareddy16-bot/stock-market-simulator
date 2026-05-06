import { Schema, model }
from "mongoose";

// Alert model
const alertSchema = new Schema({

   // alert owner
   userId: {

      type:
      Schema.Types.ObjectId,

      ref: "user",

      required: true

   },


   // stock symbol
   stockSymbol: {

      type: String,

      required: true

   },


   // target price
   targetPrice: {

      type: Number,

      required: true

   },


   // ABOVE or BELOW
   condition: {

      type: String,

      enum: ["ABOVE", "BELOW"],

      required: true

   },


   // alert status
   isTriggered: {

      type: Boolean,

      default: false

   }

},
{
   timestamps: true
});


// Generate model
export const alertModel = model("alert", alertSchema);