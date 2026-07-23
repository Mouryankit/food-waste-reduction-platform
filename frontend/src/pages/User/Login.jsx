import "./Login.css";
import React from "react";
import { useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (values, setSubmitting) => {
    try{  
      const result = await axios.post("http://localhost:8080/auth/login", values)

      if(result && result.data && result.data.token){
        localStorage.setItem("token", result.data.token);
        navigate("/"); 
      }

      alert(result.data.message);
    }
    catch(err){
      console.log("Enter valid Data");
      alert("Enter valid userId and password"); 
    }
    setSubmitting(false); 
  }
  
  const handlePasswordReset = (event) =>{
    event.preventDefault();  
    alert("feature not available yet"); 
  }

 return ( 

   <Formik
     initialValues={{ email: "", password: "" }}
     validationSchema={LoginSchema}
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

         <div>
           <label htmlFor="password">Password</label>
           <Field
             type="password"
             name="password"
             placeholder="Enter your password"
             className="form-control"
           />
           <ErrorMessage name="password" component="div" className="error" />
         </div>

         <button onClick={handlePasswordReset}>Forget password</button>

        <button type="submit" disabled={isSubmitting}>
           {isSubmitting ? "Submitting..." : "Submit"}
         </button>

       </Form>
     )}
   </Formik>
 );
};
export default Login;