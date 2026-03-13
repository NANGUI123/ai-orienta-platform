import { useState } from "react";
import { GLOBAL_CSS } from "./styles.js";
import Home      from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page === "home"
        ? <Home onStart={() => setPage("dashboard")} />
        : <Dashboard />}
    </>
  );
}
