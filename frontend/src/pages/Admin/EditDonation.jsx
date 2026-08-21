import "./EditDonation.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../api.js"; 
import MapComponent from "../Map/Map.jsx";


const donationSchema = Yup.object().shape({

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
        .matches(/^[1-9]\d{9}$/, "Enter a valid phone number")
        .required("Phone number is required"),

    pickupAddress: Yup.string()
        .required("Pickup address is required"),

    expiryDate: Yup.date()
        .required("Expiry date is required"),

    deliveryStatus: Yup.string()
        .oneOf(["pending", "accepted", "delivered", "cancelled"])
        .required("Status is required")

});


export default function EditDonation() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [donation, setDonation] = useState({});

    // Store pickup coordinates
    const [pickupLocation, setPickupLocation] = useState(null);

    const getDonation = async () => {

        try {

            const res = await API.get(`/admin/donation/${id}`); 

            if (res.data.success) {

                const data = res.data.donation;

                setDonation(data);

                // Get existing coordinates
                setPickupLocation(data.pickupLocation);

            }

        } catch (error) {

            console.log(error);

        }

    };


    useEffect(() => {

        getDonation();

    }, [id]);


    const handleSubmit = async (values, setSubmitting) => {

        try {

            // Add pickupLocation to form data
            const updatedData = {

                ...values,

                pickupLocation: pickupLocation

            };

            console.log("Updated data:", updatedData);
            
            const res = await API.patch(`/admin/donation/${id}`, updatedData); 

            alert(res.data.message);

            navigate("/admin/all-donations");


        } catch (error) {

            console.log(error);

            alert("Failed to update donation");

        }


        setSubmitting(false);

    };


    return (

        <Formik

            enableReinitialize

            initialValues={{

                foodName: donation.foodName || "",

                quantity: donation.quantity || "",

                unit: donation.unit || "kg",

                description: donation.description || "",

                phone: donation.phone || "",

                pickupAddress: donation.pickupAddress || "",

                deliveryStatus:
                    donation.deliveryStatus || "pending",

                expiryDate:
                    donation.expiryDate
                        ? donation.expiryDate.split("T")[0]
                        : ""

            }}

            validationSchema={donationSchema}

            onSubmit={(values, { setSubmitting }) =>
                handleSubmit(values, setSubmitting)
            }

        >

            {({ isSubmitting }) => (

                <Form className="form edit-donation-form">

                    <h1 className="donation-form-heading edit-donation-form-heading" style={{ textAlign: "center", marginBottom: "20px", color: "#2E7D32" }}>
                        Update Donation
                    </h1>


                    <label htmlFor="foodName">Food Name</label>

                    <Field
                        id="foodName"
                        name="foodName"
                        className="input edit-donation-input"
                    />

                    <ErrorMessage
                        name="foodName"
                        component="div"
                        className="error edit-donation-error"
                    />


                    <label htmlFor="quantity">Quantity</label>

                    <Field
                        id="quantity"
                        type="number"
                        name="quantity"
                        className="input edit-donation-input"
                    />

                    <ErrorMessage
                        name="quantity"
                        component="div"
                        className="error edit-donation-error"
                    />


                    <label htmlFor="unit">Unit</label>

                    <Field
                        id="unit"
                        as="select"
                        name="unit"
                        className="input edit-donation-input"
                    >

                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">L</option>
                        <option value="ml">mL</option>
                        <option value="pieces">Pieces</option>
                        <option value="packets">Packets</option>
                        <option value="boxes">Boxes</option>
                        <option value="plates">Plates</option>

                    </Field>


                    <label htmlFor="description">Description</label>

                    <Field
                        id="description"
                        name="description"
                        className="input edit-donation-input"
                    />

                    <ErrorMessage
                        name="description"
                        component="div"
                        className="error edit-donation-error"
                    />


                    <label htmlFor="phone">Phone</label>

                    <Field
                        id="phone"
                        name="phone"
                        className="input edit-donation-input"
                    />

                    <ErrorMessage
                        name="phone"
                        component="div"
                        className="error edit-donation-error"
                    />


                    <label htmlFor="pickupAddress">Pickup Address</label>

                    <Field
                        id="pickupAddress"
                        name="pickupAddress"
                        className="input edit-donation-input"
                    />

                    <ErrorMessage
                        name="pickupAddress"
                        component="div"
                        className="error edit-donation-error"
                    />


                    <label htmlFor="expiryDate">Expiry Date</label>

                    <Field
                        id="expiryDate"
                        type="date"
                        name="expiryDate"
                        className="input edit-donation-input"
                    />

                    <ErrorMessage
                        name="expiryDate"
                        component="div"
                        className="error edit-donation-error"
                    />

                    {/* DELIVERY STATUS */}

                    <label htmlFor="deliveryStatus">
                        Delivery Status
                    </label>

                    <Field
                        id="deliveryStatus"
                        as="select"
                        name="deliveryStatus"
                        className="input edit-donation-input"
                    >

                        <option value="pending">
                            Pending
                        </option>

                        <option value="accepted">
                            Accepted
                        </option>

                        <option value="delivered">
                            Delivered
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>

                    </Field>

                    <ErrorMessage
                        name="deliveryStatus"
                        component="div"
                        className="error edit-donation-error"
                    />

                    {/* PICKUP LOCATION */}
                    
                    <div style={{ marginBottom: "20px" }}>

                        <span style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text-title)", textAlign: "left" }}>
                            Pickup Location
                        </span>


                        <MapComponent
                            height="300px"
                            width="100%"
                            location={pickupLocation}
                            setLocation={setPickupLocation}
                        />


                        {pickupLocation && (

                            <div style={{ marginTop: "10px" }}>

                                <p>
                                    <strong>
                                        Latitude:
                                    </strong>{" "}

                                    {pickupLocation.latitude}

                                </p>


                                <p>
                                    <strong>
                                        Longitude:
                                    </strong>{" "}

                                    {pickupLocation.longitude}

                                </p>

                            </div>

                        )}

                    </div>



                    <button
                        type="submit"
                        className="button primary-button edit-donation-submit-btn"
                        style={{ width: "100%" }}
                        disabled={isSubmitting}
                    >

                        {isSubmitting
                            ? "Updating..."
                            : "Update Donation"}

                    </button>


                </Form>

            )}

        </Formik>

    );

}