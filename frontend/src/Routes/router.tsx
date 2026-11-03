import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Loader from "../Helpers/Loader/Loader";
import Dashboard from "../pages/Dashboard";

const Router = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loader, setLoader] = useState<boolean>(false);
  const showLoader = () => setLoader(() => true);
  const hideLoader = () => setLoader(() => false);

  return (
    <div>
      {loader && <Loader />}
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/home"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>
    </div>
  );
};

export default Router;
