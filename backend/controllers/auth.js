const {mongoose } = require("mongoose");


const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

const register = async(req,res)=>{
    try{
    const {name,email,password} = req.body;
    if(!email || !password || !name){
        res.status(400).json({
            success:false,
            message:"Please insert required Details."
        })
    }

    const existing = await user.findOne({email});
    if(existing){
        return res.status(400).json({
            success:false,
            message:"Email already exists"
        })
    }

    const user = User.create({
        name,
        email,
        password
    })

    const token = generateToken(

    )
    }
    catch(err){
        console.log("Coudn't register user..")
        res.status(500).json({
            success:false,
            message:"internal server error !" || err.message,
        })
    }

}