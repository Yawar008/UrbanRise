import { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Loader from "../Helpers/Loader/Loader";

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
        <Route path="/dashboard" element={<></>} />
      </Routes>
    </div>
  );
};

export default Router;
