import "../style.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

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
            // console.log(result); 
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
            <Form className="form">
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

export default VerifyOtpForm; 

