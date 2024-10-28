import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Main from "./app-components/Main.tsx";
import Layout from "./app-components/Layout.tsx";
import AboutPage from "./app-components/about/AboutPage.tsx";
import AuthPage from "./app-components/auth/AuthPage.tsx";
import OrderPage from "./app-components/order/OrderPage.tsx";
import RegisterPage from "./app-components/register/RegisterPage.tsx";
import SupportPage from "./app-components/support/SupportPage.tsx";
import UserPage from "./app-components/user/UserPage.tsx";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={<Navigate to="/login" />} 
        />
        <Route
          path="/main"
          element={
            <Layout>
              <Main />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <AboutPage />
            </Layout>
          }
        />
        <Route
          path="/order"
          element={
            <Layout>
              <OrderPage />
            </Layout>
          }
        />
        <Route
          path="/support"
          element={
            <Layout>
              <SupportPage />
            </Layout>
          }
        />
        <Route
          path="/me"
          element={
            <Layout>
              <UserPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
