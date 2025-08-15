import Layout from "../components/Layout";
import RootPage from "./root";

// Placeholder for authentication state
const isLoggedIn = false; // Replace with real auth logic

export default function Home() {
  return isLoggedIn ? <Layout /> : <RootPage />;
}
