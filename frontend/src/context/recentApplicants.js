// context/recentApplicants.js

const recentApplicants = [
  {
    id: 1,
    name: "Kurt Borondia",
    position: "Senior UI/UX Designer",
    timeAgo: "2 hours ago",
    matchPercentage: 45,
    status: "new",
    appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Frontend Developer",
    timeAgo: "5 hours ago",
    matchPercentage: 82,
    status: "viewed",
    appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 3,
    name: "Mike Chen",
    position: "Product Manager",
    timeAgo: "1 day ago",
    matchPercentage: 69,
    status: "viewed",
    appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    name: "Anna Lee",
    position: "Backend Developer",
    timeAgo: "2 days ago",
    matchPercentage: 77,
    status: "new",
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 5,
    name: "John Smith",
    position: "QA Engineer",
    timeAgo: "3 days ago",
    matchPercentage: 53,
    status: "viewed",
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 6,
    name: "Emily Davis",
    position: "DevOps Engineer",
    timeAgo: "4 days ago",
    matchPercentage: 88,
    status: "new",
    appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 7,
    name: "Carlos Martinez",
    position: "Data Scientist",
    timeAgo: "5 days ago",
    matchPercentage: 62,
    status: "viewed",
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 8,
    name: "Priya Patel",
    position: "Business Analyst",
    timeAgo: "6 days ago",
    matchPercentage: 74,
    status: "new",
    appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    id: 9,
    name: "Liam O'Connor",
    position: "Full Stack Developer",
    timeAgo: "1 week ago",
    matchPercentage: 80,
    status: "viewed",
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 10,
    name: "Sophia Kim",
    position: "Mobile App Developer",
    timeAgo: "2 weeks ago",
    matchPercentage: 59,
    status: "new",
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
];

export default recentApplicants;
