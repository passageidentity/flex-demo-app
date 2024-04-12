import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register } from "./views/Register/Register";
import { Login } from "./views/Login/Login";
import { Dashboard } from "./views/Dashboard/Dashboard";
import { AddPasskeyView } from "./views/AddPasskey";
import { Banner } from "./components/Banner/Banner";
import { useState } from "react";

export function App() {
  const [refreshBanner, setRefreshBanner] = useState<number>(0);

  const triggerRefreshBanner = async ()=>{
    setRefreshBanner(refreshBanner+1);
  }
  return (
    <>
        <BrowserRouter>
          <div className="flex flex-col">
              <Banner refresh={refreshBanner}/>
              <div className="flex justify-center mt-12">
                <Routes>
                    <Route path="/" element={<Login onLogin={triggerRefreshBanner}/>} />
                    <Route path="/login" element={<Login onLogin={triggerRefreshBanner}/>} />
                    <Route path="/register" element={<Register onRegister={triggerRefreshBanner}/>} />
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
