import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Stethoscope, ArrowRight } from 'lucide-react';
import * as doctorsService from '../../services/doctorsService';
import { useToast } from '../../components/Toast';

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialisation, setSpecialisation] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const data = await doctorsService.listDoctors(params);
      setDoctors(data);
    } catch (err) {
      toast.error('Could not load doctors', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(specialisation ? { specialisation } : {});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Find a Doctor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Browse verified doctors by specialisation.</p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          className="flex gap-2 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={specialisation}
              onChange={(e) => setSpecialisation(e.target.value)}
              placeholder="Search by specialisation, e.g. Cardiologist"
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-2xl text-sm transition-colors shadow-lg shadow-blue-200/40 dark:shadow-none">
            Search
          </motion.button>
        </motion.form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 text-sm">No doctors found.</motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {doctors.map((doc, i) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:shadow-slate-950/60 transition-shadow duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 4 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg"
                    >
                      {doc.userId?.name?.[0] || <Stethoscope className="w-6 h-6" />}
                    </motion.div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{doc.userId?.name}</p>
                      <p className="text-xs text-blue-500 font-medium">{doc.specialisation}</p>
                    </div>
                  </div>
                  {doc.qualifications && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{doc.qualifications}</p>
                  )}
                  <Link
                    to={`/patient/doctors/${doc._id}/book`}
                    className="group inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    Book appointment
                    <motion.span className="inline-flex" whileHover={{ x: 3 }}>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
