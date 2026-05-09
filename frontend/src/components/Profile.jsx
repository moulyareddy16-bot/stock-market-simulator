import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../service/api";
import Skeleton from "./Skeleton";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.payload);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div>
      profile
    </div>
  )
}

export default Profile
