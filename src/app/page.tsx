import { Metadata } from "next";
import Layout from "../components/Layout";
import RootPage from "./root";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Chrono Lens - your modern photo album app. Sign in to start capturing, organizing, and revisiting your favorite memories.",
};

// Placeholder for authentication state
const isLoggedIn = false; // Replace with real auth logic

export default function Home() {
  return isLoggedIn ? <Layout /> : <RootPage />;
}
