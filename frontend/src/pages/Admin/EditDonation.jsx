import "../Restaurant/DonationForm.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

import Map from "../Map/Map.jsx";


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
        .matches(/^[1-9][0-9]{9}$/, "Enter a valid phone number")
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

    const token = localStorage.getItem("token");


    const getDonation = async () => {

        try {

            const res = await axios.get(
                `http://localhost:8080/admin/donation/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


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


            const res = await axios.patch(

                `http://localhost:8080/admin/donation/${id}`,

                updatedData,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );


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

                <Form className="form">

                    <h1 className="donation-form-heading">
                        Update Donation
                    </h1>


                    <label>Food Name</label>

                    <Field
                        name="foodName"
                        className="form-control"
                    />

                    <ErrorMessage
                        name="foodName"
                        component="div"
                        className="error"
                    />


                    <label>Quantity</label>

                    <Field
                        type="number"
                        name="quantity"
                        className="form-control"
                    />

                    <ErrorMessage
                        name="quantity"
                        component="div"
                        className="error"
                    />


                    <label>Unit</label>

                    <Field
                        as="select"
                        name="unit"
                        className="form-control"
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


                    <label>Description</label>

                    <Field
                        name="description"
                        className="form-control"
                    />

                    <ErrorMessage
                        name="description"
                        component="div"
                        className="error"
                    />


                    <label>Phone</label>

                    <Field
                        name="phone"
                        className="form-control"
                    />

                    <ErrorMessage
                        name="phone"
                        component="div"
                        className="error"
                    />


                    <label>Pickup Address</label>

                    <Field
                        name="pickupAddress"
                        className="form-control"
                    />

                    <ErrorMessage
                        name="pickupAddress"
                        component="div"
                        className="error"
                    />


                    <label>Expiry Date</label>

                    <Field
                        type="date"
                        name="expiryDate"
                        className="form-control"
                    />

                    <ErrorMessage
                        name="expiryDate"
                        component="div"
                        className="error"
                    />

                    {/* DELIVERY STATUS */}

                    <label>
                        Delivery Status
                    </label>

                    <Field
                        as="select"
                        name="deliveryStatus"
                        className="form-control"
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
                        className="error"
                    />

                    {/* PICKUP LOCATION */}
                    
                    <div>

                        <label>
                            Pickup Location
                        </label>


                        <Map
                            height="300px"
                            width="100%"
                            location={pickupLocation}
                            setLocation={setPickupLocation}
                        />


                        {pickupLocation && (

                            <div>

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