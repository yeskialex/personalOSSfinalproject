import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { getUserPokemons, getUserTeams } from "../services/Mockapi";


export const UserDataContext = createContext();

export function UserDataProvider({ children }) {
  const { trainer } = useContext(AuthContext);
  const [userPokemons, setUserPokemons] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (trainer) {
        setLoading(true);
        const [pokemonsRes, teamsRes] = await Promise.all([
          getUserPokemons(trainer.uid),
          getUserTeams(trainer.uid),
        ]);
        setUserPokemons(pokemonsRes.data);
        setUserTeams(teamsRes.data);
        setLoading(false);
      }
    }
    fetchData();
  }, [trainer]);

  const value = { userPokemons, setUserPokemons, userTeams, loading, setUserTeams };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}