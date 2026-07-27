// import "./DonationForm.css"; 

// export default function(){
//     return (
//         <div className="donation-form">
//             <h1>Donation form</h1>
//         </div>
//     )
// }




import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const donationFormSchema = Yup.object().shape({
    foodname: Yup.string()
        .min(2, "Food name must be at least 2 characters")
        .required("Food name is required"),

    quantity: Yup.number()
        .positive("Quantity must be greater than 0")
        .required("Quantity is required"),

    unit: Yup.string()
        .required("Unit is required"),

    description: Yup.string()
        .max(300, "Description is too long"),

    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
        .required("Phone number is required"),

    pickupAddress: Yup.string()
        .min(10, "Address should be at least 10 characters")
        .required("Pickup address is required")
});

import axios from 'axios';


export default function () {
    const navigate = useNavigate();

    const handleSubmit = async (values, setSubmitting) => {
        try {
            // const result = await axios.post("http://localhost:8080/", values)
            // alert(result.data.message);
            navigate("/");
        }
        catch (err) {
            console.log(err);
            alert("Enter valid login Id and password");
            // alert(err.description.data.message);
        }
        setSubmitting(false);
    }

    return (

        <Formik
            initialValues={{ foodname: "", quantity: "", unit: "kg", description: "", phone: "", pickupAddress: "" }}
            validationSchema={donationFormSchema}
            onSubmit={(values, { setSubmitting }) => {
                //  console.log(values);
                handleSubmit(values, setSubmitting);
            }}
        >
            {({ isSubmitting }) => (

                <Form className="form">
                    <h3>Donate Food</h3>
                    <div>
                        <label htmlFor="foodname">Food Name</label>
                        <Field
                            type="text"
                            name="foodname"
                            placeholder="Food name"
                            className="form-control"
                        />
                        <ErrorMessage name="foodname" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="quantity">Quantity</label>
                        <Field
                            type="number"
                            name="quantity"
                            placeholder="Food quantity"
                            className="form-control"
                        />
                        <ErrorMessage name="quantity" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="unit">Unit</label>
                        <Field as="select" name="unit" id="unit" className="form-control">
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="L">L</option>
                            <option value="mL">mL</option>
                            <option value="pieces">Pieces</option>
                            <option value="packets">Packets</option>
                            <option value="boxes">Boxes</option>
                            <option value="plates">Plates</option>
                        </Field>
                        <ErrorMessage name="unit" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="description">Description</label>
                        <Field
                            type="text"
                            name="description"
                            placeholder="Enter Description"
                            className="form-control"
                        />
                        <ErrorMessage name="description" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="phone">Phone</label>
                        <Field
                            type="text"
                            name="phone"
                            placeholder="Enter your Phone number"
                            className="form-control"
                        />
                        <ErrorMessage name="phone" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="pickupAddress">Pickup Address</label>
                        <Field
                            type="text"
                            name="pickupAddress"
                            placeholder="Enter your Address"
                            className="form-control"
                        />
                        <ErrorMessage name="pickupAddress" component="div" className="error" />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                </Form>
            )}
        </Formik>
    );
};
