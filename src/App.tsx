/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, 
  FolderTree, 
  Layers, 
  Film, 
  Box, 
  BookOpen, 
  Radio, 
  HelpCircle,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useSwarmSimulation } from './hooks/useSwarmSimulation';
import { SwarmCanvas } from './components/SwarmCanvas';
import { SimulationControls } from './components/SimulationControls';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ScaffoldExplorer } from './components/ScaffoldExplorer';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { DemoScriptViewer } from './components/DemoScriptViewer';
import { NebiusMatrixViewer } from './components/NebiusMatrixViewer';
import { TechnicalReportViewer } from './components/TechnicalReportViewer';
import { ExplainModal } from './components/ExplainModal';

type NavTab = 'simulation' | 'scaffold' | 'architecture' | 'storyboard' | 'nebius' | 'whitepaper';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('simulation');

  const {
    agents,
    tasks,
    obstacles,
    threatZones,
    commLinks,
    kpis,
    isRunning,
    simSpeed,
    selectedAgentId,
    selectedTaskId,
    explainData,
    isExplainOpen,
    eventLogs,
    setSelectedAgentId,
    setSelectedTaskId,
    setIsRunning,
    setSimSpeed,
    setIsExplainOpen,
    injectMotorFailure,
    injectJammer,
    injectSAM,
    triggerAuction,
    loadPresetMission,
    resetSimulation,
    generateExplainData,
  } = useSwarmSimulation();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Tactical Command Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-sky-500/30 shadow-inner">
              <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  SWARMOS
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                  CBBA v2.4 • NEBIUS CLUSTER
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  NVIDIA NEMOTRON-4-340B
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Decentralized Multi-Agent Swarm Operating System &amp; Dynamic Consensus Engine
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              id="nav-tab-simulation"
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'simulation'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Workbench</span>
            </button>

            <button
              id="nav-tab-scaffold"
              onClick={() => setActiveTab('scaffold')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'scaffold'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Codebase</span>
            </button>

            <button
              id="nav-tab-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'architecture'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>

            <button
              id="nav-tab-storyboard"
              onClick={() => setActiveTab('storyboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'storyboard'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Demo Script</span>
            </button>

            <button
              id="nav-tab-nebius"
              onClick={() => setActiveTab('nebius')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'nebius'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Nebius Matrix</span>
            </button>

            <button
              id="nav-tab-whitepaper"
              onClick={() => setActiveTab('whitepaper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'whitepaper'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Tab 1: Live Simulation Workbench */}
        {activeTab === 'simulation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Split Canvas and Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Canvas Arena (7 cols on XL) */}
              <div className="xl:col-span-8 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Tactical 2D Mesh Battleground [1000m x 650m]
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span>Active Mesh Links: <strong className="text-sky-400">{commLinks.length}</strong></span>
                    <span>•</span>
                    <span>Fleet: <strong className="text-emerald-400">{agents.filter(a => a.health.propulsion > 0.1).length} / {agents.length}</strong></span>
                  </div>
                </div>

                {/* 2D Canvas Element */}
                <div className="h-[560px] w-full">
                  <SwarmCanvas
                    agents={agents}
                    tasks={tasks}
                    obstacles={obstacles}
                    threatZones={threatZones}
                    commLinks={commLinks}
                    selectedAgentId={selectedAgentId}
                    selectedTaskId={selectedTaskId}
                    onSelectAgent={(id) => setSelectedAgentId(id)}
                    onSelectTask={(id) => {
                      setSelectedTaskId(id);
                      if (id) generateExplainData(id);
                    }}
                  />
                </div>
              </div>

              {/* Right Tactical Control Panel (5 cols on XL) */}
              <div className="xl:col-span-4 flex flex-col space-y-4">
                <SimulationControls
                  isRunning={isRunning}
                  onTogglePlay={() => setIsRunning(!isRunning)}
                  onReset={resetSimulation}
                  simSpeed={simSpeed}
                  onChangeSpeed={(spd) => setSimSpeed(spd)}
                  onInjectMotorFailure={injectMotorFailure}
                  onInjectJammer={injectJammer}
                  onInjectSAM={injectSAM}
                  onTriggerReplan={triggerAuction}
                  onOpenExplain={() => {
                    const firstTaskId = tasks[0]?.id || 'T1';
                    generateExplainData(firstTaskId);
                  }}
                  onLoadPresetMission={loadPresetMission}
                />
              </div>
            </div>

            {/* Bottom Dashboard: KPIs, Fleet Roster, and Logs */}
            <MetricsDashboard
              kpis={kpis}
              agents={agents}
              eventLogs={eventLogs}
            />
          </div>
        )}

        {/* Tab 2: Project Scaffold Explorer */}
        {activeTab === 'scaffold' && (
          <div className="animate-in fade-in duration-150">
            <ScaffoldExplorer />
          </div>
        )}

        {/* Tab 3: System Architecture Blueprint */}
        {activeTab === 'architecture' && (
          <div className="animate-in fade-in duration-150">
            <ArchitectureViewer />
          </div>
        )}

        {/* Tab 4: 3-Minute Demo Video Script */}
        {activeTab === 'storyboard' && (
          <div className="animate-in fade-in duration-150">
            <DemoScriptViewer />
          </div>
        )}

        {/* Tab 5: Nebius Experiment Suite */}
        {activeTab === 'nebius' && (
          <div className="animate-in fade-in duration-150">
            <NebiusMatrixViewer />
          </div>
        )}

        {/* Tab 6: Technical Research Whitepaper */}
        {activeTab === 'whitepaper' && (
          <div className="animate-in fade-in duration-150">
            <TechnicalReportViewer />
          </div>
        )}
      </main>

      {/* Explain Why [X-AI] Forensic Modal */}
      {isExplainOpen && (
        <ExplainModal
          data={explainData}
          onClose={() => setIsExplainOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 px-6 py-4 text-xs font-mono text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SWARMOS Autonomous Swarm Intelligence • CBBA Consensus Protocol</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>NVIDIA Nemotron-4-340B</span>
            <span>•</span>
            <span>Nebius Cloud SDK</span>
            <span>•</span>
            <span>Pygame Tactical Workbench</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
