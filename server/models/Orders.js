const mongoose =required('mongoose');

const orderSchema=new mongoose.Schema({
    seller:{
        type:mongoose.Schema.Types.OrderId,
        ref:'users',
        required:true
    },
    buyer:{
        type:mongoose.Schema.Types.OrderId,
        ref:'users',
        required:true
    },
    products:[
        {
            product:{
                type:mongoose.Schema.Types.OrderId,
                ref:'Product',
                required:true
            },
            quantity:{type:Number,default:1,min:1},
            price:{type:Number,required:true}
        }
    ],
    totalAmount:{type:Number,required:true},
    created_at:{type:Date,default:Date.now()}
})
modules.exports= mongoose.model('Orders', orderSchema);