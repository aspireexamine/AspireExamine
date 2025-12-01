import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../Button';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - Replace with actual API endpoint when available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the data to your backend
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      
      console.log('Form submitted:', formData);
      
      // Show success message
      toast.success('Message sent successfully! We\'ll get back to you soon.', {
        duration: 4000,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      
    } catch (error) {
      toast.error('Failed to send message. Please try again or email us directly at support@epplicon.net', {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      value: "support@epplicon.net",
      link: "mailto:support@epplicon.net"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      value: "Available 9 AM - 6 PM IST"
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us for immediate assistance",
      value: "Contact via email"
    },
    {
      icon: MapPin,
      title: "Address",
      description: "Visit us at our office",
      value: "J&K"
    }
  ];

  return (
    <div className="min-h-screen bg-cream pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-extrabold text-pastel-dark mb-3 sm:mb-4">
            Get In Touch
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-soft border border-gray-100"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pastel-lilac rounded-full flex items-center justify-center flex-shrink-0">
                    <method.icon className="text-pastel-purple" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-pastel-dark mb-1 text-sm sm:text-base">{method.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{method.description}</p>
                    {method.link ? (
                      <a 
                        href={method.link}
                        className="text-xs sm:text-sm font-medium text-pastel-purple hover:underline break-all"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <p className="text-xs sm:text-sm font-medium text-pastel-purple">{method.value}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 shadow-soft border border-gray-100"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="mx-auto mb-4 text-pastel-green" size={64} />
                <h2 className="text-2xl font-heading font-bold text-pastel-dark mb-2">Message Sent!</h2>
                <p className="text-gray-600 mb-6">Thank you for contacting us. We'll get back to you soon.</p>
                <Button 
                  variant="secondary" 
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm sm:text-base !py-2.5 sm:!py-3"
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-pastel-dark mb-4 sm:mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-pastel-dark mb-1 sm:mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-pastel-purple focus:outline-none bg-cream text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-pastel-dark mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-pastel-purple focus:outline-none bg-cream text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-pastel-dark mb-1 sm:mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-pastel-purple focus:outline-none bg-cream text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-pastel-dark mb-1 sm:mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      rows={5}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-pastel-purple focus:outline-none bg-cream resize-none text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={16} />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
