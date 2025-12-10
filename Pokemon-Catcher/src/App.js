import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserDataProvider } from "./context/UserDataContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPokemons from "./pages/MyPokemons";
import PokemonDetail from "./pages/PokemonDetail";
import PokemonTCGDetail from "./pages/PokemonTCGDetail";
import Teams from "./pages/Team";

import Navbar from "./components/Navbar";
import RequireLogin from "./components/RequireLogin";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserDataProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<RequireLogin />}>
              <Route path="/" element={<Home />} />
              <Route path="/my-pokemons" element={<MyPokemons />} />
              <Route path="/pokemon/:id" element={<PokemonDetail />} />
              <Route path="/pokemon/:id/tcg" element={<PokemonTCGDetail />} />
              <Route path="/teams" element={<Teams />} />
            </Route>
          </Routes>
        </UserDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;