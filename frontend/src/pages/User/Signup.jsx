import "./style.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const SignupSchema = Yup.object().shape({
    username: Yup.string()
        .min(5, "username must be at least 5 characters")
        .required("username is required"),
    email: Yup.string()
        .email("Invalid email address format")
        .required("Email is required"),
    password: Yup.string()
        .min(3, "Password must be at least 3 characters")
        .required("Password is required"),
});

import API from "../../api";
import MapComponent from "../Map/Map.jsx";


const Signup = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [location, setLocation] = useState(null);

    const handleSubmit = async (values, setSubmitting) => {
        try {
            const signupData = {
                ...values,
                location: location
            };
            const result = await API.post("/auth/signup", signupData)
            alert(result.data.message);
            navigate("/");
        }
        catch (err) {
            console.log(err);
            alert("Enter valid login Id and password");
        }
        setSubmitting(false);
    }

    const handleShowPassword = (event) => {
        event.preventDefault();
        setShowPassword(!showPassword);
    }

    return (

        <Formik
            initialValues={{ username: "", email: "", password: "", role: "restaurant" }}
            validationSchema={SignupSchema}
            onSubmit={(values, { setSubmitting }) => {
                //  console.log(values);
                handleSubmit(values, setSubmitting);

            }}
        >
            {({ isSubmitting }) => (
                <Form className="form auth-form signup-form">
                    <h1>Sign Up</h1>
                    <p className="auth-subtitle">Join us in reducing food waste today.</p>
                    <div>
                        <label htmlFor="username">Username</label>
                        <Field
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="input signup-input"
                        />
                        <ErrorMessage name="username" component="div" className="error auth-error" />
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <Field
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="input signup-input"
                        />
                        <ErrorMessage name="email" component="div" className="error auth-error" />
                    </div>

                    <div>
                        <label htmlFor="role">Role</label>
                        <Field as="select" name="role" id="role" className="input signup-input">
                            <option value="restaurant">restaurant</option>
                            <option value="ngo">ngo</option>
                            {/* <option value="admin">admin</option> */}
                        </Field>
                        <ErrorMessage name="role" component="div" className="error auth-error" />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="auth-password-wrapper">
                            <Field
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                className="input signup-input"
                            />
                            <button type="button" onClick={handleShowPassword} className="button secondary-button auth-show-password-btn">{showPassword ? "Hide" : "show"}</button>
                        </div>
                        <ErrorMessage name="password" component="div" className="error auth-error" />
                    </div>

                    <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                        <span style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text-title)", textAlign: "left" }}>Location Coordinates</span>
                        <MapComponent
                            height="300px"
                            width="100%"
                            setLocation={setLocation}
                        />
                        {location && (
                            <div style={{ marginTop: "10px" }}>
                                <p><strong>Latitude:</strong> {location.latitude}</p>
                                <p><strong>Longitude:</strong> {location.longitude}</p>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="button primary-button auth-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                </Form>
            )}
        </Formik>
    );
};
export default Signup;