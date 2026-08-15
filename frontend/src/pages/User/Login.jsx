import "./style.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";

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
    const { checkAuth } = useAuth();

    const handleSubmit = async (values, setSubmitting) => {
        try {
            const result = await API.post("/auth/login", values, {withCredentials: true}); 
            // console.log(result);
            await checkAuth();
            // if (result) {
            navigate("/");
            // }

            alert(result?.data?.message);
        }
        catch (err) {
            console.log("Enter valid Data");
            console.log(err.response.data.message); 
            alert(err.response.data.message);
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
                <Form className="form auth-form login-form">
                    <h1>Login</h1>
                    <p className="auth-subtitle">Welcome back! Please enter your details.</p>
                    <div>
                        <label htmlFor="email">Email</label>
                        <Field
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="input login-input"
                        />
                        <ErrorMessage name="email" component="div" className="error auth-error" />
                    </div>

                    <div>
                        <label htmlFor="role">Select Role</label>
                        <Field as="select" name="role" className="input login-input">
                            <option value="restaurant">Restaurant</option>
                            <option value="ngo">NGO</option>
                            <option value="admin">Admin</option>
                        </Field>
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="auth-password-wrapper">
                            <Field
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                className="input login-input"
                            />
                            <button onClick={handleShowPassword} className="button secondary-button auth-show-password-btn">{showPassword ? "Hide" : "show"}</button>
                        </div>
                        <ErrorMessage name="password" component="div" className="error auth-error" />
                    </div>

                    <button type="submit" className="button primary-button auth-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                    <button type="button" className="button secondary-button auth-reset-btn" style={{ width: "100%", marginTop: "10px" }} onClick={handlePasswordReset}>Forget password</button>
                </Form>
            )}
        </Formik>
    );
};
export default Login;