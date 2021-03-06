const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth')
const Profile=require('../../models/Profile')
const User=require('../../models/User')
const {check, validationResult}=require('express-validator')
//@route  GET api/profil/me
//@desc Test route
//@access Public
router.get('/me', auth, async(req,res)=>{
try{
const profile=await Profile.findOne({user:req.user.id}).populate('user', ['name', 'avatar'])
if (!profile){
    return res.status(400).json({msg:'There is no profile for this user'})
}
res.json(profile)
}
catch(err){
    console.error(err.message);
    res.status(500).send('Server Error')

}
})
//@route  GET Post api/user profile
//@desc Create or update user profile
//@access Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'skills is require').not().isEmpty()
]], async (req,res)=>{
const errors=validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const{
    company,
      location,
      status,
      skills,
      bio,
      githubusername,
      website,
      youtube, 
      facebook,
      twitter,
      instagram,
      linkedin
}=req.body

//build profile object
const profileFields={};
profileFields.user=req.user.id;
if (company) profileFields.company=company;
if (website) profileFields.website=website;
if (bio) profileFields.bio=bio;
if (status) profileFields.status=status;
if (githubusername) profileFields.githubusername=githubusername;
if (skills) {
    profileFields.skills=skills.split(',').map(skill=>skill.trim())
};

//build social object
profileFields.social={}
if (youtube) profileFields.social.youtube=youtube;
if (twitter) profileFields.social.twitter=twitter;
if (facebook) profileFields.social.facebook=facebook;
if (linkedin) profileFields.social.linkedin=linkedin;
if (instagram) profileFields.social.instagram=instagram;

try {
    let profile=await Profile.findOne({user:req.user.id})
    if (profile){
      //  update
      profile=await Profile.findOneAndUpdate({user:req.user.id}, 
        {$set:profileFields},
        {new:true});
        return res.json(profile)
    }
    //Create 
    profile= new Profile(profileFields)
    await profile.save();
    res.json(profile)
}
 catch (err){
    console.error(err.message);
    res.status(500).send('Server Error')
}
})
//@route  GET get api profile
//@desc get all profiles
//@access Public

router.get('/', async(req,res)=>{
    try {
const profiles= await Profile.find().populate('user',['name', 'avatar'])
  res.json(profiles)  
}
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')

    }
})

//@route  GET get api/ profile/user/:userid
//@desc get profile by user ID
//@access Public

router.get('/user/:user_id', async(req,res)=>{
    try {
const profile= await Profile.findOne({user:req.params.user_id}).populate('user',['name', 'avatar'])
  if (!profile)
    return res.status(400).json({msg:"Profile not found"})  
  
res.json(profile)  
}
    catch(err){
        console.error(err.message);
        if(err.kind=="ObjectId"){
            return res.status(400).json({msg:"Profile not found"})  

        }
        res.status(500).send('Server Error')

    }
})
//@route  GET get api/ profile
//@desc delete  profile, user &posts
//@access Private
router.delete('/', async(req,res)=>{
    try {
        // @todo --remove users posts
        
        // remove profile
await Profile.findOneAndRemove({user:req.user.id})
        // remove user
await User.findOneAndRemove({_id:req.user.id})

res.json({msg:"User deleted"})  
}
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')

    }
})

module.exports=router;