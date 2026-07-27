import "./style.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address format")
        .required("Email is required"),
    password: Yup.string()
        .min(3, "Password must be at least 3 characters")
        .required("Password is required"),
});


const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (values, setSubmitting) => {
        // console.log(values);
        try {
            const result = await axios.post("http://localhost:8080/auth/login", values)

            if (result && result.data && result.data.token) {
                localStorage.setItem("token", result.data.token);
                if(values.role == "restaurant"){
                    navigate("/restaurant");
                }   
                else if(values.role == "ngo"){
                    navigate("/ngo"); 
                }
                else{
                    navigate("/admin"); 
                }
            }

            alert(result.data.message);
        }
        catch (err) {
            console.log("Enter valid Data");
            alert("Enter valid user, password and role");
        }
        setSubmitting(false);
    }

    const handlePasswordReset = (event) => {
        event.preventDefault();
        navigate("/reset-password");
    }
    const handleShowPassword = (event) => {
        // console.log(event.target.values);
        event.preventDefault();
        setShowPassword(!showPassword);
    }
    return (

        <Formik
            initialValues={{ email: "", password: "", role: "restaurant" }}
            validationSchema={LoginSchema}
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

                    <div>
                        <label htmlFor="password">Select Role</label>
                        <Field as="select" name="role" className="form-control">
                            <option value="restaurant">Restaurant</option>
                            <option value="ngo">NGO</option>
                            <option value="admin">Admin</option>
                        </Field>
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <Field
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            className="form-control"
                        />
                        <button onClick={handleShowPassword}>{showPassword ? "Hide" : "show"}</button>
                        <ErrorMessage name="password" component="div" className="error" />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                    <button onClick={handlePasswordReset}>Forget password</button>
                </Form>
            )}
        </Formik>
    );
};
export default Login;