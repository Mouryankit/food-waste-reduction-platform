import "./Login.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const passwordSchema = Yup.object().shape({
    password: Yup.string()
        .min(3, "Password must be at least 3 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .min(3, "password must be at least 3 characters")
        .required("password is required")
});

const PasswordForm = ({token}) => {
    const navigate = useNavigate(); 
    const [showPassword, setShowPassword] = useState(true); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(true); 
    const handleShowPassword = (event) => {
        event.preventDefault(); 
        setShowPassword(!showPassword); 
    }
    const handleSetShowPassword = (event) => {
        event.preventDefault(); 
        setShowConfirmPassword(!showConfirmPassword); 
    }
    const handleSubmit = async (values, setSubmitting) => {
        console.log(values); 
        if(values.password != values.confirmPassword){ 
            alert("Password do not match");
            setSubmitting(false);  
            return; 
        }
        try{  
            // console.log(values); 
            const userData = {password: values.password};
            const headersInfo = {headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }}
            console.log(userData, headersInfo); 
            const result = await axios.post("http://localhost:8080/auth/reset-password", userData, headersInfo);
            
            if(result){
                alert(result.data.message);
                navigate("/"); 
            }
        }
        catch(err){
            console.log("Enter valid Data");
            alert("Enter valid userId and password"); 
        }
        setSubmitting(false); 
    }
    return (
        <Formik
            initialValues={{password: "", confirmPassword: "" }}
            validationSchema={passwordSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values, setSubmitting); 
            }}
        >
        {({ isSubmitting }) => (
            <Form className="login-form">
                <div>
                    <label htmlFor="password">Enter Password</label>
                    <Field
                        type={showPassword?"text":"password"}
                        name="password"
                        placeholder="Enter your password"
                        className="form-control"
                    />
                    <button onClick={handleShowPassword}>{showPassword ? "hide": "show"}</button>
                    <ErrorMessage name="password" component="div" className="error" />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <Field
                        type={showConfirmPassword?"text":"password"}
                        name="confirmPassword"
                        placeholder="Enter your password"
                        className="form-control"
                    />
                    <button onClick={handleSetShowPassword}>{showConfirmPassword ? "hide": "show"}</button>
                    <ErrorMessage name="confirmPassword" component="div" className="error" />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </Form>
        )}
        </Formik>
    )
}

const verifyOtpSchema = Yup.object().shape({
    otp: Yup.string()
        .min(6, "otp must be at least 6 characters")
        .max(6, "otp must be maximum 6 characters")
        .required("otp is required"),
});
const VerifyOtpForm = ({email, setVerifyEmail, setToken}) =>  {
    const handleSubmit = async (values, setSubmitting) => {
        // console.log(values); 
        // console.log(props);
        const data = {
            "email": email,
            ...values
        }
        try{
            let url = "http://localhost:8080/auth/verify-otp"; 
            const result = await axios.post(url, data); 
            console.log(result); 
            alert(result.data.message);
            setVerifyEmail(true); 
            setToken(result.data.token); 
        }
        catch(err){
            console.log(err); 
            alert("OTP not verified", err);
        }
        setSubmitting(false); 
        
    }
    return (
        <Formik
            initialValues={{otp: ""}}
            validationSchema={verifyOtpSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values, setSubmitting); 
            }}
        >
        {({ isSubmitting }) => (
            <Form className="login-form">
                <div>
                    <label htmlFor="otp">Enter OTP</label>
                    <Field
                        type="text"
                        name="otp"
                        placeholder="Enter otp recieve via email"
                        className="form-control"
                    />
                    <ErrorMessage name="otp" component="div" className="error" />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </Form>
        )}
        </Formik>
    )
}

const generateOtpSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address format")
        .required("Email is required"),
});

const GenerateOtpForm = ({setEmail, setOtpSent}) => {
    const handleSubmit = async (values, setSubmitting) => {
        console.log(values); 
        let url = "http://localhost:8080/auth/generate-otp"
        try{
            const result = await axios.post(url, values);
            if(result){
                alert(result.data.message); 
                setEmail(values.email); 
                setOtpSent(true);
            } 
        }
        catch(err){
            alert(err); 
        }
         
        setSubmitting(false); 
         
    }
    return (
        <Formik
            initialValues={{email: ""}}
            validationSchema={generateOtpSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values, setSubmitting); 
            }}
        >
        {({ isSubmitting }) => (
            <Form className="login-form">
                <div>
                    <label htmlFor="email">Email</label>
                    <Field
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="form-control"
                    />
                    <ErrorMessage name="email" component="div" className="error" />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "generate Otp"}
                </button>
            </Form>
        )}
        </Formik>
    )
}

const ResetPassword = () => {
    const [otpSent, setOtpSent] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState(false); 
    const [email, setEmail] = useState(""); 
    const [token, setToken] = useState(""); 
    if(otpSent && verifyEmail){
        return <PasswordForm token={token}/>
    }
    else if(otpSent){
        return <VerifyOtpForm email={email} setVerifyEmail={setVerifyEmail} setToken={setToken}/>
    }
    else {
        return <GenerateOtpForm setEmail={setEmail} setOtpSent={setOtpSent}/>
    }
};

// export default GenerateOtpForm;
// export default VerifyOtpForm;
// export default PasswordForm;
export default ResetPassword;
