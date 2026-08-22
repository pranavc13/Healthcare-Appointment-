import { motion } from 'framer-motion';
import { ExternalLink, Heart, Users, Globe, Shield, ArrowRight, HandHeart } from 'lucide-react';
import { FaInstagram, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import chaturath from '../assets/chaturath.jpg';
import helpage from '../assets/helpage.png';
import swasth from '../assets/swasth.jpg';
import Antara from '../assets/antara.jpg';
import PageTransition from '../components/PageTransition';

const NGOS = [
  {
    name: 'HelpAge India',
    img: helpage,
    href: 'https://www.helpageindia.org/',
    founded: '1978',
    focus: 'Elder Care',
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    tagColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    icon: Users,
    stats: [
      { label: 'Elders Helped', value: '3M+' },
      { label: 'States Active', value: '24' },
      { label: 'Years of Service', value: '46' },
    ],
    description:
      'HelpAge India has been transforming the lives of disadvantaged elderly since 1978. They run mobile healthcare units, mobile eye care programs, and elder helplines — believing every elder deserves a dignified, healthy life.',
  },
  {
    name: 'Antara Foundation',
    img: Antara,
    href: 'https://antarafoundation.org/',
    founded: '2013',
    focus: 'Maternal & Child Health',
    color: 'from-rose-500 to-pink-600',
    lightColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    tagColor: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    icon: Heart,
    stats: [
      { label: 'Lives Impacted', value: '1M+' },
      { label: 'Districts', value: '150+' },
      { label: 'Health Workers', value: '10K+' },
    ],
    description:
      'Antara Foundation partners with government and communities to deliver maternal and child health solutions at scale. Their ASHA worker training programs have dramatically improved birth outcomes across rural India.',
  },
  {
    name: 'Swasth Foundation',
    img: swasth,
    href: 'https://www.swasth.org/',
    founded: '2011',
    focus: 'Community Wellbeing',
    color: 'from-emerald-500 to-teal-600',
    lightColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    tagColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    icon: Globe,
    stats: [
      { label: 'Clinics', value: '20+' },
      { label: 'Patients/Month', value: '15K' },
      { label: 'Affordable Care', value: '90%' },
    ],
    description:
      'Swasth envisions a world where every person lives a life of sustained wellbeing and joy. Through affordable urban clinics and a tech-enabled health platform, they deliver quality care to India\'s urban poor.',
  },
  {
    name: 'Charutar Arogya Mandal',
    img: chaturath,
    href: 'https://www.charutarhealth.org/',
    founded: '1972',
    focus: 'Rural Healthcare',
    color: 'from-amber-500 to-orange-600',
    lightColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    tagColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    icon: Shield,
    stats: [
      { label: 'Beds', value: '1200+' },
      { label: 'Villages Served', value: '500+' },
      { label: 'Years Active', value: '52' },
    ],
    description:
      'Founded in 1972 by the vision of Dr. H M Patel, Charutar Arogya Mandal demonstrates how rural community healthcare needs can be met at scale. They operate a network of hospitals and primary health centres across Gujarat.',
  },
];

const IMPACT_STATS = [
  { icon: Heart,   value: '5M+',  label: 'Lives Touched' },
  { icon: Users,   value: '50K+', label: 'Volunteers' },
  { icon: Globe,   value: '20+',  label: 'States Covered' },
  { icon: HandHeart, value: '4',  label: 'Partner NGOs' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function NGO() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-600 text-white pt-28 pb-20 px-4">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <HandHeart className="w-4 h-4" />
              Healthcare NGOs in India
            </motion.div>

            <motion.h1 {...fadeUp(0.08)} className="text-4xl md:text-6xl font-black leading-tight mb-5">
              Empowering Lives,
              <span className="block text-teal-200">One Step at a Time</span>
            </motion.h1>

            <motion.p {...fadeUp(0.16)} className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              These organisations are working tirelessly to make quality healthcare accessible to every Indian — from remote villages to urban slums.
            </motion.p>

            {/* Impact stats bar */}
            <motion.div {...fadeUp(0.22)} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {IMPACT_STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl py-4 px-3">
                  <Icon className="w-5 h-5 text-teal-200 mx-auto mb-1" />
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── NGO Cards ── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Our Partner Organisations</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Each NGO below is making a measurable difference. Click any card to learn more and support their cause.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-7">
            {NGOS.map((ngo, i) => (
              <motion.div
                key={ngo.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col"
              >
                {/* Card top accent */}
                <div className={`h-1.5 bg-gradient-to-r ${ngo.color}`} />

                <div className="p-7 flex flex-col flex-1">
                  {/* Logo + meta */}
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-20 h-20 rounded-2xl ${ngo.lightColor} border ${ngo.borderColor} flex items-center justify-center shrink-0 overflow-hidden p-2`}>
                      <img src={ngo.img} alt={ngo.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{ngo.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ngo.tagColor}`}>
                          {ngo.focus}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                          Est. {ngo.founded}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                    {ngo.description}
                  </p>

                  {/* Stats row */}
                  <div className={`grid grid-cols-3 gap-3 ${ngo.lightColor} rounded-2xl border ${ngo.borderColor} p-4 mb-6`}>
                    {ngo.stats.map(stat => (
                      <div key={stat.label} className="text-center">
                        <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={ngo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center justify-center gap-2 bg-gradient-to-r ${ngo.color} text-white font-semibold py-3 px-5 rounded-2xl hover:opacity-90 transition-opacity text-sm`}
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How to Help CTA ── */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp(0)}>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <HandHeart className="w-8 h-8 text-teal-300" />
              </div>
              <h2 className="text-3xl font-black mb-4">Want to Make a Difference?</h2>
              <p className="text-gray-300 mb-8 leading-relaxed max-w-xl mx-auto">
                Whether you volunteer your time, donate, or simply spread awareness — every action counts. Visit any of the NGO websites above to get involved.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {NGOS.map(ngo => (
                  <a key={ngo.name} href={ngo.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                    {ngo.name} <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-gray-100 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-10 px-4">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-xs text-gray-400 dark:text-slate-500">&copy; 2024 Jeevan Chakra. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
}
