/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, 
  Clock, 
  Zap, 
  Repeat, 
  X, 
  Check, 
  ChevronRight, 
  Volume2, 
  Vibrate, 
  Trash2, 
  Camera, 
  Keyboard, 
  Calculator, 
  Hand, 
  Smartphone,
  Info,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  AlarmClock,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alarm, MissionType, DAYS_SHORT, MISSION_LABELS, RINGTONES } from './types';

// --- Components ---

const TimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [hours, minutes] = value.split(':');
  
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <div className="flex flex-col items-center">
        <input 
          type="number" 
          min="0" 
          max="23" 
          value={hours}
          onChange={(e) => onChange(`${e.target.value.padStart(2, '0')}:${minutes}`)}
          className="w-24 h-32 text-6xl font-bold bg-neutral-900 border border-neutral-800 rounded-2xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
        />
        <span className="text-xs text-neutral-500 mt-2 uppercase tracking-widest font-medium">Hours</span>
      </div>
      <div className="text-6xl font-bold text-neutral-700 mb-8">:</div>
      <div className="flex flex-col items-center">
        <input 
          type="number" 
          min="0" 
          max="59" 
          value={minutes}
          onChange={(e) => onChange(`${hours}:${e.target.value.padStart(2, '0')}`)}
          className="w-24 h-32 text-6xl font-bold bg-neutral-900 border border-neutral-800 rounded-2xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
        />
        <span className="text-xs text-neutral-500 mt-2 uppercase tracking-widest font-medium">Minutes</span>
      </div>
    </div>
  );
};

const DaySelector = ({ selectedDays, onToggle }: { selectedDays: number[], onToggle: (day: number) => void }) => {
  return (
    <div className="flex justify-between gap-1">
      {DAYS_SHORT.map((day, index) => (
        <button
          key={`${day}-${index}`}
          onClick={() => onToggle(index)}
          className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-300 ${
            selectedDays.includes(index)
              ? 'bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
              : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

const MissionSelector = ({ selected, onSelect }: { selected: MissionType, onSelect: (type: MissionType) => void }) => {
  const missions: { type: MissionType, icon: any, label: string }[] = [
    { type: 'none', icon: Clock, label: 'None' },
    { type: 'math', icon: Calculator, label: 'Math' },
    { type: 'shake', icon: Smartphone, label: 'Shake' },
    { type: 'memory', icon: Brain, label: 'Memory' },
    { type: 'barcode', icon: Camera, label: 'Barcode' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {missions.map((m) => (
        <button
          key={m.type}
          onClick={() => onSelect(m.type)}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
            selected === m.type
              ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-500'
              : 'bg-neutral-900/50 border border-neutral-800 text-neutral-500 hover:border-neutral-700'
          }`}
        >
          <m.icon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{m.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('aura_alarms');
    return saved ? JSON.parse(saved) : [
      { id: '1', time: '07:00', label: 'Wake Up', enabled: true, days: [1, 2, 3, 4, 5], mission: 'math', ringtone: 'Aurora' },
      { id: '2', time: '08:30', label: 'Gym', enabled: false, days: [1, 3, 5], mission: 'none', ringtone: 'Zen' },
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [missionActive, setMissionActive] = useState(false);

  // Form State
  const [formTime, setFormTime] = useState('07:00');
  const [formLabel, setFormLabel] = useState('');
  const [formDays, setFormDays] = useState<number[]>([]);
  const [formMission, setFormMission] = useState<MissionType>('none');
  const [formRingtone, setFormRingtone] = useState('Aurora');

  useEffect(() => {
    localStorage.setItem('aura_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check for alarms
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const day = now.getDay();
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === timeStr && (alarm.days.length === 0 || alarm.days.includes(day))) {
          if (!activeAlarm && !missionActive) {
            setActiveAlarm(alarm);
          }
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [alarms, activeAlarm, missionActive]);

  const handleAdd = () => {
    setEditingAlarm(null);
    setFormTime('07:00');
    setFormLabel('');
    setFormDays([]);
    setFormMission('none');
    setFormRingtone('Aurora');
    setIsAdding(true);
  };

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setFormTime(alarm.time);
    setFormLabel(alarm.label);
    setFormDays(alarm.days);
    setFormMission(alarm.mission);
    setFormRingtone(alarm.ringtone);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (editingAlarm) {
      setAlarms(prev => prev.map(a => a.id === editingAlarm.id ? {
        ...a,
        time: formTime,
        label: formLabel,
        days: formDays,
        mission: formMission,
        ringtone: formRingtone
      } : a));
    } else {
      const newAlarm: Alarm = {
        id: Math.random().toString(36).substr(2, 9),
        time: formTime,
        label: formLabel || 'Alarm',
        enabled: true,
        days: formDays,
        mission: formMission,
        ringtone: formRingtone
      };
      setAlarms(prev => [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    }
    setIsAdding(false);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const dismissAlarm = () => {
    if (activeAlarm?.mission !== 'none') {
      setMissionActive(true);
    } else {
      setActiveAlarm(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">AURA</h1>
          <p className="text-neutral-500 font-medium tracking-wide text-xs uppercase mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums text-emerald-500">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
      </header>

      {/* Alarm List */}
      <main className="px-6 pb-32 space-y-4">
        <AnimatePresence mode="popLayout">
          {alarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative group overflow-hidden rounded-3xl border transition-all duration-500 ${
                alarm.enabled 
                  ? 'bg-neutral-900/40 border-neutral-800 shadow-xl shadow-black/20' 
                  : 'bg-neutral-950 border-neutral-900 opacity-60'
              }`}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1 cursor-pointer" onClick={() => handleEdit(alarm)}>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold tracking-tight tabular-nums">
                      {alarm.time}
                    </span>
                    {alarm.mission !== 'none' && (
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <Zap size={14} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-400">
                      {alarm.label}
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      {alarm.days.length === 7 ? 'Everyday' : alarm.days.length === 0 ? 'Once' : alarm.days.map(d => DAYS_SHORT[d]).join(' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                      alarm.enabled ? 'bg-emerald-500' : 'bg-neutral-800'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                      alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              
              {/* Swipe to delete simulation / Action bar */}
              <div className="absolute top-0 right-0 h-full flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteAlarm(alarm.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alarms.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-600 space-y-4">
            <div className="p-6 bg-neutral-900/50 rounded-full border border-neutral-800/50">
              <AlarmClock size={48} strokeWidth={1} />
            </div>
            <p className="text-sm font-medium">No alarms set. Tap + to start.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center px-6 pointer-events-none">
        <button 
          onClick={handleAdd}
          className="pointer-events-auto w-16 h-16 bg-emerald-500 text-neutral-950 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950 flex flex-col"
          >
            <header className="px-6 py-8 flex justify-between items-center border-bottom border-neutral-900">
              <button onClick={() => setIsAdding(false)} className="p-2 text-neutral-400 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold tracking-tight">
                {editingAlarm ? 'Edit Alarm' : 'New Alarm'}
              </h2>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-neutral-950 rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors"
              >
                Save
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-12">
              <TimePicker value={formTime} onChange={setFormTime} />

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Repeat size={14} /> Repeat
                  </label>
                  <DaySelector 
                    selectedDays={formDays} 
                    onToggle={(day) => setFormDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Mission
                  </label>
                  <MissionSelector selected={formMission} onSelect={setFormMission} />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} /> Label
                  </label>
                  <input 
                    type="text" 
                    placeholder="Alarm Label"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 size={14} /> Ringtone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RINGTONES.map(r => (
                      <button
                        key={r}
                        onClick={() => setFormRingtone(r)}
                        className={`p-4 rounded-2xl border text-sm font-medium transition-all ${
                          formRingtone === r 
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alarm Active Overlay */}
      <AnimatePresence>
        {activeAlarm && !missionActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-500 flex flex-col items-center justify-center p-6 text-neutral-950"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center mb-12"
            >
              <AlarmClock size={80} strokeWidth={3} />
            </motion.div>
            
            <h2 className="text-8xl font-black tracking-tighter mb-4 tabular-nums">
              {activeAlarm.time}
            </h2>
            <p className="text-2xl font-bold opacity-80 mb-24">{activeAlarm.label}</p>

            <div className="w-full max-w-xs space-y-4">
              <button 
                onClick={dismissAlarm}
                className="w-full py-6 bg-neutral-950 text-white rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-transform"
              >
                {activeAlarm.mission !== 'none' ? 'START MISSION' : 'DISMISS'}
              </button>
              <button className="w-full py-4 bg-white/20 rounded-3xl font-bold text-lg">
                SNOOZE (5m)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Overlay */}
      <AnimatePresence>
        {missionActive && activeAlarm && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[110] bg-neutral-950 flex flex-col p-6"
          >
            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-emerald-500/10 rounded-3xl text-emerald-500 mb-4">
                  <Calculator size={48} />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Math Mission</h2>
                <p className="text-neutral-500 font-medium">Solve to dismiss the alarm</p>
              </div>

              <div className="text-6xl font-black tracking-tighter tabular-nums">
                24 × 3 + 18
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[84, 90, 72, 96].map((ans) => (
                  <button 
                    key={ans}
                    onClick={() => {
                      if (ans === 90) {
                        setMissionActive(false);
                        setActiveAlarm(null);
                      }
                    }}
                    className="py-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-2xl font-bold hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
