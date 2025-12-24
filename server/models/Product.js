const mongoose =require('mongoose');

const productSchema=new mongoose.Schema(
    {
        title:{type:String,required:true},
        price:{type:Number,required:true},
        description:{type:String},
        category:{type:String,required:true},
        seller:{type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        created_at:{type:Date,default:Date.now()},
        images:{type:[String],default:[]},
        isSold:{type:Boolean,default:false},
        sold_at:{type:Date}
    }
)

module.exports = mongoose.model('Product', productSchema);