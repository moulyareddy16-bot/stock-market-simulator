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
    <div className="space-y-10 animate-fade-in pb-20">
      <header>
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Your Account</h1>
        <p className="text-slate-400 mt-1 font-medium">Manage your settings and view your account performance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {/* PERSONAL INFO */}
          <section className="glass-card p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-emerald-500 flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20">
                👤
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase">{user?.username}</h2>
                <p className="text-slate-400 font-medium">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {user?.role} Account
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-800/50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</p>
                <p className="font-bold text-white text-sm">
                  #{user?.role?.charAt(0).toUpperCase()}-{user?._id?.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined On</p>
                <p className="font-bold text-white text-sm">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "March 2024"}
                </p>
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-black text-white">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold text-white text-sm">Password</p>
                  <p className="text-xs text-slate-500 font-medium">Last changed 3 months ago</p>
                </div>
                <button className="btn-secondary py-1.5 px-4 text-xs">Update</button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold text-white text-sm">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500 font-medium">Extra layer of security</p>
                </div>
                <button className="btn-secondary py-1.5 px-4 text-xs">Enable</button>
              </div>
            </div>
          </section>
        </div>

        {/* WALLET SUMMARY */}
        <aside>
          <div className="glass-card p-8 rounded-[2.5rem] bg-linear-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-500/10">
            <h3 className="text-xl font-black text-white mb-6">Financial Overview</h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Wallet</p>
                <h4 className="text-4xl font-black text-white">
                  ${user?.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>
              </div>
              
              <div className="pt-6 border-t border-slate-800/50 space-y-4">
                <Link
                  to="/stocks"
                  className="block w-full btn-primary py-4 rounded-2xl text-center font-black"
                >
                  START TRADING
                </Link>
              </div>
              
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                All funds are virtual and for simulation only
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Profile;