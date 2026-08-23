export function ProgressSteps({ currentStep, totalSteps }) {
    return (
      <div className="w-full bg-sand-200 h-2 rounded-full mb-8">
        <div 
          className="bg-brand-700 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    );
  }