
import "./DonationForm.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../api";
import MapComponent from "../Map/Map.jsx";

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
        .matches(/^[1-9]\d{9}$/, "Enter a valid 10-digit phone number")
        .required("Phone number is required"),

    pickupAddress: Yup.string()
        .min(5, "Address should be at least 5 characters")
        .required("Pickup address is required"),

    expiryDate: Yup.date()
        .min(new Date(), "Date cannot be in the past")
        .required("date is required")

});


export default function EditDonationForm() {
    const [donation, setDonation] = useState({});
    const navigate = useNavigate();
    const { id: donationId } = useParams();
    const [pickupLocation, setPickupLocation] = useState(null);

    const fetchData = async () => {
        try {
            const result = await API.get(`/restaurant/donation/${donationId}`);
            if (result?.data?.data) {
                setDonation(result.data.data);
                setPickupLocation(result.data.data.pickupLocation);
            }
        }
        catch (err) {
            console.dir(err);
            alert("Data not saved");
        }
    }
    useEffect(() => {
        fetchData();
    }, [donationId]);

    const handleSubmit = async (values, setSubmitting) => {
        try {
            console.log(values);
            const updatedData = {
                ...values,
                pickupLocation: pickupLocation
            }
            const result = await API.patch(`/restaurant/donation/${donationId}`, updatedData);
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
            initialValues={{
                foodName: donation.foodName || "",
                quantity: donation.quantity || "",
                unit: donation.unit || "kg",
                description: donation.description || "",
                phone: donation.phone || "",
                pickupAddress: donation.pickupAddress || "",
                expiryDate: donation.expiryDate
                    ? donation.expiryDate.split("T")[0]
                    : ""
            }}
            validationSchema={donationFormSchema}
            enableReinitialize={true}
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
                        <span style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text-title)", textAlign: "left" }}>Pickup Location</span>

                        <MapComponent
                            height="300px"
                            width="100%"
                            location={pickupLocation}
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

                    <button type="submit" className="button primary-button donation-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>

                </Form>
            )}
        </Formik>
    );
};
