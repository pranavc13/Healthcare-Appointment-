import React, { useState } from 'react';
import { Phone, AlertTriangle, Heart, Droplets, Users, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { name: 'Ambulance (National)', number: '108', color: 'red', desc: 'Free emergency medical service across India' },
  { name: 'Ambulance (CATS)', number: '102', color: 'red', desc: 'Centralised Accident & Trauma Service' },
  { name: 'Police', number: '100', color: 'blue', desc: 'Law enforcement emergency' },
  { name: 'Fire Brigade', number: '101', color: 'orange', desc: 'Fire and rescue services' },
  { name: 'Disaster Management', number: '1066', color: 'purple', desc: 'National Disaster Response Force' },
  { name: 'Women Helpline', number: '1091', color: 'pink', desc: '24/7 women distress helpline' },
  { name: 'Senior Citizen', number: '14567', color: 'green', desc: 'Elder helpline - Elders in distress' },
  { name: 'Child Helpline', number: '1098', color: 'yellow', desc: 'CHILDLINE for children in need' },
];

const BLOOD_BANKS = [
  { name: 'Indian Red Cross Society', location: 'Pan-India', phone: '011-23711551', type: 'NGO' },
  { name: 'National Blood Transfusion Council', location: 'New Delhi', phone: '011-23062394', type: 'Govt' },
  { name: 'Jeevan Blood Bank', location: 'Mumbai', phone: '022-26438071', type: 'Hospital' },
  { name: 'LifeCell International', location: 'Chennai', phone: '044-4555-4555', type: 'Private' },
  { name: 'Apollo Blood Bank', location: 'Multiple Cities', phone: '1860-500-1066', type: 'Hospital' },
  { name: 'AIIMS Blood Bank', location: 'New Delhi', phone: '011-26594803', type: 'Govt' },
];

const NGOS = [
  { name: 'HelpAge India', desc: 'Support for elderly and senior citizens', phone: '011-41688955', focus: 'Elderly Care' },
  { name: 'CRY - Child Rights', desc: 'Child rights and welfare organization', phone: '022-23063647', focus: "Children's Health" },
  { name: 'iCall Mental Health', desc: 'Free counseling and mental health support', phone: '9152987821', focus: 'Mental Health' },
  { name: 'Vandrevala Foundation', desc: '24/7 mental health support helpline', phone: '1860-2662-345', focus: 'Mental Health' },
  { name: 'Voice of Stray Dogs', desc: 'Reporting animal bites for rabies treatment', phone: '044-4304-4488', focus: 'Animal Bites' },
  { name: 'Organ India', desc: 'Organ donation awareness and coordination', phone: '1800-103-7100', focus: 'Organ Donation' },
];

const FIRST_AID_TIPS = [
  {
    title: 'Heart Attack',
    steps: [
      'Call 108 immediately',
      'Have the person sit or lie down comfortably',
      'Loosen tight clothing',
      'Give aspirin if not allergic (325mg, chew it)',
      'Begin CPR if person is unconscious and not breathing',
      'Stay with them until help arrives',
    ],
    color: 'red',
  },
  {
    title: 'Stroke (FAST)',
    steps: [
      'Face: Check for facial drooping (ask to smile)',
      'Arms: Check if one arm drifts down',
      'Speech: Listen for slurred or strange speech',
      'Time: Call 108 immediately — every minute counts',
      'Keep person calm and comfortable',
      'Do NOT give food or water',
    ],
    color: 'orange',
  },
  {
    title: 'Choking',
    steps: [
      'Ask "Are you choking?" — if they cannot speak, act',
      'Give 5 back blows between shoulder blades',
      'Give 5 abdominal thrusts (Heimlich maneuver)',
      'Alternate back blows and abdominal thrusts',
      'If unconscious, begin CPR',
      'Call 108 if obstruction is not cleared',
    ],
    color: 'yellow',
  },
  {
    title: 'Severe Bleeding',
    steps: [
      'Apply firm, direct pressure with a clean cloth',
      'Do NOT remove the cloth — add more on top',
      'Elevate the injured area above the heart',
      'Apply a tourniquet for limb wounds if severe',
      'Keep the person still and warm',
      'Call 108 for deep or arterial bleeding',
    ],
    color: 'blue',
  },
];

const COLOR_MAP = {
  red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
};

function AccordionItem({ tip }) {
  const [open, setOpen] = useState(false);
  const borderColor = {
    red: 'border-l-red-500', orange: 'border-l-orange-500',
    yellow: 'border-l-yellow-500', blue: 'border-l-blue-500',
  }[tip.color];

  return (
    <div className={`border-l-4 ${borderColor} bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-r-xl overflow-hidden`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white">{tip.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 animate-fade-in">
          <ol className="space-y-2">
            {tip.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="w-5 h-5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function Emergency() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">

        {/* Hero */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-5 sm:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-16 translate-y-16" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Emergency Help</h1>
                <p className="text-red-100 text-sm">Quick access to critical contacts and first aid guidance</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              <a href="tel:108" className="flex items-center gap-2 bg-white text-red-700 font-bold px-4 sm:px-6 py-3 rounded-2xl hover:bg-red-50 transition-colors text-sm sm:text-base">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" /> Call 108 — Ambulance
              </a>
              <a href="tel:100" className="flex items-center gap-2 bg-white/20 text-white font-semibold px-4 sm:px-6 py-3 rounded-2xl hover:bg-white/30 transition-colors text-sm sm:text-base">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" /> Call 100 — Police
              </a>
            </div>
          </div>
        </div>

        {/* Emergency Numbers */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Phone className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Numbers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EMERGENCY_NUMBERS.map(n => (
              <a
                key={n.number}
                href={`tel:${n.number}`}
                className={`border rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer block ${COLOR_MAP[n.color] || COLOR_MAP.blue}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{n.number}</span>
                  <Phone className="w-4 h-4 opacity-60" />
                </div>
                <p className="font-semibold text-sm">{n.name}</p>
                <p className="text-xs opacity-70 mt-1">{n.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* First Aid Guide */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency First Aid Guide</h2>
          </div>
          <div className="space-y-3">
            {FIRST_AID_TIPS.map(tip => <AccordionItem key={tip.title} tip={tip} />)}
          </div>
        </section>

        {/* Blood Banks */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Droplets className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blood Banks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BLOOD_BANKS.map(b => (
              <div key={b.name} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{b.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {b.location}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    b.type === 'Govt' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    b.type === 'NGO'  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    b.type === 'Hospital' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                  }`}>{b.type}</span>
                </div>
                <a href={`tel:${b.phone.replace(/[-\s]/g, '')}`}
                  className="flex items-center gap-1.5 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  <Phone className="w-3.5 h-3.5" /> {b.phone}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* NGOs */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Healthcare NGOs & Helplines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NGOS.map(n => (
              <div key={n.name} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{n.name}</h3>
                  <span className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full font-medium shrink-0">{n.focus}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{n.desc}</p>
                <a href={`tel:${n.phone.replace(/[-\s]/g, '')}`}
                  className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  <Phone className="w-3.5 h-3.5" /> {n.phone}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Find hospital CTA */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <MapPin className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Find Nearest Hospital</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Use Google Maps to find the nearest emergency hospital or clinic</p>
          <a
            href="https://www.google.com/maps/search/hospital+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Open in Google Maps
          </a>
        </div>

      </div>
    </div>
  );
}
