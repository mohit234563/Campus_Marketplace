import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-gray-200' });

  // Regex Patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRules = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*]/.test(formData.password),
  };

  // Password Strength Logic
  useEffect(() => {
    const password = formData.password;
    let score = 0;
    if (password.length > 0) {
      if (passwordRules.length) score++;
      if (passwordRules.hasUpper) score++;
      if (passwordRules.hasNumber) score++;
      if (passwordRules.hasSpecial) score++;
    }

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    setStrength({ score, label: labels[score], color: colors[score] });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500">Join us and start your journey</p>
        </div>

        <form className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="username"
                type="text"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="johndoe123"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 outline-none transition-all ${
                  formData.email && !emailRegex.test(formData.email) ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-500'
                }`}
                placeholder="name@company.com"
                onChange={handleChange}
              />
            </div>
            {formData.email && !emailRegex.test(formData.email) && (
              <p className="text-xs text-red-500 mt-1 ml-1">Please enter a valid email address.</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Strength: {strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${strength.color}`} 
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                ></div>
              </div>
              
              {/* Validation Checklist */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <ValidationItem label="8+ Characters" met={passwordRules.length} />
                <ValidationItem label="Uppercase" met={passwordRules.hasUpper} />
                <ValidationItem label="Number" met={passwordRules.hasNumber} />
                <ValidationItem label="Special (@#$)" met={passwordRules.hasSpecial} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={strength.score < 3 || !emailRegex.test(formData.email)}
            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Account
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            {/* <a href="#" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Sign In
            </a> */}
            <Link 
              to="/login" 
              className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
              Sign In
              </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Checklist
const ValidationItem = ({ label, met }) => (
  <div className="flex items-center space-x-2">
    {met ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-300" />}
    <span className={`text-[10px] ${met ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
  </div>
);

export default SignupForm;