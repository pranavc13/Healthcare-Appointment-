import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Find a Doctor</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Browse verified doctors by specialisation.</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={specialisation}
              onChange={(e) => setSpecialisation(e.target.value)}
              placeholder="Search by specialisation, e.g. Cardiologist"
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-2xl text-sm transition-colors">
            Search
          </button>
        </form>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-400 text-sm">No doctors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                    {doc.userId?.name?.[0] || <Stethoscope className="w-6 h-6" />}
                  </div>
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
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Book appointment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
