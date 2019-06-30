const express = require('express');
const mongodb = require('mongodb');
const _ = require('underscore')
const Product = require('../models').Product
const Data = require('../config').data

// User  have to create a product , if same product u entered ,it updates. this API only for me to add items in mongodb.
// {
	// "product":{
	// 	"item":"musics",
	// 	"price":30,
	// 	"isImported":"true"
	// }
    //}	 
//
const createProduct = (req,res)=>{
    var product = req.body.product;

    Product.findOne({item:product.item},(error,items)=>{
        if(product.item == 'books'){
            product.isImported = false
        }
        if(items){
            if(items.item == 'books'){
                items.isImported = false
            }
            Product.updateOne({item:product.item},{item:product.item,price:product.price,isImported:product.isImported},{upsert:false})
            .then(function(updated){
                return res.send({
                    type:"Success",
                    message:"Successfully updated",
                    data:updated
                })
            })
            .catch((error)=>{
                return res.send({
                    type:"Error",
                    message:"Items not updated",
                    data:error
                })
            })
        }else{
            Product.create({
                item:product.item,
                price:product.price,
                isImported:product.isImported
            })
            .then((inserted)=>{
               return res.send({
                    type:"Success",
                    message:"Successfully created",
                    data:inserted
                })
            })
            .catch((error)=>{
                return res.send({
                    type:"Error",
                    message:"Items not added",
                    data:error
                })
            })
        }
    })
}
 // *** For "Show PRODUCTS" ***//

// we should be able to enter product, quantity of the product. The
//system should show the price for each product and total price at the bottom.

//input
/******** USER INPUT ******** */
// {
// 	"order":[
// 		{
// 		"item":"books",
// 		"quantity":2
// 		},
// 		{
// 		"item":"music",
// 		"quantity":2
// 		}
	
// 	]
	
// }

//  OUTPUT //
// {
//     "type": "success",
//     "items": {
//         "books": 40,
//         "music": 30
//     },
//     "totalPrice": 140
// }

const showProducts = (req,res)=>{
    var order = req.body.order;

    var itemsFromOrder = {};
    for(var i= 0; i<order.length;i++){
        itemsFromOrder[order[i].item] = order[i].quantity
    }  
    var items = Object.keys(itemsFromOrder)
    items = _.union(items);
    Product.find({
      item:{
          $in:items
      }  
    })
    .then((ordered_items)=>{
        var itemsWithPrice = {};
        for(var i= 0; i<ordered_items.length;i++){
            itemsWithPrice[ordered_items[i].item] = ordered_items[i].price
        }   
        var Price =[];
        var itemsPrice = ordered_items.map((p)=>{
            p.price = p.price * itemsFromOrder[p.item];
            Price.push(p.price)
            return  p ? p.price : 0;
        });
        itemsPrice = _.without(itemsPrice,undefined,null)
        var totalPrice = itemsPrice.reduce((acc,val)=>{
            return acc+val
        },0)
            
        return  res.send({
            type:"success",
            itemsWithPrice:itemsWithPrice,
            totalPrice:totalPrice
        })
    })
    .catch((error)=>{
        return res.send({
            type:"error",
            message:"No Products has to display",
            data:error
        })
    })

}

// For PlaceOrder //
// INPUT //
//  {
	// "order":[
	// 	{
	// 	"item":"books",
	// 	"quantity":2
	// 	},
	// 	{
	// 		"item":"music",
	// 		"quantity":3
	// 	}
	
    // ]
    //}
//
// OUTPUT //
// {
    // "totalSalesTax": 17,
    // "totalImportDuty": 4.5,
    // "totalBill": 191.5
    //} 
//
const placeOrder = (req,res)=>{
    var order = req.body.order;
  
    // var order_map =  order.map((obj,key)=>{
    //     console.log(key,"ll")
    //     var robj ={}
    //     robj[obj.item]=obj.quantity
    //     return robj
    // })
  
    var itemByQuantity = {};
    for(var i= 0; i<order.length;i++){
        itemByQuantity[order[i].item] = order[i].quantity
    }
    var items = Object.keys(itemByQuantity);
    items = _.union(items);
  
    Product.find({
      item:{
          $in:items
      }  
    })
    .then((founded_items)=>{
        var items_without_import = []
        var item_with_tax = founded_items.map((p)=>{
            p.price = p.price * itemByQuantity[p.item];
            if(p.isImported == false){
                items_without_import.push(p.price)
            }
              return  p ? p.price : 0;
        })
        item_with_tax = _.without(item_with_tax,undefined,null)
        items_without_import = _.without(items_without_import,undefined,null);
      
        var sum_price_for_tax = item_with_tax.reduce((acc,val)=>{
            return acc +val
        },0);

        var sum_price_for_non_import = items_without_import.reduce((acc,val)=>{
            return acc + val;
        },0);

        var sales_tax = sum_price_for_tax * Data.sales_tax
        var imported_duty = (sum_price_for_tax - sum_price_for_non_import) * Data.import_tax
        
        var totalBill = sum_price_for_tax + sales_tax + imported_duty;
        
        return res.send({
            totalSalesTax:sales_tax,
            totalImportDuty:imported_duty,
            totalBill:totalBill   
        })
    })
    .catch((error)=>{
        return res.send({
            type:"Error",
            message:"No Data's Found",
            data:error
        })
    })
}

module.exports = {
    createProduct:createProduct,
    placeOrder:placeOrder,
    showProducts:showProducts
}
