import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register } from "./views/Register/Register";
import { Login } from "./views/Login/Login";
import { Dashboard } from "./views/Dashboard/Dashboard";

export function App() {
  return (
      <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='*' element={<div>Not Found</div>} />
            </Routes>
      </BrowserRouter>
  )
}
