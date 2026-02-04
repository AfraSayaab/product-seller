"use client";

import React, { useState } from "react";

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Form submitted!");
  };

  return (
    <section className="relative flex justify-center px-4 py-20 bg-linear-to-br from-black via-gray-900 to-pink-950 rounded-3xl ">
      
      {/* Glow background */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/90 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-black">
            Let’s Talk
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Have something in mind? We’d love to hear from you.
          </p>
        </div>

        {/* Name */}
        <div className="group relative mb-8">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="peer w-full border-b border-gray-400 bg-transparent px-1 py-3 text-black placeholder-transparent outline-none focus:border-pink-500"
            placeholder="Your Name"
          />
          <label className="absolute left-1 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-sm peer-focus:text-pink-500">
            Your Name
          </label>
        </div>

        {/* Email */}
        <div className="group relative mb-8">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="peer w-full border-b border-gray-400 bg-transparent px-1 py-3 text-black placeholder-transparent outline-none focus:border-pink-500"
            placeholder="Email Address"
          />
          <label className="absolute left-1 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-sm peer-focus:text-pink-500">
            Email Address
          </label>
        </div>

        {/* Message */}
        <div className="group relative mb-12">
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="peer w-full resize-none border-b border-gray-400 bg-transparent px-1 py-3 text-black placeholder-transparent outline-none focus:border-pink-500"
            placeholder="Your Message"
          />
          <label className="absolute left-1 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-sm peer-focus:text-pink-500">
            Your Message
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="group relative w-full overflow-hidden rounded-full bg-black py-4 font-semibold text-white transition-all hover:scale-[1.02]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Send Message
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>

          {/* Button glow */}
          <div className="absolute inset-0 bg-linear-to-r from-pink-500  to-pink-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </form>
    </section>
  );
};

export default ContactForm;
