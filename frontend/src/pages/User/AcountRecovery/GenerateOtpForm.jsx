import "../style.css";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../../../api";

const generateOtpSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address format")
        .required("Email is required"),
});

const GenerateOtpForm = ({setEmail, setOtpSent}) => {
    const handleSubmit = async (values, setSubmitting) => {
        try{
            const result = await API.post("/auth/generate-otp", values);
            // console.log("working jdl");
            // console.log(result); 
            if(result){
                alert(result.data.message); 
                setEmail(values.email); 
                setOtpSent(true);
            } 
        }
        catch(err){
            console.dir(err); 
            alert(err.response.data.message); 
        }
         
        setSubmitting(false); 
         
    }
    return (
        <Formik
            initialValues={{email: ""}}
            validationSchema={generateOtpSchema}
            onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values, setSubmitting); 
            }}
        >
        {({ isSubmitting }) => (
            <Form className="form auth-form generate-otp-form">
                <h1>Reset Password</h1>
                <p className="auth-subtitle">Enter your email to receive a recovery OTP.</p>
                <div>
                    <label htmlFor="email">Email</label>
                    <Field
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Please Enter a valid existing email"
                        className="input recovery-input"
                    />
                    <ErrorMessage name="email" component="div" className="error auth-error" />
                </div>
                <button type="submit" className="button primary-button auth-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Generate OTP"}
                </button>
            </Form>
        )}
        </Formik>
    )
}

export default GenerateOtpForm; 

