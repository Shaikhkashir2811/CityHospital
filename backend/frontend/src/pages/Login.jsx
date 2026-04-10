import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Stethoscope } from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/navbar';
import api from '../api/api';

const Login = ({ setUser }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'DOCTOR'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  // ✅ Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit Handler
// ✅ Updated Submit Handler logic
const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (validate()) {
        setIsLoading(true);
        try {
            const endpoint = formData.role === 'ADMIN' ? '/api/admin/login' : '/api/doctor/login';
            const response = await api.post(endpoint, formData);

            // 1. Destructure everything the backend might send
            const { token, atoken, user, success, message } = response.data;

            if (success) {
                // 2. Use whichever token is available (Admin usually sends atoken)
                const finalToken = token || atoken;
                
                localStorage.setItem('token', finalToken);
                localStorage.setItem('atoken', finalToken);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);

                // 3. Navigation Logic
                if (formData.role === 'ADMIN' || (user && user.role === 'ADMIN')) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/doctor/dashboard');
                }
            } else {
                setServerError(message || "Login failed");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Invalid credentials";
            setServerError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }
};

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="flex min-h-screen pt-16">

        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-green-600 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000"
              className="w-full h-full object-cover"
              alt="Medical"
            />
          </div>

          <div className="relative z-10 text-white max-w-md">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl w-fit mb-8">
              <Stethoscope size={40} />
            </div>
            <h1 className="text-5xl font-black mb-6">
              Welcome to the Staff Portal.
            </h1>
            <p className="text-green-100 text-lg">
              Access dashboard, manage appointments, and collaborate in real-time.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
          <div className="w-full max-w-md">

            <div className="mb-10">
              <Link to="/" className="text-green-600 font-bold">
                ← Back to Website
              </Link>
              <h2 className="text-4xl font-black mt-4">Sign In</h2>
            </div>

            {/* Error */}
            {serverError && (
              <div className="mb-4 text-red-600 font-bold">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Role Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['DOCTOR', 'ADMIN'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`flex-1 p-2 rounded-xl ${formData.role === role
                        ? 'bg-white text-green-600'
                        : ''
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-xl"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 border rounded-xl"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
                {errors.password && (
                  <p className="text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white p-3 rounded-xl"
              >
                {isLoading ? "Loading..." : "Login"}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;