import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register } from "./views/Register/Register";
import { Login } from "./views/Login/Login";
import { Dashboard } from "./views/Dashboard/Dashboard";
import { AddPasskeyView } from "./views/AddPasskey";
import { Banner } from "./components/Banner/Banner";

export function App() {
  return (
    <>
        <BrowserRouter>
          <div className="flex flex-col">
              <Banner/>
              <div className="flex justify-center mt-12">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path='/profile' element={<Dashboard />} />
                    <Route path='/add-passkey' element={<AddPasskeyView/>} />
                    <Route path='*' element={<div>Not Found</div>} />
                </Routes>
              </div>
          </div>
        </BrowserRouter>
    </>
  )
}
