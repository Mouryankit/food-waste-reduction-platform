
import './App.css'
// libraries
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Analytics from "./pages/Admin/Analytics.jsx";
import UserManagement from "./pages/Admin/UserManagement.jsx";
import EditDonationForm from "./pages/Restaurant/EditDonationForm.jsx";
import EditUser from "./pages/Admin/EditUser.jsx"; 
import DonationManagement from './pages/Admin/DonationManagement.jsx';
import EditDonation from "./pages/Admin/EditDonation.jsx"; 

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/signup" element={<Signup />}></Route>
                <Route path="/reset-password" element={<ResetPassword />}></Route>

                <Route path="/restaurant/add-donation" element={<DonationForm />}></Route>
                <Route path="/restaurant/edit-donation/:id" element={<EditDonationForm />}></Route>
                <Route path="/restaurant/my-donation" element={<MyDonation />}></Route>

                <Route path="/ngo/available-donations" element={<AvailableDonations />}></Route>
                <Route path="/ngo/accepted-donations" element={<AcceptedDonations />}></Route>

                <Route path="/admin/all-donations" element={<DonationManagement />}></Route>
                <Route path="/admin/analytics" element={<Analytics />}></Route>
                <Route path="/admin/user-management" element={<UserManagement />}></Route>
                <Route path="/admin/edit-user/:id" element={<EditUser />}></Route>
                <Route path="/admin/edit-donation/:id" element={<EditDonation />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
