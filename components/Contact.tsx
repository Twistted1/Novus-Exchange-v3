import React from 'react';
import { motion } from 'framer-motion';
import SocialLinks from './layout/SocialLinks';

const Contact: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tight flex items-center justify-center gap-3">
          CONTACT <span className="text-[#e62e2e]">US</span>
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed uppercase tracking-[0.2em] font-bold">
          Connect with our research team.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6"
      >
        {/* Left Card: Get in touch */}
        <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-[#0f0f0f] hover:border-[#e62e2e]/30 hover:shadow-[0_20px_50px_rgba(230,46,46,0.1)] transition-all duration-500 flex flex-col group">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">Get in touch</h3>
          <p className="text-gray-400 text-sm mb-6">We value your feedback and inquiries.</p>
          
          <form action="https://formspree.io/f/xnngvoyw" method="POST" className="space-y-4 flex flex-col flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-cyan-400 uppercase tracking-widest">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Name"
                  required 
                  className="w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-500" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-cyan-400 uppercase tracking-widest">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email"
                  required 
                  className="w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-500" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5 flex flex-col flex-grow">
              <label className="text-xs font-black text-cyan-400 uppercase tracking-widest">Message</label>
              <textarea 
                name="message" 
                rows={4} 
                placeholder="How can we help?"
                required 
                className="w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-500 resize-none flex-grow"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#e62e2e] hover:bg-red-700 text-white font-black py-3 px-6 rounded-lg transition-all duration-300 uppercase tracking-[0.2em] text-xs shadow-[0_0_15px_rgba(230,46,46,0.15)] mt-auto"
            >
              SEND MESSAGE
            </button>
          </form>
        </motion.div>

        {/* Right Column: Newsletter & Follow */}
        <div className="flex flex-col gap-6">
          {/* Newsletter Card */}
          <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-[#0f0f0f] hover:border-[#e62e2e]/30 hover:shadow-[0_20px_50px_rgba(230,46,46,0.1)] transition-all duration-500 group">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 text-sm mb-6">Stay ahead of the curve with our latest articles.</p>
            
            <form action="https://formspree.io/f/mdkwzpjv" method="POST" className="space-y-3">
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="your.email@example.com"
                className="w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-500"
              />
              <button 
                type="submit" 
                className="w-full bg-[#e62e2e] hover:bg-red-700 text-white font-black py-3 px-6 rounded-lg transition-all duration-300 uppercase tracking-[0.2em] text-xs"
              >
                SUBSCRIBE
              </button>
            </form>
          </motion.div>

          {/* Follow Us Card */}
          <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-[#0f0f0f] hover:border-[#e62e2e]/30 hover:shadow-[0_20px_50px_rgba(230,46,46,0.1)] transition-all duration-500 flex flex-col items-center justify-center flex-grow group">
            <h3 className="text-lg font-bold text-white mb-6">Follow Us</h3>
            <SocialLinks />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;