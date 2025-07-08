import React, { useState, useEffect } from 'react';
import { mockUser, mockProfile, mockPosts, mockConnections, mockSocials } from './mockProfileData';
import { FaLinkedin, FaGithub, FaTwitter, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const socialIconMap: Record<string, JSX.Element> = {
  linkedin: <FaLinkedin className="text-blue-400" />,
  github: <FaGithub className="text-gray-300" />,
  twitter: <FaTwitter className="text-blue-400" />,
};

const ProfileView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showBio, setShowBio] = useState(true);
  const [showExperience, setShowExperience] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const loadMorePosts = () => setVisiblePosts((v) => v + 1);

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto p-4 font-sans">
        {/* Profile Header */}
        <div className="relative flex flex-col md:flex-row items-center md:items-end bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 border border-white/10" 
             style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.name}`}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-cyan-400/30 shadow-lg object-cover mb-4 md:mb-0 md:mr-6 bg-gradient-to-tr from-cyan-200 to-blue-200"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">{mockUser.name}</h2>
            <div className="text-lg text-cyan-300 mb-1">Full Stack Developer</div>
            <div className="flex items-center justify-center md:justify-start text-gray-300 mb-2">
              <FaMapMarkerAlt className="mr-1" />
              <span>{mockProfile.location}</span>
            </div>
            <div className="flex gap-3 justify-center md:justify-start mt-2">
              {mockSocials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110 hover:bg-white/10 p-2 rounded-full border border-white/20"
                  aria-label={s.name}
                >
                  {socialIconMap[s.icon]}
                </a>
              ))}
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-white/20 flex flex-col items-center">
            <span className="text-lg font-semibold text-cyan-400">{mockConnections.total}</span>
            <span className="text-xs text-gray-300">Connections</span>
            <span className="text-xs text-green-400">{mockConnections.mutual} mutual</span>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Left: Bio, Skills, Experience, Education */}
          <div className="space-y-4">
            {/* Bio (Collapsible) */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
              <button className="w-full flex justify-between items-center text-white" onClick={() => setShowBio((v) => !v)}>
                <span className="font-semibold text-lg">Bio</span>
                <span className="text-xl text-cyan-400">{showBio ? '−' : '+'}</span>
              </button>
              {showBio && (
                <p className="mt-2 text-gray-300">{mockProfile.bio}</p>
              )}
            </div>
            {/* Skills */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
              <div className="font-semibold text-lg mb-2 text-white">Skills</div>
              <div className="flex flex-wrap gap-2">
                {mockProfile.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 text-sm font-medium shadow-sm border border-cyan-400/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {/* Experience (Collapsible) */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
              <button className="w-full flex justify-between items-center text-white" onClick={() => setShowExperience((v) => !v)}>
                <span className="font-semibold text-lg">Work Experience</span>
                <span className="text-xl text-cyan-400">{showExperience ? '−' : '+'}</span>
              </button>
              {showExperience && (
                <ul className="mt-2 space-y-2">
                  {mockProfile.experience.map((exp) => (
                    <li key={exp.id} className="border-l-4 border-cyan-400/50 pl-3">
                      <div className="font-semibold text-white">{exp.title} <span className="text-xs text-gray-400">@ {exp.company}</span></div>
                      <div className="text-xs text-gray-400">{exp.start_date} - {exp.end_date}</div>
                      <div className="text-gray-300 text-sm">{exp.description}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Education (Collapsible) */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
              <button className="w-full flex justify-between items-center text-white" onClick={() => setShowEducation((v) => !v)}>
                <span className="font-semibold text-lg">Education</span>
                <span className="text-xl text-cyan-400">{showEducation ? '−' : '+'}</span>
              </button>
              {showEducation && (
                <ul className="mt-2 space-y-2">
                  {mockProfile.education.map((edu) => (
                    <li key={edu.id} className="border-l-4 border-blue-400/50 pl-3">
                      <div className="font-semibold text-white">{edu.degree} in {edu.field}</div>
                      <div className="text-xs text-gray-400">{edu.school} ({edu.start_date} - {edu.end_date})</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Right: Contact, Activity Timeline */}
          <div className="space-y-4">
            {/* Contact (Collapsible) */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
              <button className="w-full flex justify-between items-center text-white" onClick={() => setShowContact((v) => !v)}>
                <span className="font-semibold text-lg">Contact Info</span>
                <span className="text-xl text-cyan-400">{showContact ? '−' : '+'}</span>
              </button>
              {showContact && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-gray-300"><FaEnvelope /> jane.doe@example.com</div>
                  <div className="flex items-center gap-2 text-gray-300"><FaPhone /> (555) 123-4567</div>
                </div>
              )}
            </div>
            {/* Activity Timeline */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10">
              <div className="font-semibold text-lg mb-2 text-white">Recent Activity</div>
              <div className="flex flex-col gap-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded w-1/2"></div>
                    <div className="h-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded w-2/3"></div>
                  </div>
                ) : (
                  mockPosts.slice(0, visiblePosts).map((post) => (
                    <div key={post.id} className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-3 border border-white/20">
                      <div className="text-gray-200 font-medium">{post.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleString()}</div>
                      <div className="flex gap-3 text-xs text-gray-400 mt-2">
                        <span>👍 {post.likes}</span>
                        <span>💬 {post.comments.length} comments</span>
                      </div>
                    </div>
                  ))
                )}
                {!loading && visiblePosts < mockPosts.length && (
                  <button onClick={loadMorePosts} className="w-full py-2 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2">
                    Load More
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 