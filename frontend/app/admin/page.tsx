"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Users, Activity, Loader2, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, actsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/activities")
      ]);
      setUsers(usersRes.data);
      setActivities(actsRes.data);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        router.push("/dashboard");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push("/dashboard")} className="p-2 glass rounded-lg text-white hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-white">Admin Console</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-2xl border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="text-blue-400" /> Users ({users.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-slate-800/50">
                      <td className="py-3">{u.name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="text-green-400" /> Recent Activities
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {activities.map(a => (
                <div key={a._id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-blue-400">{a.email}</span>
                  </div>
                  <p className="text-white text-sm font-medium">{a.action}</p>
                  <p className="text-slate-400 text-xs mt-1">{a.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
