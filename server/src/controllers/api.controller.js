const servicesData = [
  {
    id: 1,
    title: "Spiritual & Cultural Programs",
    category: "Events",
    description: "Organizing devotional satsangs, kirtans, and community spiritual gatherings.",
    icon: "HeartHandshake"
  },
  {
    id: 2,
    title: "Community Seva & Outreach",
    category: "Service",
    description: "Philanthropic food drives (Annadaan), educational aid, and healthcare support.",
    icon: "Users"
  },
  {
    id: 3,
    title: "Publications & Discourses",
    category: "Knowledge",
    description: "Access to authentic literature, audio discourses, and spiritual guidance archives.",
    icon: "BookOpen"
  },
  {
    id: 4,
    title: "Youth & Educational Wings",
    category: "Empowerment",
    description: "Value-based training, meditation workshops, and youth leadership initiatives.",
    icon: "GraduationCap"
  }
];

const mockInquiries = [];

export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "GuruKripa API Server",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development"
  });
};

export const getAppInfo = (req, res) => {
  res.status(200).json({
    name: "GuruKripa",
    version: "1.0.0",
    description: "Full-Stack Portal powered by React, Vite, and Node.js Express",
    features: [
      "Vite + React 19 Frontend",
      "Express REST API Backend",
      "CORS & Environment-configured",
      "Interactive Health & Data Dashboards"
    ]
  });
};

export const getServices = (req, res) => {
  res.status(200).json({
    success: true,
    count: servicesData.length,
    data: servicesData
  });
};

export const submitInquiry = (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Please provide name, email, and message."
    });
  }

  const newInquiry = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: subject ? subject.trim() : "General Inquiry",
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  mockInquiries.push(newInquiry);

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out to GuruKripa. Your message has been received.",
    data: newInquiry
  });
};

export const getInquiries = (req, res) => {
  res.status(200).json({
    success: true,
    count: mockInquiries.length,
    data: mockInquiries
  });
};
