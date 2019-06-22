const mongodb = require('mongodb');
const mongoose = require('mongoose');
var  Schema = mongoose.Schema

var productSchema = new Schema({
    item:{type:String,required:true},
    price:{type:Number,required:true},
    isImported:{type:Boolean,default:true}
},{timestamps:true})

// var orderSchema = new Schema({
//     order:[{
//         orderId:{type:Number},
//         items:[{
//             item:{type:String,required:true},
//             quantity:{type:Number},
//             isImported:{type:String}
//         }]
//     }]      
// },{timestamps:true})

var billedSchema = new Schema({
    // orderId:{type:Schema.Types.ObjectId,  ref: 'order'},
    totalSalestax:{type:Number, required:true},
    totalImportDuty:{type:Number},
    totalBill:{type:Number,required:true}
},{timestamps:true})

module.exports ={
    Product: mongoose.model('product',productSchema),
    // Order : mongoose.model('order',orderSchema),
    Billed: mongoose.model('billed',billedSchema)
}

