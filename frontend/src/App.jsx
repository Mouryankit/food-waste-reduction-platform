
import './App.css'
// libraries
import {BrowserRouter, Routes, Route} from "react-router-dom"; 

// component
import Navbar from './components/Navbar/Navbar.jsx';
import Home from "./pages/Home/Home.jsx"; 
import Login from "./pages/User/Login.jsx"; 
import Signup from "./pages/User/Signup.jsx"; 

function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/signup" element={<Signup/>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
