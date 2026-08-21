import { useState } from "react";
import GenerateOtpForm from "./AcountRecovery/GenerateOtpForm.jsx"; 
import VerifyOtpForm from "./AcountRecovery/VerifyOtpForm.jsx"; 
import PasswordForm from "./AcountRecovery/PasswordForm.jsx";

const ResetPassword = () => {
    const [otpSent, setOtpSent] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState(false); 
    const [email, setEmail] = useState(""); 
    const [token, setToken] = useState(""); 

    if(otpSent && verifyEmail){
        return <PasswordForm token={token} />
    }
    else if(otpSent){
        return <VerifyOtpForm email={email} setVerifyEmail={setVerifyEmail} setToken={setToken} />
    }
    else {
        return <GenerateOtpForm setEmail={setEmail} setOtpSent={setOtpSent}/>
    }
};

export default ResetPassword; 

