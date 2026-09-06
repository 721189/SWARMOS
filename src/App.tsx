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
  ShieldAlert,
  ShieldCheck, 
  Sparkles,
  Satellite,
  Lock,
  Unlock,
  KeyRound,
  Boxes,
  Binary,
  Mountain,
  Crosshair
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
import { AtakCotGateway } from './components/AtakCotGateway';
import { AnomalyDefensePanel } from './components/AnomalyDefensePanel';
import { HeterogeneousFleetPanel } from './components/HeterogeneousFleetPanel';
import { SdrMeshPanel } from './components/SdrMeshPanel';
import { CbbaDebuggerPanel } from './components/CbbaDebuggerPanel';
import { TerrainRelayPanel } from './components/TerrainRelayPanel';
import { RedTeamSandboxPanel } from './components/RedTeamSandboxPanel';
import { useResearcherAccess, ResearcherUnlockModal } from './components/ResearcherAccess';

type NavTab = 
  | 'simulation' 
  | 'cbba-debugger'
  | 'terrain-relay'
  | 'red-team'
  | 'mumt'
  | 'sdrmesh'
  | 'atak' 
  | 'anomaly' 
  | 'scaffold' 
  | 'architecture' 
  | 'storyboard' 
  | 'nebius' 
  | 'whitepaper';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('simulation');
  const [tacticalMode, setTacticalMode] = useState({
    showMilStdSymbology: false,
    showUwbRangingMesh: false,
    showCotCallsigns: true,
  });
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const { isUnlocked, unlock, lock } = useResearcherAccess();

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
    byzantineState,
    cotEvents,
    takServerStatus,
    sdrMeshState,
    edgeLlmState,
    windVector,
    terrainRidges,
    isAutonomousRelayActive,
    relayLinks,
    cbbaStepState,
    redTeamThreats,
    activeSandboxTool,
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
    toggleGpsDenied,
    injectByzantineAttack,
    remediateByzantine,
    exportAtakMissionPackage,
    dockAgentToUgv,
    setSdrRadioModel,
    toggleSdrCryptoSuite,
    triggerEdgeLlmInference,
    updateWindVector,
    toggleAutonomousRelay,
    toggleStepMode,
    setPacketDropRate,
    resetAuctionStepDebugger,
    stepAuctionIteration,
    addThreat,
    removeThreat,
    toggleThreat,
    addCustomTask,
    manualRerouteTask,
    manualMoveTask,
    clearTaskOverride,
    setActiveSandboxTool,
  } = useSwarmSimulation();

  const handleToggleTacticalMode = (key: 'showMilStdSymbology' | 'showUwbRangingMesh' | 'showCotCallsigns') => {
    setTacticalMode((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] text-slate-200 flex flex-col selection:bg-sky-500/20 selection:text-sky-100">
      {/* Top Tactical Command Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#0a0c12]/90 backdrop-blur-xl px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <Radio className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-extrabold text-white tracking-tight font-display">
                  SWARMOS
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-500/5 text-sky-400 border border-sky-400/20 font-bold uppercase tracking-wider">
                    CBBA v2.4
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/5 text-emerald-400 border border-emerald-400/20 font-bold uppercase tracking-wider">
                    NVIDIA NEMOTRON
                  </span>
                </div>
                {byzantineState.isGpsDenied && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-400/20 font-bold uppercase tracking-wider">
                    GPS-DENIED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Strategic Autonomous Swarm Framework • Strategic-Grade Anomaly Detection
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full">
            <button
              id="nav-tab-simulation"
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'simulation'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Workbench</span>
            </button>

            <button
              id="nav-tab-cbba"
              onClick={() => setActiveTab('cbba-debugger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'cbba-debugger'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span>CBBA Debugger</span>
            </button>

            <button
              id="nav-tab-terrain"
              onClick={() => setActiveTab('terrain-relay')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'terrain-relay'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <span>Terrain &amp; Relay</span>
            </button>

            <button
              id="nav-tab-redteam"
              onClick={() => setActiveTab('red-team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'red-team'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-rose-400" />
              <span>Red-Team Sandbox</span>
            </button>

            <button
              id="nav-tab-mumt"
              onClick={() => setActiveTab('mumt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'mumt'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-emerald-400" />
              <span>MUM-T Fleet</span>
            </button>

            <button
              id="nav-tab-sdrmesh"
              onClick={() => setActiveTab('sdrmesh')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'sdrmesh'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>anomaly-aware SDR &amp; SLM</span>
            </button>

            <button
              id="nav-tab-atak"
              onClick={() => setActiveTab('atak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'atak'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>ATAK / CoT</span>
            </button>

            <button
              id="nav-tab-byzantine"
              onClick={() => setActiveTab('anomaly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'anomaly'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Anomaly Defense</span>
            </button>

            <button
              id="nav-tab-scaffold"
              onClick={() => setActiveTab('scaffold')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'architecture'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>

            <button
              id="nav-tab-nebius"
              onClick={() => setActiveTab('nebius')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'nebius'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Nebius Matrix</span>
            </button>

            {/* Author / Researcher Protected Tabs */}
            {isUnlocked ? (
              <>
                <button
                  id="nav-tab-storyboard"
                  onClick={() => setActiveTab('storyboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'storyboard'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo Script</span>
                </button>

                <button
                  id="nav-tab-whitepaper"
                  onClick={() => setActiveTab('whitepaper')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'whitepaper'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report</span>
                </button>
              </>
            ) : null}
          </nav>

          {/* Author / Researcher Access Quick Toggle */}
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <button
                onClick={lock}
                title="Researcher Mode Unlocked. Click to re-lock."
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Author Mode</span>
                <span className="text-[10px] text-emerald-500">(Lock)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUnlockModalOpen(true)}
                title="Author / Researcher Key Access"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Author Access</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Tab 1: Live Simulation Workbench */}
        {activeTab === 'simulation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Split Canvas and Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <SwarmCanvas
                  agents={agents}
                  tasks={tasks}
                  obstacles={obstacles}
                  threatZones={threatZones}
                  commLinks={commLinks}
                  selectedAgentId={selectedAgentId}
                  selectedTaskId={selectedTaskId}
                  byzantineState={byzantineState}
                  terrainRidges={terrainRidges}
                  relayLinks={relayLinks}
                  windVector={windVector}
                  redTeamThreats={redTeamThreats}
                  activeSandboxTool={activeSandboxTool}
                  tacticalMode={tacticalMode}
                  onToggleTacticalMode={handleToggleTacticalMode}
                  onSelectAgent={setSelectedAgentId}
                  onSelectTask={(taskId) => {
                    setSelectedTaskId(taskId);
                    if (taskId) generateExplainData(taskId);
                  }}
                  onManualReroute={manualRerouteTask}
                  onManualMoveTask={manualMoveTask}
                  onClearTaskOverride={clearTaskOverride}
                  onCanvasClickWithTool={(pos, tool) => {
                    if (tool === 'ADD_SAM') {
                      injectSAM(pos[0], pos[1]);
                    } else if (tool === 'ADD_JAMMER') {
                      injectJammer(pos[0], pos[1]);
                    } else if (tool === 'ADD_CONVOY') {
                      addThreat({
                        name: `OPFOR-CONVOY-${Math.floor(Math.random() * 900 + 100)}`,
                        type: 'MOBILE_CONVOY',
                        position: pos,
                        radius: 40,
                        waypoints: [pos, [pos[0] + 120, pos[1]], [pos[0] + 120, pos[1] + 100], [pos[0], pos[1] + 100]],
                        waypointIndex: 0,
                        speed: 14,
                        headingDeg: 90,
                        intensity: 0.85,
                        active: true,
                      });
                    } else if (tool === 'ADD_TASK') {
                      addCustomTask({
                        position: pos,
                        type: 'SURVEIL',
                        reward: 95,
                        priority: 1,
                        description: `Tactical reconnaissance point (${Math.round(pos[0])}, ${Math.round(pos[1])})`,
                        requiredPayload: 'FLIR_THERMAL',
                      });
                    }
                  }}
                />
              </div>

              <div className="xl:col-span-4">
                <SimulationControls
                  isRunning={isRunning}
                  simSpeed={simSpeed}
                  agents={agents}
                  tasks={tasks}
                  selectedAgentId={selectedAgentId}
                  onToggleRun={() => setIsRunning(!isRunning)}
                  onChangeSpeed={setSimSpeed}
                  onReset={resetSimulation}
                  onSelectAgent={setSelectedAgentId}
                  onInjectFailure={injectMotorFailure}
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

        {/* Tab: CBBA Step Debugger & Choi 2009 Rule Inspector */}
        {activeTab === 'cbba-debugger' && (
          <div className="animate-in fade-in duration-150">
            <CbbaDebuggerPanel
              agents={agents}
              tasks={tasks}
              cbbaStepState={cbbaStepState}
              onToggleStepMode={toggleStepMode}
              onStepAuction={stepAuctionIteration}
              onResetAuction={resetAuctionStepDebugger}
              onSetDropRate={setPacketDropRate}
            />
          </div>
        )}

        {/* Tab: Terrain Elevation & 3D LOS Relay Manager */}
        {activeTab === 'terrain-relay' && (
          <div className="animate-in fade-in duration-150">
            <TerrainRelayPanel
              ridges={terrainRidges}
              relayLinks={relayLinks}
              agents={agents}
              isAutonomousRelayActive={isAutonomousRelayActive}
              onToggleAutonomousRelay={toggleAutonomousRelay}
              frequencyMhz={sdrMeshState.frequencyMhz}
            />
          </div>
        )}

        {/* Tab: Red-Team Adversarial Sandbox & Mission Builder */}
        {activeTab === 'red-team' && (
          <div className="animate-in fade-in duration-150">
            <RedTeamSandboxPanel
              activeTool={activeSandboxTool}
              onSelectTool={setActiveSandboxTool}
              windVector={windVector}
              onUpdateWind={updateWindVector}
              redTeamThreats={redTeamThreats}
              onAddThreat={addThreat}
              onRemoveThreat={removeThreat}
              onToggleThreat={toggleThreat}
              onAddCustomTask={addCustomTask}
            />
          </div>
        )}

        {/* Tab 2: MUM-T Heterogeneous Multi-Domain Fleet */}
        {activeTab === 'mumt' && (
          <div className="animate-in fade-in duration-150">
            <HeterogeneousFleetPanel
              agents={agents}
              tasks={tasks}
              onDockAgentToUgv={dockAgentToUgv}
              onSelectAgent={setSelectedAgentId}
            />
          </div>
        )}

        {/* Tab 3: Edge-Native anomaly-aware SDR & Jetson Orin SLM */}
        {activeTab === 'sdrmesh' && (
          <div className="animate-in fade-in duration-150">
            <SdrMeshPanel
              sdrMeshState={sdrMeshState}
              edgeLlmState={edgeLlmState}
              onSetRadioModel={setSdrRadioModel}
              onToggleCryptoSuite={toggleSdrCryptoSuite}
              onTriggerEdgeLlm={triggerEdgeLlmInference}
            />
          </div>
        )}

        {/* Tab 4: ATAK / WinTAK Cursor-on-Target Gateway */}
        {activeTab === 'atak' && (
          <div className="animate-in fade-in duration-150">
            <AtakCotGateway
              cotEvents={cotEvents}
              takServerStatus={takServerStatus}
              agents={agents}
              tasks={tasks}
              onExportMissionPackage={exportAtakMissionPackage}
            />
          </div>
        )}

        {/* Tab 5: GPS-Denied & Strategic Anomaly Defense */}
        {activeTab === 'anomaly' && (
          <div className="animate-in fade-in duration-150">
            <AnomalyDefensePanel
              byzantineState={byzantineState}
              agents={agents}
              onToggleGpsDenied={toggleGpsDenied}
              onInjectAttack={injectByzantineAttack}
              onRemediate={remediateByzantine}
            />
          </div>
        )}

        {/* Tab 6: Project Scaffold Explorer */}
        {activeTab === 'scaffold' && (
          <div className="animate-in fade-in duration-150">
            <ScaffoldExplorer />
          </div>
        )}

        {/* Tab 7: System Architecture Blueprint */}
        {activeTab === 'architecture' && (
          <div className="animate-in fade-in duration-150">
            <ArchitectureViewer />
          </div>
        )}

        {/* Tab 8: 3-Minute Demo Video Script */}
        {activeTab === 'storyboard' && (
          <div className="animate-in fade-in duration-150">
            {isUnlocked ? (
              <DemoScriptViewer />
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-2xl my-12">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Demo Script Section Protected
                  </h3>
                  <p className="text-xs text-slate-400">
                    This section is restricted to author evaluation. Enter your author passkey to view the script.
                  </p>
                </div>
                <button
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Unlock Author Access
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 9: Nebius Experiment Suite */}
        {activeTab === 'nebius' && (
          <div className="animate-in fade-in duration-150">
            <NebiusMatrixViewer />
          </div>
        )}

        {/* Tab 10: Technical Research Whitepaper */}
        {activeTab === 'whitepaper' && (
          <div className="animate-in fade-in duration-150">
            {isUnlocked ? (
              <TechnicalReportViewer />
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-2xl my-12">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    IEEE Research Preprint &amp; Figures Protected
                  </h3>
                  <p className="text-xs text-slate-400">
                    The 6-page IEEE Transactions research paper, LaTeX bundle, and figures are restricted to author evaluation.
                  </p>
                </div>
                <button
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Unlock Author Access
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Author Researcher Unlock Modal */}
      <ResearcherUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onSuccess={() => {}}
        unlock={unlock}
      />

      {/* Explain Why [X-AI] Forensic Modal */}
      {isExplainOpen && (
        <ExplainModal
          data={explainData}
          onClose={() => setIsExplainOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/40 bg-[#0a0c12] px-6 py-6 text-[10px] font-mono text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
            <span className="uppercase tracking-widest font-semibold">SWARMOS Strategic Autonomous Swarm intelligence</span>
          </div>
          <div className="flex items-center gap-5 text-slate-600 font-medium">
            <span>MUM-T AIR+GROUND+SURFACE</span>
            <span className="text-slate-800">|</span>
            <span>STRATEGIC ANOMALY FILTER</span>
            <span className="text-slate-800">|</span>
            <span>JETSON ORIN NATIVE TENSORRT-LLM</span>
            <span className="text-slate-800">|</span>
            <span>ATAK COT GATEWAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
