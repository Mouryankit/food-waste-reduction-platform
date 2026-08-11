

import "./DonationForm.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../api";
import Map from "../Map/Map.jsx";

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
    const navigate = useNavigate();
    const [pickupLocation, setPickupLocation] = useState(null);

    const handleSubmit = async (values, setSubmitting) => {

        if (!pickupLocation) {
            alert("Please select pickup location on the map");
            setSubmitting(false);
            return;
        }

        try {
            const donationData = {
                ...values,
                pickupLocation: pickupLocation
            };

            console.log(donationData); 

            const result = await API.post("/restaurant", donationData);
            if (result.data.message) alert(result.data.message);
            navigate("/restaurant/my-donation");
        }
        catch (err) {
            console.dir(err);
            alert("Data not saved");
        }
        setSubmitting(false);
    }

    return (

        <Formik
            initialValues={{ foodName: "", quantity: "", unit: "kg", description: "", phone: "", pickupAddress: "", expiryDate: "", notifyNgos: false }}
            validationSchema={donationFormSchema}
            onSubmit={(values, { setSubmitting }) => {
                // console.log(values);
                handleSubmit(values, setSubmitting);
            }}
        >
            {({ isSubmitting }) => (

                <Form className="form donation-form">
                    <h1 className="donation-form-heading">Donate Food</h1>
                    <div>
                        <label htmlFor="foodName">Food Name</label>
                        <Field
                            type="text"
                            name="foodName"
                            placeholder="Food name"
                            className="input donation-input"
                        />
                        <ErrorMessage name="foodName" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label htmlFor="quantity">Quantity</label>
                        <Field
                            type="number"
                            name="quantity"
                            placeholder="Food quantity"
                            className="input donation-input"
                        />
                        <ErrorMessage name="quantity" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label htmlFor="unit">Unit</label>
                        <Field as="select" name="unit" id="unit" className="input donation-input">
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="l">L</option>
                            <option value="ml">mL</option>
                            <option value="pieces">Pieces</option>
                            <option value="packets">Packets</option>
                            <option value="boxes">Boxes</option>
                            <option value="plates">Plates</option>
                        </Field>
                        <ErrorMessage name="unit" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label htmlFor="description">Description</label>
                        <Field
                            type="text"
                            name="description"
                            placeholder="Enter Description"
                            className="input donation-input"
                        />
                        <ErrorMessage name="description" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label htmlFor="phone">Phone</label>
                        <Field
                            type="text"
                            name="phone"
                            placeholder="Enter your Phone number"
                            className="input donation-input"
                        />
                        <ErrorMessage name="phone" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label htmlFor="pickupAddress">Pickup Address</label>
                        <Field
                            type="text"
                            name="pickupAddress"
                            placeholder="Enter your Address"
                            className="input donation-input"
                        />
                        <ErrorMessage name="pickupAddress" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label htmlFor="expiryDate">Expiry date</label>
                        <Field
                            type="date"
                            name="expiryDate"
                            placeholder="Enter your Address"
                            className="input donation-input"
                        />
                        <ErrorMessage name="expiryDate" component="div" className="error donation-error" />
                    </div>

                    <div>
                        <label>Pickup Location</label>

                        <Map
                            height="300px"
                            width="100%"
                            setLocation={setPickupLocation}
                        />

                        {pickupLocation && (
                            <div>
                                <p>
                                    Latitude: {pickupLocation.latitude}
                                </p>

                                <p>
                                    Longitude: {pickupLocation.longitude}
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '15px 0' }}>
                        <Field
                            type="checkbox"
                            name="notifyNgos"
                            id="notifyNgos"
                            style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }}
                        />
                        <label htmlFor="notifyNgos" style={{ margin: 0, cursor: 'pointer', userSelect: 'none', display: 'inline', fontWeight: 'normal', color: '#555' }}>
                            Notify registered NGOs via Email
                        </label>
                    </div>

                    <button type="submit" className="button primary-button donation-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                </Form>
            )}
        </Formik>
    );
};


// import Map from "../Map/Map.jsx";

// export default function App() {
//     return (
//         <div>
//             <h1>Select Pickup Location</h1>
//             <Map />
//         </div>
//     );
// }