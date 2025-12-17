const mongoose =require('mongoose');

const productSchema=new mongoose.Schema(
    {
        title:{type:String,required:true},
        price:{type:Number,required:true},
        description:{type:String},
        category:{type:String,required:true},
        seller:{type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            required:true
        },
        created_at:{type:Date,default:Date.now()},
        images:{type:[String],validate:[ArrayLimits,'{PATH} exceeds the limit of 3']}
    }
)
function ArrayLimits(val){
    return val.lenght<=3
}
module.exports = mongoose.model('Product', productSchema);