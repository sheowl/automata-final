import React, { useState } from 'react';
import { useTags } from '../context/TagsContext';

const DetailedSkillMatchModal = ({ 
  isOpen, 
  onClose, 
  jobTags = [], 
  applicantTags = [],
  matchScore = 0,
  isEmployer = false
}) => {
  const { getTagNamesByIds } = useTags();
  const [selectedState, setSelectedState] = useState(null);

  if (!isOpen) return null;

  // Color scheme based on user type
  const primaryColor = isEmployer ? '#9B1C31' : '#047857';
  const primaryColorDark = isEmployer ? '#7D1628' : '#065F46';

  // Safely handle both tag IDs (numbers) and tag names (strings)
  const safeJobTags = Array.isArray(jobTags) ? jobTags.filter(tag => tag != null) : [];
  const safeApplicantTags = Array.isArray(applicantTags) ? applicantTags.filter(tag => tag != null) : [];
  
  const isJobTagIds = safeJobTags.length > 0 && typeof safeJobTags[0] === 'number';
  const isApplicantTagIds = safeApplicantTags.length > 0 && typeof safeApplicantTags[0] === 'number';
  
  const jobTagNames = isJobTagIds ? getTagNamesByIds(safeJobTags) : safeJobTags;
  const applicantTagNames = isApplicantTagIds ? getTagNamesByIds(safeApplicantTags) : safeApplicantTags;

  // Categorize tags based on matching
  const matchedTags = jobTagNames.filter(tag => applicantTagNames.includes(tag));
  const unmatchedJobTags = jobTagNames.filter(tag => !applicantTagNames.includes(tag));
  const irrelevantApplicantTags = applicantTagNames.filter(tag => !jobTagNames.includes(tag));

  // Determine states
  const getCurrentState = () => {
    if (matchScore >= 75) return 'matched';
    if (matchScore >= 50) return 'partially_matched';
    return 'rejected';
  };

  const currentState = getCurrentState();
  const hasPartialMatch = matchedTags.length > 0 && matchedTags.length < jobTagNames.length;
  const hasFullMatch = matchedTags.length === jobTagNames.length && jobTagNames.length > 0;

  // State transition details
  const stateTransitions = [
    {
      id: 'initial',
      name: 'q0 (Initial)',
      color: 'gray',
      description: 'Starting state before processing any skills',
      tags: [],
      selfLoop: irrelevantApplicantTags,
      selfLoopLabel: 'Irrelevant Skills'
    },
    {
      id: 'rejected',
      name: 'qr (Rejected)',
      color: 'red',
      description: 'Skills do not meet minimum requirements',
      tags: unmatchedJobTags,
      selfLoop: [],
      selfLoopLabel: 'During Cooldown',
      isFinal: true
    },
    {
      id: 'partially_matched',
      name: 'q1 (Partially Matched)',
      color: 'yellow',
      description: 'Some required skills matched',
      tags: hasPartialMatch ? matchedTags : [],
      selfLoop: hasPartialMatch ? ['Additional matching skills'] : [],
      selfLoopLabel: 'More Skills'
    },
    {
      id: 'matched',
      name: 'q2 (Matched)',
      color: currentState === 'matched' ? 'green' : 'gray',
      description: 'All or most required skills matched',
      tags: hasFullMatch ? matchedTags : [],
      selfLoop: hasFullMatch ? ['Any additional skills'] : [],
      selfLoopLabel: 'Any Skill',
      isFinal: true
    }
  ];

  const getColorClasses = (color) => {
    const classes = {
      gray: {
        bg: 'bg-gray-100',
        border: 'border-gray-400',
        text: 'text-gray-700',
        tag: 'bg-gray-200 text-gray-700',
        arrow: 'text-gray-500'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-700',
        tag: 'bg-red-100 text-red-700 border-red-300',
        arrow: 'text-red-500'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        tag: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        arrow: 'text-yellow-500'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-700',
        tag: 'bg-green-100 text-green-700 border-green-300',
        arrow: 'text-green-500'
      }
    };
    return classes[color];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fadeIn">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="text-white px-8 py-6 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColorDark})` }}>
          <div>
            <h2 className="text-2xl font-bold mb-1">Detailed Skill Matching Process</h2>
            <p className="text-sm opacity-90">
              DFA State Machine - Match Score: <span className="font-bold">{matchScore}%</span>
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
              <li>• <strong>States (circles):</strong> Represent different matching stages</li>
              <li>• <strong>Arrows:</strong> Show transitions between states based on skills</li>
              <li>• <strong>Self-loops:</strong> Skills that don't change the current state</li>
              <li>• <strong>Green tags:</strong> Skills that matched job requirements</li>
              <li>• <strong>Red tags:</strong> Required skills you're missing</li>
              <li>• <strong>Gray tags:</strong> Your skills not relevant to this job</li>
            </ul>
          </div>

          {/* State Machine Diagram - Horizontal Layout - All States Visible */}
          <div className="relative overflow-x-auto pb-16 pt-24">
            {/* Row 1: Main path - q0 → q1 → q2 */}
            <div className="flex items-center justify-center gap-8 min-w-max px-8 mb-32">
              {/* Initial State q0 */}
              <div className="relative flex flex-col items-center">
                {/* Self Loop Above */}
                <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-64">
                  <svg width="120" height="80" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
                      </marker>
                    </defs>
                    <path
                      d="M 60 70 Q 30 10, 60 10 Q 90 10, 60 70"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead-gray)"
                    />
                  </svg>
                  <div className="text-center -mt-12">
                    <div className="text-xs font-bold text-gray-600 mb-2">Irrelevant Skills</div>
                    {irrelevantApplicantTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {irrelevantApplicantTags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[10px]">
                            {tag}
                          </span>
                        ))}
                        {irrelevantApplicantTags.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[10px]">
                            +{irrelevantApplicantTags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <HorizontalStateNode
                  state={stateTransitions[0]}
                  isActive={currentState === 'initial'}
                  onClick={() => setSelectedState('initial')}
                  isSelected={selectedState === 'initial'}
                  colorClasses={getColorClasses('gray')}
                />
              </div>

              {/* Arrow from q0 to q1 */}
              <HorizontalArrow
                label="Skill = Required"
                color="yellow"
                tags={matchedTags.slice(0, 2)}
              />

              {/* Partially Matched State q1 */}
              <div className="relative flex flex-col items-center">
                <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-64">
                  <svg width="120" height="80" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-yellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#F5B041" />
                      </marker>
                    </defs>
                    <path
                      d="M 60 70 Q 30 10, 60 10 Q 90 10, 60 70"
                      stroke="#F5B041"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead-yellow)"
                    />
                  </svg>
                  <div className="text-center -mt-12">
                    <div className="text-xs font-bold text-yellow-600 mb-1">More Skills</div>
                  </div>
                </div>
                <HorizontalStateNode
                  state={stateTransitions[2]}
                  isActive={currentState === 'partially_matched'}
                  onClick={() => setSelectedState('partially_matched')}
                  isSelected={selectedState === 'partially_matched'}
                  colorClasses={getColorClasses('yellow')}
                />
              </div>

              {/* Arrow from q1 to q2 */}
              <HorizontalArrow
                label="All Matched"
                color="green"
                tags={matchedTags.slice(-2)}
              />

              {/* Matched State q2 */}
              <div className="relative flex flex-col items-center">
                <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-64">
                  <svg width="120" height="80" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-green" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#27AE60" />
                      </marker>
                    </defs>
                    <path
                      d="M 60 70 Q 30 10, 60 10 Q 90 10, 60 70"
                      stroke="#27AE60"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead-green)"
                    />
                  </svg>
                  <div className="text-center -mt-12">
                    <div className="text-xs font-bold text-green-600 mb-1">Any Additional Skill</div>
                  </div>
                </div>
                <HorizontalStateNode
                  state={stateTransitions[3]}
                  isActive={currentState === 'matched'}
                  onClick={() => setSelectedState('matched')}
                  isSelected={selectedState === 'matched'}
                  colorClasses={getColorClasses('green')}
                />
              </div>
            </div>

            {/* Row 2: Rejected state (below) */}
            <div className="flex justify-center relative mt-16">
              <div className="relative">
                <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-64">
                  <svg width="120" height="80" className="mx-auto">
                    <defs>
                      <marker id="arrowhead-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#EF4444" />
                      </marker>
                    </defs>
                    <path
                      d="M 60 70 Q 30 10, 60 10 Q 90 10, 60 70"
                      stroke="#EF4444"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead-red)"
                    />
                  </svg>
                  <div className="text-center -mt-12">
                    <div className="text-xs font-bold text-red-600 mb-1">Cooldown Period</div>
                  </div>
                </div>
                <HorizontalStateNode
                  state={stateTransitions[1]}
                  isActive={currentState === 'rejected'}
                  onClick={() => setSelectedState('rejected')}
                  isSelected={selectedState === 'rejected'}
                  colorClasses={getColorClasses('red')}
                />
              </div>

              {/* Arrow from q0/q1 to qr */}
              <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
                <svg width="200" height="120" className="mx-auto">
                  <defs>
                    <marker id="arrowhead-reject" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#EF4444" />
                    </marker>
                  </defs>
                  <path
                    d="M 100 10 Q 100 60, 100 110"
                    stroke="#EF4444"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4,4"
                    markerEnd="url(#arrowhead-reject)"
                  />
                  <text x="110" y="60" fill="#EF4444" fontSize="11" fontWeight="bold">Invalid/No Match</text>
                </svg>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <SummaryCard
                title="Matched Skills"
                count={matchedTags.length}
                icon="bi-check-circle-fill"
                color="green"
                items={matchedTags}
              />
              <SummaryCard
                title="Missing Skills"
                count={unmatchedJobTags.length}
                icon="bi-x-circle-fill"
                color="red"
                items={unmatchedJobTags}
              />
              <SummaryCard
                title="Irrelevant Skills"
                count={irrelevantApplicantTags.length}
                icon="bi-dash-circle-fill"
                color="gray"
                items={irrelevantApplicantTags}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>Current State:</strong> {stateTransitions.find(s => s.id === currentState)?.name}
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

// Horizontal State Node Component
const HorizontalStateNode = ({ state, isActive, onClick, isSelected, colorClasses }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105' : ''}`}
  >
    <div className="flex flex-col items-center w-48">
      {/* Circle */}
      <div
        className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center ${
          isActive ? colorClasses.border : 'border-gray-300'
        } ${isActive ? colorClasses.bg : 'bg-white'} ${
          state.isFinal ? 'ring-4 ring-offset-2' : ''
        } ${isActive && state.isFinal ? `ring-${colorClasses.border}` : 'ring-transparent'} shadow-lg`}
      >
        <span className={`text-xl font-bold ${isActive ? colorClasses.text : 'text-gray-400'}`}>
          {state.name.split(' ')[0]}
        </span>
        {isActive && (
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: isActive.primaryColor || '#047857' }}>
              <i className="bi bi-circle-fill text-white text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* Label Below */}
      <div className="text-center mt-3">
        <div className="font-bold text-sm text-gray-800">{state.name}</div>
        <p className="text-xs text-gray-600 mt-1 px-2">{state.description}</p>
      </div>

      {/* Tags Badge */}
      {state.tags.length > 0 && (
        <div className="mt-2 bg-white rounded-lg shadow p-2 border-2" style={{ borderColor: colorClasses.border }}>
          <div className="text-[10px] font-semibold text-gray-500 mb-1">Contains:</div>
          <div className="flex flex-wrap gap-1 justify-center max-w-40">
            {state.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorClasses.tag}`}>
                {tag.length > 12 ? tag.substring(0, 12) + '...' : tag}
              </span>
            ))}
            {state.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                +{state.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Horizontal Arrow Component
const HorizontalArrow = ({ label, color, tags }) => {
  const colorMap = {
    red: { stroke: '#EF4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
    yellow: { stroke: '#F5B041', text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300' },
    green: { stroke: '#27AE60', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' },
    blue: { stroke: '#047857', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' }
  };

  const colors = colorMap[color];

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Arrow SVG */}
      <svg width="120" height="60" className="mb-2">
        <defs>
          <marker id={`arrowhead-${color}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={colors.stroke} />
          </marker>
        </defs>
        <line
          x1="0"
          y1="30"
          x2="110"
          y2="30"
          stroke={colors.stroke}
          strokeWidth="3"
          markerEnd={`url(#arrowhead-${color})`}
        />
      </svg>

      {/* Label and Tags */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-2 min-w-32`}>
        <div className={`text-xs font-bold ${colors.text} text-center mb-1`}>{label}</div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.text}`}
              >
                {tag.length > 10 ? tag.substring(0, 10) + '...' : tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, count, icon, color, items }) => {
  const [expanded, setExpanded] = useState(false);

  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <i className={`bi ${icon} text-xl`} />
          <span className="font-bold text-sm">{title}</span>
        </div>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      {items.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs underline hover:no-underline"
        >
          {expanded ? 'Hide' : 'Show'} details
        </button>
      )}
      {expanded && (
        <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
              • {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailedSkillMatchModal;
