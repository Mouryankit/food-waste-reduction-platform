import "./Login.css";
import React from "react";
import { useNavigate } from "react-router-dom";
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

import axios from 'axios';


const Signup = () => {
  const navigate = useNavigate(); 

  const handleSubmit = async (values, setSubmitting) => {
    try{  
        const result = await axios.post("http://localhost:8080/auth/signup", values)
          alert(result.data.message); 
          navigate("/"); 
        }
        catch(err){
          console.log(err);
          alert("Enter valid login Id and password");
        }
        setSubmitting(false);
    }


 return (

   <Formik
     initialValues={{ username: "", email: "", password: "", role: "restaurant"}}
     validationSchema={SignupSchema}
     onSubmit={(values, { setSubmitting }) => {
      //  console.log(values);
       handleSubmit(values, setSubmitting); 
       
     }}
   >
     {({ isSubmitting }) => (
       <Form className="login-form">
        <div>
           <label htmlFor="username">Username</label>
           <Field
             type="text"
             name="username"
             placeholder="Username"
             className="form-control"
           />
           <ErrorMessage name="username" component="div" className="error" />
        </div>
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
        
          <div>
           <label htmlFor="role">Role</label>
           <Field as="select" name="role" id="role" className="form-control">
            <option value="restaurant">restaurant</option>
            <option value="ngo">ngo</option>
            <option value="admin">admin</option>
          </Field>
           <ErrorMessage name="role" component="div" className="error" />
         </div>

         <button type="submit" disabled={isSubmitting}>
           {isSubmitting ? "Submitting..." : "Submit"}
         </button>

       </Form>
     )}
   </Formik>
 );
};
export default Signup;