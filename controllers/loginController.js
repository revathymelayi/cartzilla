const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

//signup
const signUp = async (req, res) => {
  try {
    res.render("signup", {
      title: "Cartzilla- Sign up",
      message: "",
      signup: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendEmailVerification = async (firstname, lastname, email, userid) => {
  try {
    const emailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "cartzillabangalore@gmail.com",
        pass: "utehlwpnrjtmiems",
      },
    });
    const mailOptions = {
      from: "cartzillabangalore@gmail.com",
      to: email,
      subject: "Verify your email address",
      html:
        "<p>Hi " +
        firstname +
        " " +
        lastname +
        ', please click here to <a href="http://localhost:3000/user/verify?email=' +
        email +
        '"> Verify</a> your email</p>',
    };
    emailTransporter.sendMail(mailOptions, function (error, res) {
      if (error) console.log(error);
      else console.log("Email has been sent: ", res.response);
    });
  } catch (error) {
    console.log(error.message);
  }
};
const createUser = async (req, res) => {
  try {
    const checkUser = await User.findOne({ email: req.body.email });
    if (!checkUser) {
      if(req.body.password===req.body.confpassword){
      const user = User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        phone: req.body.phone,
        status: 1,
        is_verified: 0,
      });

      const userDetails = await user.save();
      if (userDetails) {
        sendEmailVerification(
          req.body.first_name,
          req.body.last_name,
          req.body.email,
          userDetails._id
        );
        res.render("signup", {
          message:
            "Registered successfully.Please check the mail to verify your account",
        });
      } else {
        res.render("signup", { error: "Registration failed" });
      }
    }else {
      res.render("signup",{error:"Confirmpassword and password must be same"})
    }}
    else{
      res.render("signup", { error: "Email already taken" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const verifyMail = async (req, res) => {
  try {
    const updateUserDetails = await User.updateOne(
      { email: req.query.email },
      { $set: { is_verified: true } }
    );
    res.render("email-verification");
  } catch (error) {
    console.log(error.message);
  }
};

//Sign In
const signin = async (req, res) => {
  let isLogged = false;
  try {
    if (req.session.user) {
      isLogged = true;
    }
    res.render("signin", {
      title: "Cartzilla -Sign In",
      message: "",
      checkUser: isLogged,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const authenticate = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (user.is_verified) {
        bcrypt.compare(req.body.password, user.password, (err, data) => {
          if (data) {
            req.session.user = user.email;
            res.redirect("/");
          } else res.render("signin", { err: "Incorrect password " });
        });
      } else {
        res.render("signin", { err: "Please verify your email " });
      }
    } else res.render("signin", { err: "Incorrect email" });
  } catch (error) {
    console.log("success", error);
  }
};

const passwordRecovery =async(req,res)=>{
  try{
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData){
      res.render('forgotPassword',{ user_id: tokenData._id })
    }
    else{
      res.render("404", { message: "token is invalid" });
    }
    
  }
  catch(error){
    console.log(error.message)
  }
};

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "cartzillabangalore@gmail.com",
        pass: "utehlwpnrjtmiems",
      },
    });
    const mailOptions = {
      from: "cartzillabangalore@gmail.com",
      to: email,
      subject: "For reset password ",
      html:
        "<p>Hi " +
        name +
        ' ,please click here: <a href="http://localhost:3000/forget-password?token=' +
        token +
        '">Reset </a> your password.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  signUp,
  createUser,
  verifyMail,
  signin,
  authenticate,
  passwordRecovery,
  sendResetPasswordMail

};
