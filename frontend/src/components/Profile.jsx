import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../service/api";
import Skeleton from "./Skeleton";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", currentPassword: "", profileImage: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.payload);
        setFormData({ 
          username: res.data.payload.username, 
          email: res.data.payload.email, 
          password: "",
          currentPassword: "",
          profileImage: res.data.payload.profileImage || ""
        });
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/auth/update-profile", formData);
      setUser(res.data.payload);
      setFormData(prev => ({ ...prev, password: "", currentPassword: "" }));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setLoading(true);
      const res = await api.post("/auth/upload-image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(res.data.payload);
      setFormData(prev => ({ ...prev, profileImage: res.data.payload.profileImage }));
      alert("Profile image updated!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Remove profile image?")) return;
    try {
      setLoading(true);
      const res = await api.delete("/auth/remove-image");
      setUser(res.data.payload);
      setFormData(prev => ({ ...prev, profileImage: "" }));
      alert("Profile image removed");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to remove image");
    } finally {
      setLoading(false);
    }
  };

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
          <section className="glass-card p-8 rounded-[2.5rem] space-y-8 relative group">
            {/* HIDDEN FILE INPUT */}
            <input 
              type="file" 
              id="profileUpload" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* PROFILE EDIT BUTTONS */}
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
              {user?.profileImage && (
                <button 
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition duration-300"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              )}
              <button 
                onClick={() => document.getElementById('profileUpload').click()}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 transition duration-300"
                title="Import from files"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div 
                onClick={() => document.getElementById('profileUpload').click()}
                className="w-24 h-24 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 overflow-hidden flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/10 relative cursor-pointer group/avatar"
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-500">👤</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{user?.username}</h2>
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

          {/* SECURITY / SETTINGS */}
          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-black text-white">Privacy & Security</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-between w-full p-6 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/50 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-xl group-hover:scale-110 transition">
                    ⚙️
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">Account Settings</p>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Update your personal information and password</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 group-hover:text-emerald-500 transition"><path d="m9 18 6-6-6-6"/></svg>
              </button>
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

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Account Settings</h2>
              
              <div className="flex items-center gap-2">
                {/* EDIT BUTTON */}
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-lg transition ${isEditing ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:bg-white/5'}`}
                  title="Edit Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>

                {/* CLOSE BUTTON */}
                <button 
                  onClick={() => { setShowSettings(false); setIsEditing(false); }}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-4">
                {/* USERNAME */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Username</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-emerald-500/50 focus:ring-0 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>


                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                  <input 
                    type="email" 
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-emerald-500/50 focus:ring-0 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* CURRENT PASSWORD (ONLY IN EDIT MODE) */}
                {isEditing && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Current Password</label>
                    <input 
                      type="password" 
                      required={formData.password.length > 0}
                      placeholder="Required to verify changes"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-emerald-500 outline-none transition shadow-lg shadow-emerald-500/5"
                    />
                  </div>
                )}

                {/* NEW PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    {isEditing ? "New Password" : "Password"}
                  </label>
                  <input 
                    type="password" 
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter new password" : "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-emerald-500/50 focus:ring-0 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* WALLET (READ ONLY) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Wallet Balance</label>
                  <div className="w-full bg-slate-950/30 border border-slate-800/50 rounded-xl px-4 py-3 text-sm font-bold text-slate-500">
                    ${user?.walletBalance?.toLocaleString()}
                  </div>
                </div>
              </div>

              {isEditing && (
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 mt-4"
                >
                  SAVE CHANGES
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;