const mongoose = require('mongoose');
const { isEmail, isAlphanumeric,isAlpha } = require('validator'); 
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter a name'],
        maxlength:[25,'Please enter a name below 25 character'],
        minlength:[3,'Hmm please check your name again its less than 3 characters'],
        validate:[(val) => {
            return /^[a-zA-z]+([\s][a-zA-Z]+)+$/.test(val);
        },'Please enter a valid name containing alphabets']
    },
    email:{
        type: String,
        required: [true,'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password:{
        type:String,
        required:[true,'Please enter a password'],
        minlength: [6,'Minimum password length is 6 characters']
    },
});


// fire a function before doc saved to db, hashing the passwords before saving 
userSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
})
// static method to login User
userSchema.statics.login = async function (email,password){
    const user = await this.findOne({email});
    if(user){
        const auth = await bcrypt.compare(password,user.password);
        if(auth)
        {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}
const User = mongoose.model('user',userSchema);
module.exports = User;