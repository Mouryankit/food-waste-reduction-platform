
import './App.css'
// libraries
import {BrowserRouter, Routes, Route} from "react-router-dom"; 

// component
import Navbar from './components/Navbar/Navbar.jsx';
import Home from "./pages/Home/Home.jsx"; 
import Login from "./pages/User/Login.jsx"; 
import Signup from "./pages/User/Signup.jsx"; 
import ResetPassword from "./pages/User/ResetPassword.jsx"; 
import DonationForm from './pages/Restaurant/DonationForm.jsx';
import MyDonation from './pages/Restaurant/MyDonation.jsx';
import AvailableDonations from "./pages/Ngo/AvailableDonations.jsx"; 
import AcceptedDonations from "./pages/Ngo/AcceptedDonations.jsx"; 
import AllDonations from "./pages/Admin/AllDonations.jsx"; 
import Analytics from "./pages/Admin/Analytics.jsx"; 
import UserManagement from "./pages/Admin/UserManagement.jsx"; 

function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/signup" element={<Signup/>}></Route>
                <Route path="/reset-password" element={<ResetPassword/>}></Route>

                <Route path="/restaurant/add-donation" element={<DonationForm/>}></Route>
                <Route path="/restaurant/my-donation" element={<MyDonation/>}></Route>

                <Route path="/ngo/available-donations" element={<AvailableDonations/>}></Route>
                <Route path="/ngo/accepted-donations" element={<AcceptedDonations/>}></Route>

                <Route path="/ngo/all-donations" element={<AllDonations/>}></Route>
                <Route path="/ngo/analytics" element={<Analytics/>}></Route>
                <Route path="/ngo/user-management" element={<UserManagement/>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
