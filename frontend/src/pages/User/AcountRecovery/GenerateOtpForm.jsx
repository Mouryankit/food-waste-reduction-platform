import "../style.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

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
            <Form className="form">
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

export default GenerateOtpForm; 

