const express = require('express');
const mongodb = require('mongodb');
const _ = require('underscore')
const Product = require('../models').Product

const createProduct = function(req,res){
    var product = req.body.product;

    Product.findOne({item:product.item},function(error,items){
        if(product.item == 'books'){
            product.isImported = false
        }
        if(items){
            console.dir(items)
            if(items.item == 'books'){
                items.isImported = false
            }
            Product.updateMany({item:product.item},{item:product.item,price:product.price,isImported:product.isImported},{upsert:false})
            .then(function(updated){
                return res.send({
                    type:"Success",
                    message:"Successfully updated",
                    data:updated
                })
            })
            .catch(function(error){
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
            .then(function(inserted){
               return res.send({
                    type:"Success",
                    message:"Successfully created",
                    data:inserted
                })
            })
            .catch(function(error){
                return res.send({
                    type:"Error",
                    message:"Items not added",
                    data:error
                })
            })
        }
    })
}

const listAllProduct = function(req,res,data){
    console.log("fkjvbbbbbbbbdfk")
    Product.find({})
    .then(function(success){
       return res.json({
           type:"Success",
           data:success
       });
    })
    .catch(function(error){
       return res.json({
           type:"Error",
           data:error
       })
    })
}

const placeOrder = function(req,res){
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
    console.log(itemByQuantity,"items")
    var items = Object.keys(itemByQuantity);
    items = _.union(items);
  
    Product.find({
      item:{
          $in:items
      }  
    })
    .then(function(founded_items){
        var items_without_import = []
        var item_with_tax = founded_items.map((p)=>{
            p.price = p.price * itemByQuantity[p.item];
            if(p.isImported == false){
                console.log(p.price,p.item)
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

        var sales_tax = sum_price_for_tax * 10/100;
        var imported_duty = (sum_price_for_tax - sum_price_for_non_import) *( 5/100)
        
        var totalBill = sum_price_for_tax + sales_tax + imported_duty;
        
        return res.send({
            totalSalesTax:sales_tax,
            totalImportDuty:imported_duty,
            totalBill:totalBill   
        })
    })
    .catch(function(error){
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
    listAllProduct:listAllProduct
}
