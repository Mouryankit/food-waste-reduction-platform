import "../style.css";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../../api";

const verifyOtpSchema = Yup.object().shape({
    otp: Yup.string()
        .min(6, "otp must be at least 6 characters")
        .max(6, "otp must be maximum 6 characters")
        .required("otp is required"),
});

const VerifyOtpForm = ({email, setVerifyEmail, setToken}) =>  {
    const handleSubmit = async (values, setSubmitting) => {
        const data = {
            "email": email,
            ...values
        }
        try{
            const result = await API.post("/auth/verify-otp", data); 
            alert(result.data.message);
            setVerifyEmail(true); 
            setToken(result.data.token); 
        }
        catch(err){
            console.log(err); 
            alert("OTP not verified", err);
        }
        setSubmitting(false); 
        
    }
    return (
        <Formik
            initialValues={{otp: ""}}
            validationSchema={verifyOtpSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values, setSubmitting); 
            }}
        >
        {({ isSubmitting }) => (
            <Form className="form auth-form verify-otp-form">
                <h1>Verify OTP</h1>
                <p className="auth-subtitle">Enter the 6-digit code sent to your email.</p>
                <div>
                    <label htmlFor="otp">Enter OTP</label>
                    <Field
                        id="otp"
                        type="text"
                        name="otp"
                        placeholder="Enter OTP received via email"
                        className="input recovery-input"
                    />
                    <ErrorMessage name="otp" component="div" className="error auth-error" />
                </div>
                <button type="submit" className="button primary-button auth-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </Form>
        )}
        </Formik>
    )
}

export default VerifyOtpForm; 

