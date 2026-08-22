//PatientSidebar.jsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { db, auth } from '../firebase/config';
import { Check, X } from 'lucide-react';
import { createNotification } from '../utils/notifications';

export function PatientSidebar({ isOpen, onClose, patientId, appointmentId }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [vaccinations, setVaccinations] = useState({});

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user');
        }

        const patientDoc = await getDoc(doc(db, 'patients', patientId));

        if (patientDoc.exists()) {
          const patientData = patientDoc.data();
          setPatient(patientData);
          
          // Convert existing vaccinations array to object for easier checking
          const existingVaccinations = {};
          patientData.vaccinations?.forEach(vac => {
            existingVaccinations[vac.name] = true;
          });
          setVaccinations(existingVaccinations);
        } else {
          setError('Patient not found');
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(`Failed to load patient details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  const handleComplete = async () => {
    try {
      setSavingStatus(true);

      // Update appointment status
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      });

      // Notify patient
      if (patientId) {
        const currentUser = auth.currentUser;
        const doctorName = currentUser?.displayName || currentUser?.email || 'your doctor';
        await createNotification({
          userId: patientId,
          message: `Your appointment with Dr. ${doctorName} has been marked as completed. Please rate your visit!`,
          type: 'appointment_completed',
          appointmentId,
        });
      }

      // Update patient vaccinations if changed
      if (Object.keys(vaccinations).length > 0) {
        const updatedVaccinations = Object.entries(vaccinations)
          .filter(([_, value]) => value)
          .map(([name]) => ({
            name,
            date: new Date(),
            completed: true
          }));

        await updateDoc(doc(db, 'patients', patientId), {
          vaccinations: updatedVaccinations
        });
      }

      onClose();
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleVaccinationToggle = (vaccineName) => {
    setVaccinations(prev => ({
      ...prev,
      [vaccineName]: !prev[vaccineName]
    }));
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="h-full overflow-y-auto flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Patient Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : patient ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Section title="Personal Information">
                <InfoItem label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
                <InfoItem label="Age" value={patient.age} />
                <InfoItem label="Gender" value={patient.gender} />
                <InfoItem label="Blood Group" value={patient.bloodGroup} />
              </Section>

              {/* Contact Information */}
              <Section title="Contact Details">
                <InfoItem label="Email" value={patient.email} />
                <InfoItem label="Phone" value={patient.phone} />
                <InfoItem label="Address" value={patient.address} />
              </Section>

              {/* Medical History */}
              <Section title="Medical History">
                <InfoItem label="Allergies" value={patient.allergies?.join(', ') || 'None'} />
                <InfoItem label="Chronic Conditions" value={patient.chronicConditions?.join(', ') || 'None'} />
              </Section>

              {/* Vaccination Details */}
              
              <Section title="Child Vaccination Details">
                <div className="space-y-6">
                  {/* Birth to 15 months */}
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Birth to 15 Months</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'BCG', recommended: 'At birth' },
                        { name: 'Hepatitis B', recommended: '0-2 months' },
                        { name: 'DPT', recommended: '6-14 weeks' },
                        { name: 'Polio (OPV)', recommended: '6-14 weeks' },
                        { name: 'Rotavirus', recommended: '6-14 weeks' }
                      ].map((vaccine) => (
                        <div key={vaccine.name} className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              id={`vaccine-${vaccine.name}`}
                              checked={vaccinations[vaccine.name] || false}
                              onChange={() => handleVaccinationToggle(vaccine.name)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`vaccine-${vaccine.name}`} className="ml-2 text-sm text-gray-900">
                              {vaccine.name}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500">{vaccine.recommended}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              
                  {/* 15 months to 6 years */}
                  <div className="border-l-4 border-green-200 pl-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">15 Months to 6 Years</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'MMR', recommended: '12-15 months' },
                        { name: 'Chickenpox', recommended: '12-15 months' },
                        { name: 'Hepatitis A', recommended: '12-23 months' },
                        { name: 'DTaP', recommended: '15-18 months' },
                        { name: 'Pneumococcal', recommended: '4-6 years' }
                      ].map((vaccine) => (
                        <div key={vaccine.name} className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              id={`vaccine-${vaccine.name}`}
                              checked={vaccinations[vaccine.name] || false}
                              onChange={() => handleVaccinationToggle(vaccine.name)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`vaccine-${vaccine.name}`} className="ml-2 text-sm text-gray-900">
                              {vaccine.name}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500">{vaccine.recommended}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          ) : (
            <div className="text-center text-gray-500">No patient data available</div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={handleComplete}
            disabled={savingStatus}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md
              hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {savingStatus ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 
                  border-2 border-white" />
                Completing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Complete Appointment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper components
const Section = ({ title, children }) => (
  <div className="border-b pb-4">
    <h3 className="font-semibold text-lg mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <span className="text-gray-600 text-sm">{label}:</span>
    <span className="ml-2">{value || 'N/A'}</span>
  </div>
);