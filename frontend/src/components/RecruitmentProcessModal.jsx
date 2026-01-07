import React, { useState } from 'react';

const RecruitmentProcessModal = ({ 
  isOpen, 
  onClose, 
  currentStatus = 'not_applied',
  applicationDate = null,
  interviewDate = null,
  rejectionDate = null,
  acceptedDate = null,
  isEmployer = false
}) => {
  const [selectedState, setSelectedState] = useState(null);

  if (!isOpen) return null;

  // Color scheme based on user type
  const primaryColor = isEmployer ? '#9B1C31' : '#047857';
  const primaryColorDark = isEmployer ? '#7D1628' : '#065F46';

  // State definitions based on the DFA diagram
  const states = [
    {
      id: 'not_applied',
      name: 'not_applied',
      displayName: 'Not Applied',
      label: 'Initial',
      color: 'gray',
      description: 'Initial state - browsing available positions',
      selfLoop: 'Browse Jobs',
      icon: 'bi-search'
    },
    {
      id: 'applied',
      name: 'applied',
      displayName: 'Applied',
      label: 'Applied',
      color: 'blue',
      description: 'Application submitted and under review',
      selfLoop: 'Update Application',
      icon: 'bi-file-text'
    },
    {
      id: 'interview',
      name: 'interview',
      displayName: 'Interview',
      label: 'Interview',
      color: 'yellow',
      description: 'Scheduled for interview phase',
      selfLoop: 'Interview Phase',
      icon: 'bi-calendar-check'
    },
    {
      id: 'rejected',
      name: 'rejected',
      displayName: 'Rejected',
      label: 'Rejected',
      color: 'red',
      description: 'Application not successful - can reapply after cooldown',
      selfLoop: 'During Cooldown',
      icon: 'bi-x-circle',
      cooldown: '7-days Cooldown'
    },
    {
      id: 'accepted',
      name: 'accepted',
      displayName: 'Accepted',
      label: 'Accepted',
      color: currentStatus === 'accepted' ? 'green' : 'gray',
      description: 'Successfully hired for the position',
      selfLoop: 'Any event (terminal)',
      icon: 'bi-check-circle',
      isFinal: true
    }
  ];

  // Transitions based on the diagram
  const transitions = [
    { from: 'not_applied', to: 'applied', label: 'Apply', color: 'blue' },
    { from: 'applied', to: 'interview', label: 'Set Interview', color: 'yellow' },
    { from: 'applied', to: 'rejected', label: 'Reject', color: 'red' },
    { from: 'interview', to: 'rejected', label: 'Reject', color: 'red' },
    { from: 'interview', to: 'accepted', label: 'Hire', color: 'green' },
    { from: 'rejected', to: 'not_applied', label: 'Reapply (7-days Cooldown)', color: 'gray' },
    { from: 'applied', to: 'not_applied', label: 'Withdraw', color: 'gray' }
  ];

  const currentState = states.find(s => s.id === currentStatus) || states[0];

  const getColorClasses = (color) => {
    const classes = {
      gray: {
        bg: 'bg-gray-100',
        border: 'border-gray-400',
        text: 'text-gray-700',
        stroke: '#9CA3AF'
      },
      blue: {
        bg: 'bg-emerald-50',
        border: 'border-[#047857]',
        text: 'text-[#047857]',
        stroke: '#047857'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        stroke: '#F5B041'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-700',
        stroke: '#EF4444'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-700',
        stroke: '#27AE60'
      }
    };
    return classes[color];
  };

  // Determine visible transitions based on current state
  const getVisibleTransitions = () => {
    switch (currentStatus) {
      case 'not_applied':
        return ['not_applied-applied'];
      case 'applied':
        return ['not_applied-applied', 'applied-interview', 'applied-rejected', 'applied-not_applied'];
      case 'interview':
        return ['not_applied-applied', 'applied-interview', 'interview-rejected', 'interview-accepted'];
      case 'rejected':
        return ['rejected-not_applied'];
      case 'accepted':
        return ['not_applied-applied', 'applied-interview', 'interview-accepted'];
      default:
        return [];
    }
  };

  const visibleTransitions = getVisibleTransitions();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fadeIn">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="text-white px-8 py-6 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColorDark})` }}>
          <div>
            <h2 className="text-2xl font-bold mb-1">Recruitment Process State Machine</h2>
            <p className="text-sm opacity-90">
              Current Status: <span className="font-bold">{currentState.displayName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <i className="bi bi-x-lg text-3xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Legend */}
          <div className={`mb-8 ${isEmployer ? 'bg-rose-50 border-[#9B1C31]' : 'bg-emerald-50 border-[#047857]'} border-l-4 p-4 rounded`}>
            <div className="flex items-center gap-2 mb-2">
              <i className="bi bi-info-circle-fill" style={{ color: primaryColor }} />
              <span className="font-bold" style={{ color: primaryColor }}>How to Read This Diagram</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-6">
              <li>• <strong>States (circles):</strong> Different stages in the recruitment process</li>
              <li>• <strong>Arrows:</strong> Possible transitions between states</li>
              <li>• <strong>Self-loops:</strong> Actions that keep you in the current state</li>
              <li>• <strong>Double circle:</strong> Final/terminal state (Accepted)</li>
              <li>• <strong>Blue pulse:</strong> Your current state in the process</li>
            </ul>
          </div>

          {/* Horizontal State Machine Diagram - All States Visible */}
          <div className="relative min-h-[500px] py-20 px-4">
            {/* Main horizontal flow container */}
            <div className="relative flex items-center justify-center gap-8 mb-20">
              {/* not_applied State */}
              <div className="relative">
                <StateNodeRecruit
                  state={states[0]}
                  isActive={currentStatus === 'not_applied'}
                  onClick={() => setSelectedState('not_applied')}
                  isSelected={selectedState === 'not_applied'}
                  colorClasses={getColorClasses('gray')}
                  showSelfLoop={true}
                />
              </div>

              {/* Arrow: not_applied → applied */}
              <HorizontalArrowRecruit label="Apply" color="blue" />

              {/* applied State */}
              <div className="relative">
                <StateNodeRecruit
                  state={states[1]}
                  isActive={currentStatus === 'applied'}
                  onClick={() => setSelectedState('applied')}
                  isSelected={selectedState === 'applied'}
                  colorClasses={getColorClasses('blue')}
                  showSelfLoop={true}
                />
                
                {/* Withdraw arrow - curved back to not_applied */}
                <div className="absolute -top-16 -left-32 w-72">
                  <svg width="280" height="70" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-withdraw" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
                      </marker>
                    </defs>
                    <path
                      d="M 260 50 Q 140 10, 20 50"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead-withdraw)"
                    />
                    <text x="110" y="25" fill="#9CA3AF" fontSize="11" fontWeight="bold">Withdraw</text>
                  </svg>
                </div>
              </div>

              {/* Arrow: applied → interview */}
              <HorizontalArrowRecruit label="Set Interview" color="yellow" />

              {/* interview State */}
              <div className="relative">
                <StateNodeRecruit
                  state={states[2]}
                  isActive={currentStatus === 'interview'}
                  onClick={() => setSelectedState('interview')}
                  isSelected={selectedState === 'interview'}
                  colorClasses={getColorClasses('yellow')}
                  showSelfLoop={true}
                />
              </div>

              {/* Arrow: interview → accepted */}
              <HorizontalArrowRecruit label="Hire" color="green" />

              {/* accepted State */}
              <div className="relative">
                <StateNodeRecruit
                  state={states[4]}
                  isActive={currentStatus === 'accepted'}
                  onClick={() => setSelectedState('accepted')}
                  isSelected={selectedState === 'accepted'}
                  colorClasses={getColorClasses('green')}
                  showSelfLoop={true}
                />
              </div>
            </div>

            {/* Rejected state (centered below) */}
            <div className="flex justify-center items-center">
              <div className="relative">
                <StateNodeRecruit
                  state={states[3]}
                  isActive={currentStatus === 'rejected'}
                  onClick={() => setSelectedState('rejected')}
                  isSelected={selectedState === 'rejected'}
                  colorClasses={getColorClasses('red')}
                  showSelfLoop={true}
                />
                
                {/* Reject arrow from above (applied/interview) */}
                <div className="absolute -top-40 left-1/2 transform -translate-x-1/2">
                  <svg width="120" height="150" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-reject" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#EF4444" />
                      </marker>
                    </defs>
                    <path
                      d="M 60 10 L 60 140"
                      stroke="#EF4444"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      markerEnd="url(#arrowhead-reject)"
                    />
                    <text x="70" y="80" fill="#EF4444" fontSize="12" fontWeight="bold">Reject</text>
                    <text x="35" y="95" fill="#EF4444" fontSize="10">During Cooldown</text>
                  </svg>
                </div>

                {/* Reapply arrow - curved back to not_applied */}
                <div className="absolute top-12 -left-96">
                  <svg width="750" height="100" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-reapply" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
                      </marker>
                    </defs>
                    <path
                      d="M 740 20 Q 375 90, 10 20"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="6,4"
                      markerEnd="url(#arrowhead-reapply)"
                    />
                    <text x="290" y="85" fill="#9CA3AF" fontSize="11" fontWeight="bold">Reapply (7-days Cooldown)</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Info */}
          {(applicationDate || interviewDate || rejectionDate || acceptedDate) && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="bi bi-clock-history" />
                Application Timeline
              </h3>
              <div className="space-y-2 text-sm">
                {applicationDate && (
                  <div className="flex items-center gap-2">
                    <i className="bi bi-circle-fill text-emerald-500 text-xs" />
                    <span className="font-semibold">Applied:</span>
                    <span className="text-gray-600">{new Date(applicationDate).toLocaleDateString()}</span>
                  </div>
                )}
                {interviewDate && (
                  <div className="flex items-center gap-2">
                    <i className="bi bi-circle-fill text-yellow-500 text-xs" />
                    <span className="font-semibold">Interview Scheduled:</span>
                    <span className="text-gray-600">{new Date(interviewDate).toLocaleDateString()}</span>
                  </div>
                )}
                {rejectionDate && (
                  <div className="flex items-center gap-2">
                    <i className="bi bi-circle-fill text-red-500 text-xs" />
                    <span className="font-semibold">Rejected:</span>
                    <span className="text-gray-600">{new Date(rejectionDate).toLocaleDateString()}</span>
                  </div>
                )}
                {acceptedDate && (
                  <div className="flex items-center gap-2">
                    <i className="bi bi-circle-fill text-green-500 text-xs" />
                    <span className="font-semibold">Accepted:</span>
                    <span className="text-gray-600">{new Date(acceptedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>Current State:</strong> {currentState.displayName} - {currentState.description}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white rounded-lg transition-colors font-semibold"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => e.target.style.backgroundColor = primaryColorDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// State Node Component for Recruitment
const StateNodeRecruit = ({ state, isActive, onClick, isSelected, colorClasses, showSelfLoop }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105' : ''} relative`}
  >
    <div className="flex flex-col items-center w-44">
      {/* Self Loop Above (only if showSelfLoop is true) */}
      {showSelfLoop && state.selfLoop && (
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-full">
          <svg width="100" height="70" className="mx-auto">
            <defs>
              <marker id={`arrowhead-${state.id}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={colorClasses.stroke} />
              </marker>
            </defs>
            <path
              d="M 50 60 Q 20 10, 50 10 Q 80 10, 50 60"
              stroke={colorClasses.stroke}
              strokeWidth="2"
              fill="none"
              markerEnd={`url(#arrowhead-${state.id})`}
            />
          </svg>
          <div className="text-center -mt-10">
            <div className={`text-[10px] font-bold ${colorClasses.text}`}>{state.selfLoop}</div>
          </div>
        </div>
      )}

      {/* Circle */}
      <div
        className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center ${
          isActive ? colorClasses.border : 'border-gray-300'
        } ${isActive ? colorClasses.bg : 'bg-white'} ${
          state.isFinal ? 'ring-4 ring-offset-2 ring-green-500' : ''
        } shadow-lg`}
      >
        <i className={`${state.icon} text-2xl ${isActive ? colorClasses.text : 'text-gray-400'}`} />
        {isActive && (
          <div className="absolute -top-2 -right-2">
            <div className="w-5 h-5 bg-[#047857] rounded-full flex items-center justify-center animate-pulse">
              <i className="bi bi-circle-fill text-white text-[8px]" />
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center mt-2">
        <div className="font-bold text-xs text-gray-800">{state.displayName}</div>
        <p className="text-[10px] text-gray-600 mt-1 px-1">{state.description}</p>
      </div>
    </div>
  </div>
);

// Horizontal Arrow Component for Recruitment
const HorizontalArrowRecruit = ({ label, color }) => {
  const colorMap = {
    gray: { stroke: '#9CA3AF', text: 'text-gray-600' },
    blue: { stroke: '#047857', text: 'text-[#047857]' },
    yellow: { stroke: '#F5B041', text: 'text-yellow-600' },
    red: { stroke: '#EF4444', text: 'text-red-600' },
    green: { stroke: '#27AE60', text: 'text-green-600' }
  };

  const colors = colorMap[color];

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="80" height="40" className="mb-1">
        <defs>
          <marker id={`arrow-${color}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={colors.stroke} />
          </marker>
        </defs>
        <line
          x1="0"
          y1="20"
          x2="70"
          y2="20"
          stroke={colors.stroke}
          strokeWidth="2.5"
          markerEnd={`url(#arrow-${color})`}
        />
      </svg>
      <div className={`text-[10px] font-bold ${colors.text}`}>{label}</div>
    </div>
  );
};

export default RecruitmentProcessModal;
