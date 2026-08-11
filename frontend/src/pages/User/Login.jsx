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
                        <div className="password">
                            <Field
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                className="form-control"
                            />
                            <button onClick={handleShowPassword} className="show-password-btn">{showPassword ? "Hide" : "show"}</button>
                        </div>
                        <ErrorMessage name="password" component="div" className="error" />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                    <button type="button" onClick={handlePasswordReset}>Forget password</button>
                </Form>
            )}
        </Formik>
    );
};
export default Login;