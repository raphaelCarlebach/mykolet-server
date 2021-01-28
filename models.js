const mongoose = require("mongoose");
const Joi = require("joi");

// user
const Schema = mongoose.Schema({
    username: String,
    email: {
        type: String,
        index: {
            unique: true
        }
    },   
    password: String
});

const User = mongoose.model('User', Schema);
exports.User = User;

// products
const ProductSchema = mongoose.Schema({
    PriceUpdateDate: String,
    ItemCode: String,    
    ItemType : String,   
    ItemName: String,
    ManufacturerName: String,
    ManufactureCountry: String,
    ManufacturerItemDescription: String,
    UnitQty: String,
    Quantity: String,
    bIsWeighted: String,
    UnitOfMeasure: String,
    QtyInPackage: String,
    ItemPrice: String,
    UnitOfMeasurePrice: String,
    AllowDiscount: String,
    ItemStatus: String
});

const Product = mongoose.model('Product', ProductSchema);
exports.Product = Product;


const ListSchema = mongoose.Schema({
    title: String,
    user_id: String,
    date: String,
    // date: Date,
    items: Array
});

const List = mongoose.model('List', ListSchema);
exports.List = List;

const itemsSchema = mongoose.Schema({
    titel: String,
    quantity: Number,
    pid: Number,
    isChecked: Boolean
});

const Item = mongoose.model('Item', itemsSchema);
exports.Item = List;