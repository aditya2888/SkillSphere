import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API } from '../utils/api';
import {
  Server, Play, Square, RefreshCw, Cloud, Database,
  Mail, BarChart2, Brain, AlertCircle, CheckCircle,
  Loader, Shield, Cpu, HardDrive, MapPin
} from 'lucide-react';

const AzureAdmin = () => {
  const { user } = useContext(AuthContext);
  const [vms, setVMs] = useState([]);
  const [vmLoading, setVMLoading] = useState(true);
  const [vmConfigured, setVMConfigured] = useState(false);
  const [vmError, setVMError] = useState('');
  const [actionLoading, setActionLoading] = useState({}); // { vmName: 'start'|'stop'|'restart' }
  const [actionMsg, setActionMsg] = useState({});

  useEffect(() => {
    fetchVMs();
  }, []);

  const fetchVMs = async () => {
    setVMLoading(true);
    setVMError('');
    try {
      const res = await axios.get(`${API}/vm`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setVMConfigured(res.data.configured);
      setVMs(res.data.vms || []);
      if (res.data.error) setVMError(res.data.error);
    } catch (err) {
      setVMError(err.response?.data?.message || 'Failed to fetch VMs');
    } finally {
      setVMLoading(false);
    }
  };

  const vmAction = async (vmName, action) => {
    setActionLoading(prev => ({ ...prev, [vmName]: action }));
    setActionMsg(prev => ({ ...prev, [vmName]: '' }));
    try {
      const res = await axios.post(`${API}/vm/${vmName}/${action}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
        timeout: 5 * 60 * 1000, // 5 min (VM ops can be slow)
      });
      setActionMsg(prev => ({ ...prev, [vmName]: res.data.message }));
      // Refresh VM list after action
      setTimeout(fetchVMs, 2000);
    } catch (err) {
      setActionMsg(prev => ({ ...prev, [vmName]: err.response?.data?.message || `${action} failed` }));
    } finally {
      setActionLoading(prev => ({ ...prev, [vmName]: null }));
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-zinc-400';
    const s = status.toLowerCase();
    if (s.includes('running')) return 'text-emerald-400';
    if (s.includes('stopped') || s.includes('deallocated')) return 'text-red-400';
    if (s.includes('starting') || s.includes('stopping')) return 'text-yellow-400';
    return 'text-zinc-400';
  };

  const getStatusBg = (status) => {
    if (!status) return 'bg-zinc-800';
    const s = status.toLowerCase();
    if (s.includes('running')) return 'bg-emerald-500/10 border-emerald-500/30';
    if (s.includes('stopped') || s.includes('deallocated')) return 'bg-red-500/10 border-red-500/30';
    if (s.includes('starting') || s.includes('stopping')) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-zinc-800 border-zinc-700';
  };

  if (!user) return <div className="text-zinc-400 text-center py-20">Please log in to access Azure Admin.</div>;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/40 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <Cloud size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Azure Control Panel</h1>
            <p className="text-blue-300/70 text-sm mt-0.5">Manage all Azure services powering SkillSphere</p>
          </div>
        </div>
      </div>

      {/* Azure Services Status Cards */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-blue-400" /> Active Azure Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <HardDrive size={20} />,
              name: 'Blob Storage',
              description: 'Videos, thumbnails & images',
              status: 'Active',
              color: 'blue',
              detail: 'skillsphere-uploads container',
            },
            {
              icon: <BarChart2 size={20} />,
              name: 'Application Insights',
              description: 'Live monitoring & telemetry',
              status: process.env.AZURE_APPINSIGHTS_CONNECTION_STRING ? 'Active' : 'Configure in .env',
              color: 'purple',
              detail: 'Tracks requests, events, errors',
            },
            {
              icon: <Mail size={20} />,
              name: 'Communication Services',
              description: 'Transactional email',
              status: 'Active',
              color: 'cyan',
              detail: 'Welcome, enrollment & booking emails',
            },
            {
              icon: <Brain size={20} />,
              name: 'AI Language',
              description: 'Key phrase & language detection',
              status: 'Active',
              color: 'pink',
              detail: 'Auto-categorizes course content',
            },
          ].map((svc) => (
            <div key={svc.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                svc.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                svc.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                svc.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                'bg-pink-500/10 text-pink-400'
              }`}>
                {svc.icon}
              </div>
              <h3 className="font-semibold text-zinc-100 text-sm mb-1">{svc.name}</h3>
              <p className="text-xs text-zinc-500 mb-3">{svc.description}</p>
              <p className="text-xs text-zinc-600 mb-2">{svc.detail}</p>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle size={10} /> {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Azure Virtual Machines Panel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Server size={20} className="text-blue-400" /> Azure Virtual Machines
          </h2>
          <button
            onClick={fetchVMs}
            disabled={vmLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={vmLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {vmLoading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Loader size={32} className="text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-zinc-400">Connecting to Azure Compute...</p>
          </div>
        ) : !vmConfigured ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100 mb-1">VM Service Not Configured</h3>
                <p className="text-sm text-zinc-400 mb-4">To manage Azure VMs, add these to your <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-yellow-400">.env</code> file:</p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 space-y-1">
                  <p><span className="text-blue-400">AZURE_SUBSCRIPTION_ID</span>=your-subscription-id</p>
                  <p><span className="text-blue-400">AZURE_TENANT_ID</span>=your-tenant-id</p>
                  <p><span className="text-blue-400">AZURE_CLIENT_ID</span>=your-client-id</p>
                  <p><span className="text-blue-400">AZURE_CLIENT_SECRET</span>=your-client-secret</p>
                  <p><span className="text-blue-400">AZURE_VM_RESOURCE_GROUP</span>=skillsphere-rg</p>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  Get these from: <strong className="text-zinc-400">Azure Portal → Microsoft Entra ID → App registrations</strong>
                </p>
              </div>
            </div>
          </div>
        ) : vmError ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-300 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Azure VM Error</p>
              <p className="text-sm mt-1 text-red-400">{vmError}</p>
            </div>
          </div>
        ) : vms.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <Server size={40} className="text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No VMs found in resource group <strong className="text-zinc-300">{import.meta.env.VITE_VM_RESOURCE_GROUP || 'skillsphere-rg'}</strong></p>
            <p className="text-sm text-zinc-600 mt-1">Create a VM in Azure Portal to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vms.map((vm) => (
              <div key={vm.name} className={`bg-zinc-900 border rounded-xl p-5 ${getStatusBg(vm.status)}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <Server size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100 text-lg">{vm.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {vm.location}</span>
                        <span className="flex items-center gap-1"><Cpu size={10} /> {vm.size}</span>
                        <span className="flex items-center gap-1"><Shield size={10} /> {vm.os || 'Linux'}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs font-semibold ${getStatusColor(vm.status)}`}>
                          ● {vm.status || 'Unknown'}
                        </span>
                      </div>
                      {actionMsg[vm.name] && (
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                          <CheckCircle size={12} /> {actionMsg[vm.name]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* VM Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => vmAction(vm.name, 'start')}
                      disabled={!!actionLoading[vm.name]}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded-lg text-sm font-medium transition disabled:opacity-40"
                    >
                      {actionLoading[vm.name] === 'start'
                        ? <Loader size={14} className="animate-spin" />
                        : <Play size={14} />
                      }
                      Start
                    </button>
                    <button
                      onClick={() => vmAction(vm.name, 'restart')}
                      disabled={!!actionLoading[vm.name]}
                      className="flex items-center gap-1.5 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-600/30 rounded-lg text-sm font-medium transition disabled:opacity-40"
                    >
                      {actionLoading[vm.name] === 'restart'
                        ? <Loader size={14} className="animate-spin" />
                        : <RefreshCw size={14} />
                      }
                      Restart
                    </button>
                    <button
                      onClick={() => vmAction(vm.name, 'stop')}
                      disabled={!!actionLoading[vm.name]}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition disabled:opacity-40"
                    >
                      {actionLoading[vm.name] === 'stop'
                        ? <Loader size={14} className="animate-spin" />
                        : <Square size={14} />
                      }
                      Stop
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-zinc-600 pb-4">
        Powered by Microsoft Azure — Application Insights · Blob Storage · Communication Services · AI Language · Virtual Machines
      </div>
    </div>
  );
};

export default AzureAdmin;
