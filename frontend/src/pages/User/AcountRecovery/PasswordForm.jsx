import "../style.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../../api";


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
    const [showPassword, setShowPassword] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    const handleShowPassword = (event) => {
        event.preventDefault(); 
        setShowPassword(!showPassword); 
    }
    const handleSetShowPassword = (event) => {
        event.preventDefault(); 
        setShowConfirmPassword(!showConfirmPassword); 
    }
    const handleSubmit = async (values, setSubmitting) => {
        if(values.password != values.confirmPassword){ 
            alert("Password do not match");
            setSubmitting(false);  
            return; 
        }
        try{  
            const userData = {password: values.password};
            const headersInfo = {headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }}
            const result = await API.post("/auth/reset-password", userData, headersInfo);
            
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
            <Form className="form auth-form password-reset-form">
                <h1>New Password</h1>
                <p className="auth-subtitle">Create a strong password for your account.</p>
                <div>
                    <label htmlFor="password">Enter Password</label>
                    <div className="auth-password-wrapper">
                        <Field
                            type={showPassword?"text":"password"}
                            name="password"
                            placeholder="Enter your password"
                            className="input recovery-input"
                        />
                        <button onClick={handleShowPassword} className="button secondary-button auth-show-password-btn">{showPassword ? "Hide": "Show"}</button>
                    </div>
                    <ErrorMessage name="password" component="div" className="error auth-error" />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="auth-password-wrapper">
                        <Field
                            type={showConfirmPassword?"text":"password"}
                            name="confirmPassword"
                            placeholder="Enter your password"
                            className="input recovery-input"
                        />
                        <button onClick={handleSetShowPassword} className="button secondary-button auth-show-password-btn">{showConfirmPassword ? "Hide": "Show"}</button>
                    </div>
                    
                    <ErrorMessage name="confirmPassword" component="div" className="error auth-error" />
                </div>

                <button type="submit" className="button primary-button auth-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </Form>
        )}
        </Formik>
    )
}

export default PasswordForm;
