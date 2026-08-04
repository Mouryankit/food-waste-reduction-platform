// import { useEffect } from "react";
// import { useParams } from "react-router-dom";

// export default function EditDonationForm() {

//     const { id } = useParams();   

//     useEffect(() => {
//         console.log(id);

//     }, [id]);

//     return (
//         <div className="donation-form">
//             <h1>Edit Donation</h1>
//         </div>
//     );
// }


import "../User/style.css";
import "./DonationForm.css";
import { useEffect, React } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from 'axios';

const donationFormSchema = Yup.object().shape({
    foodName: Yup.string()
        .min(2, "Food name must be at least 2 characters")
        .required("Food name is required"),

    quantity: Yup.number()
        .positive("Quantity must be greater than 0")
        .required("Quantity is required"),

    unit: Yup.string()
        .required("Unit is required"),

    description: Yup.string()
        .max(300, "Description is too long")
        .required("Description is required"),

    phone: Yup.string()
        .matches(/^[1-9]{1}[0-9]{9}$/, "Enter a valid 10-digit phone number")
        .required("Phone number is required"),

    pickupAddress: Yup.string()
        .min(5, "Address should be at least 5 characters")
        .required("Pickup address is required"),

    expiryDate: Yup.date()
        .min(new Date(), "Date cannot be in the past")
        .required("date is required")

});


export default function () {
    const [donation, setDonation] = useState({});
    const navigate = useNavigate();
    const { id: donationId } = useParams();

    const fetchData = async () => {
        try {
            // console.log(values); 
            const token = localStorage.getItem("token");
            const url = `http://localhost:8080/restaurant/donation/${donationId}`;
            const result = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // console.log(result?.data?.data); 
            // // console.log(); 
            if (result?.data?.data) {
                setDonation(result.data.data);
            }
        }
        catch (err) {
            console.dir(err);
            // alert(err.message);
            alert("Data not saved");
        }
    }
    useEffect(() => {
        fetchData();
    }, [donationId]);

    const handleSubmit = async (values, setSubmitting) => {
        // console.log(values); 
        try {
            console.log(values);
            const token = localStorage.getItem("token");
            const url = `http://localhost:8080/restaurant/donation/${donationId}`;
            const result = await axios.patch(url, values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (result.data.message) alert(result.data.message);
            navigate("/restaurant/my-donation");
        }
        catch (err) {
            console.dir(err);
            // alert(err.message);
            alert("Data not saved");
        }
        setSubmitting(false);
    }

    return (

        <Formik
            initialValues={{
                foodName: donation.foodName || "",
                quantity: donation.quantity || "",
                unit: donation.unit || "kg",
                description: donation.description || "",
                phone: donation.phone || "",
                pickupAddress: donation.pickupAddress || "",
                expiryDate: donation.expiryDate
                    ? donation.expiryDate.split("T")[0]
                    : "" || ""
            }}
            validationSchema={donationFormSchema}
            enableReinitialize={true}
            onSubmit={(values, { setSubmitting }) => {
                // console.log(values);
                handleSubmit(values, setSubmitting);
            }}
        >
            {({ isSubmitting }) => (

                <Form className="form">
                    <h1 className="donation-form-heading">Donate Food</h1>
                    <div>
                        <label htmlFor="foodName">Food Name</label>
                        <Field
                            type="text"
                            name="foodName"
                            placeholder="Food name"
                            className="form-control"
                        />
                        <ErrorMessage name="foodName" component="div" className="error" />
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
                            <option value="l">L</option>
                            <option value="ml">mL</option>
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
                    <div>
                        <label htmlFor="expiryDate">Expiry date</label>
                        <Field
                            type="date"
                            name="expiryDate"
                            placeholder="Enter your Address"
                            className="form-control"
                        />
                        <ErrorMessage name="expiryDate" component="div" className="error" />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                </Form>
            )}
        </Formik>
    );
};
