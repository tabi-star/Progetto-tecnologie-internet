import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MoviesPage from "./pages/MoviesPage";
import UsersPage from "./pages/UsersPage";
import HallsPage from "./pages/HallsPage";
import ScreeningsPage from "./pages/ScreeningsPage";
import TicketsPage from "./pages/TicketsPage";

export default function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <nav style={{ padding: "1rem", borderRight: "1px solid #ccc" }}>
          <h2>🎥 Cinema App</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/">Movies</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/halls">Halls</Link></li>
            <li><Link to="/screenings">Screenings</Link></li>
            <li><Link to="/tickets">Tickets</Link></li>
          </ul>
        </nav>

        <main style={{ padding: "1rem", flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<MoviesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/halls" element={<HallsPage />} />
            <Route path="/screenings" element={<ScreeningsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
