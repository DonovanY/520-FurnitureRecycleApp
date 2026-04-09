import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardView from "./views/DashboardView";
import ItemDetail from "./pages/ItemDetail";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
