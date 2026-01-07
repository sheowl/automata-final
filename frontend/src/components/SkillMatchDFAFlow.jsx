import React from 'react';

const SkillMatchDFAFlow = ({ matchScore = 0, requiredSkills = 0, matchedSkills = 0 }) => {
  // Determine current state
  const getCurrentState = () => {
    if (matchScore >= 75) return 'matched';
    if (matchScore >= 50) return 'partially_matched';
    return 'rejected';
  };

  const currentState = getCurrentState();

  const StateNode = ({ state, label, isActive, isFinal = false }) => (
    <div className="flex flex-col items-center">
      <div
        className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${
          isActive
            ? state === 'matched'
              ? 'border-[#27AE60] bg-[#27AE60] bg-opacity-20 shadow-lg'
              : state === 'partially_matched'
              ? 'border-[#F5B041] bg-[#F5B041] bg-opacity-20 shadow-lg'
              : 'border-[#EF4444] bg-[#EF4444] bg-opacity-20 shadow-lg'
            : 'border-gray-300 bg-gray-50'
        } ${isFinal ? 'ring-4 ring-offset-2' : ''} ${
          isFinal && isActive
            ? state === 'matched'
              ? 'ring-[#27AE60]'
              : 'ring-[#EF4444]'
            : 'ring-transparent'
        }`}
      >
        <span
          className={`text-xl font-bold ${
            isActive
              ? state === 'matched'
                ? 'text-[#27AE60]'
                : state === 'partially_matched'
                ? 'text-[#F5B041]'
                : 'text-[#EF4444]'
              : 'text-gray-400'
          }`}
        >
          {state === 'initial' && 'q0'}
          {state === 'partially_matched' && 'q1'}
          {state === 'matched' && 'q2'}
          {state === 'rejected' && 'qr'}
        </span>
        {isActive && (
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-[#047857] rounded-full flex items-center justify-center animate-pulse">
              <i className="bi bi-circle-fill text-white text-xs" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <div
          className={`text-sm font-bold ${
            isActive
              ? state === 'matched'
                ? 'text-[#27AE60]'
                : state === 'partially_matched'
                ? 'text-[#F5B041]'
                : 'text-[#EF4444]'
              : 'text-gray-600'
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  );

  const Transition = ({ label, isActive, color = 'gray' }) => (
    <div className="flex flex-col items-center justify-center px-4">
      <div
        className={`border-t-2 w-full transition-all duration-300 ${
          isActive
            ? color === 'green'
              ? 'border-[#27AE60]'
              : color === 'yellow'
              ? 'border-[#F5B041]'
              : color === 'red'
              ? 'border-[#EF4444]'
              : 'border-[#047857]'
            : 'border-gray-300 border-dashed'
        }`}
        style={{ width: '80px' }}
      />
      {isActive && (
        <div className="absolute">
          <i
            className={`bi bi-arrow-right text-xl ${
              color === 'green'
                ? 'text-[#27AE60]'
                : color === 'yellow'
                ? 'text-[#F5B041]'
                : color === 'red'
                ? 'text-[#EF4444]'
                : 'text-[#047857]'
            }`}
          />
        </div>
      )}
      <span
        className={`text-[10px] font-semibold mt-1 px-2 py-1 rounded ${
          isActive
            ? color === 'green'
              ? 'bg-[#27AE60] bg-opacity-20 text-[#27AE60]'
              : color === 'yellow'
              ? 'bg-[#F5B041] bg-opacity-20 text-[#F5B041]'
              : color === 'red'
              ? 'bg-[#EF4444] bg-opacity-20 text-[#EF4444]'
              : 'bg-[#047857] bg-opacity-20 text-[#047857]'
            : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );

  const SelfLoop = ({ label, position = 'top', isActive }) => (
    <div
      className={`absolute ${
        position === 'top' ? '-top-8' : '-bottom-8'
      } left-1/2 transform -translate-x-1/2`}
    >
      <div className="relative">
        <svg width="60" height="40" viewBox="0 0 60 40">
          <path
            d="M 10 20 Q 30 0, 50 20"
            fill="none"
            stroke={isActive ? '#047857' : '#d1d5db'}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <polygon
            points="50,20 45,15 45,25"
            fill={isActive ? '#047857' : '#d1d5db'}
            className="transition-all duration-300"
          />
        </svg>
        <span
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-[9px] font-semibold whitespace-nowrap ${
            isActive ? 'text-[#047857]' : 'text-gray-400'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[20px] shadow-lg p-8 font-montserrat">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Skill Matching State Machine</h3>
        <p className="text-sm text-gray-600">
          Current Match: {matchedSkills} of {requiredSkills} skills ({matchScore}%)
        </p>
      </div>

      {/* DFA Diagram */}
      <div className="flex items-center justify-center mb-8">
        {/* Initial State */}
        <div className="relative">
          <StateNode state="initial" label="Initial" isActive={false} />
          <SelfLoop label="Irrelevant Skills" position="top" isActive={false} />
        </div>

        {/* Transition to Rejected */}
        {currentState === 'rejected' && (
          <>
            <div className="mx-4">
              <Transition label="Invalid Skill" isActive={true} color="red" />
            </div>
            <div className="relative">
              <StateNode state="rejected" label="Rejected" isActive={true} isFinal={true} />
              <SelfLoop label="During Cooldown" position="bottom" isActive={false} />
            </div>
          </>
        )}

        {/* Transition to Partial Match */}
        {(currentState === 'partially_matched' || currentState === 'matched') && (
          <>
            <div className="mx-4">
              <Transition
                label="Skill = Required"
                isActive={true}
                color={currentState === 'matched' ? 'green' : 'yellow'}
              />
            </div>
            <div className="relative">
              <StateNode
                state="partially_matched"
                label="Partially Matched"
                isActive={currentState === 'partially_matched'}
              />
              <SelfLoop label="More skills" position="top" isActive={currentState === 'partially_matched'} />
            </div>
          </>
        )}

        {/* Transition to Matched */}
        {currentState === 'matched' && (
          <>
            <div className="mx-4">
              <Transition label="All Matched" isActive={true} color="green" />
            </div>
            <div className="relative">
              <StateNode state="matched" label="Matched" isActive={true} isFinal={true} />
              <SelfLoop label="Any skill" position="top" isActive={false} />
            </div>
          </>
        )}
      </div>

      {/* State Legend */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">q0</span>
          </div>
          <div>
            <div className="font-bold text-gray-800">Initial State</div>
            <div className="text-gray-500">No skills analyzed</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-[#F5B041] bg-opacity-10 rounded-lg">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5B041] bg-white flex items-center justify-center">
            <span className="text-xs font-bold text-[#F5B041]">q1</span>
          </div>
          <div>
            <div className="font-bold text-[#F5B041]">Partial Match</div>
            <div className="text-gray-500">50-74% matched</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-[#27AE60] bg-opacity-10 rounded-lg">
          <div className="w-8 h-8 rounded-full border-2 border-[#27AE60] bg-white flex items-center justify-center ring-2 ring-[#27AE60] ring-offset-1">
            <span className="text-xs font-bold text-[#27AE60]">q2</span>
          </div>
          <div>
            <div className="font-bold text-[#27AE60]">Matched</div>
            <div className="text-gray-500">≥75% matched</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#047857] to-[#065F46] rounded-[12px] text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold opacity-90">Current State</div>
            <div className="text-2xl font-bold">
              {currentState === 'matched' && 'Matched ✓'}
              {currentState === 'partially_matched' && 'Partially Matched'}
              {currentState === 'rejected' && 'Not Recommended'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{matchScore}%</div>
            <div className="text-xs opacity-75">
              {matchedSkills}/{requiredSkills} skills
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillMatchDFAFlow;
