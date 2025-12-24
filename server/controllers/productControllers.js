const Product = require('../models/Product');
const User=require('../models/Users');
const Order=require('../models/Orders');
//gives the total number of users who have an account on the web
const totalUsers=async(req,res)=>{
    try{
        //count total users
        let users= await User.countDocuments({});
        res.status(200).json({"total users:":users})
    }catch(err){
        console.error("error in finding the no of users",err.message);
        res.status(500).json({message:"server error while counting the users"})
    }   
}

//fucntion for selling the item 
const sellItem=async(req,res)=>{
    const{title,price,category}=req.body;
    const seller=req.userId;
    try{
        //make a new object for the item details
        const product=new Product({title,price,category,seller});
        //save the item in DB
        await product.save();
        res.status(201).json({message:"prodect listed successfully",product})
    }catch(err){
        console.error("error while listing the product",err.message);
        res.status(500).json({message:"server error"})
    }
}
//function for buying the item
const buyItem = async (req, res) => {
  try {
    const { productId,totalAmount} = req.body;
    const buyerId = req.userId; // from JWT middleware

    // 1. Find product
    const product = await Product.findOne({_id:productId,isSold:false});
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Get seller from product
    const sellerId = product.seller;

    // 3. Create new order
    const order = new Order({
        buyer: buyerId,
        seller: sellerId,  
        product: productId,
        totalAmount
    });
    // 4. Save order
    await order.save();
    product.isSold=true;
    product.sold_at=Date.now();
    await product.save();
    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({ message: "Server error while placing order" });
  }
};
//my products sold or unsold
const myProducts=async(req,res)=>{
  const seller=req.userId;
  try{
    const product=await Product.find({seller});
    if(!product){
      return res.status(404).json({message:"you didn't list any item here"})
    }
    re.status(200).json(product)
  }catch(err){
    console.error("server error while finding the product",err.message);
    res.status(500).json({message:"server error"});
  }
}
//get all products list which are unsold
const productList=async(req,res)=>{
  try{
    const product=await Product.find({isSold:false})
    if(!product){
      return res.status(404).json({message:"No product listed yet/ Sold out"})
    }
    res.status(200).json({message:"products are",product})
  }catch(err){
    res.status(500).json("server error");
    console.error("server erorr while fetching the list of products",err.message)
  }
}
//edit the item which is not selled yet
const editItem=async(req,res)=>{
   try{
    const {productId}=req.param;
    const userId=req.user.id;
    const update=req.body;
    const product=await Product.findById(productId);
    if(!product){
        res.status(404).json({message:"product does not exists"});
    }
    if (product.isSold) {
            return res.status(400).json({ 
                message: "Forbidden: You cannot edit a product that has already been sold." 
            });
    }
    if(product.seller.toString()!==userId){
       return res.status(403).json({ 
            message: "Unauthorized: You can only edit your own products" 
        });
    }
    const updatedProduct=await Product.findByIdAndUpdate(
        productId,
        {$set:update},
        {new:true,runValidators:true}
    );res.status(200).json({
            message: "Product updated successfully!",
            data: updatedProduct
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
    
}
module.exports={totalUsers,sellItem,buyItem,myProducts,productList,editItem}