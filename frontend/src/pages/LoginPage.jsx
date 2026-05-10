import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Checkbox, message } from 'antd';
import { Pill, ShieldCheck, Headphones, Package, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginPage() {
  const loginWithAPI = useAuthStore((state) => state.loginWithAPI);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await loginWithAPI(data.email, data.password);
      if (result.success) {
        messageApi.success('Đăng nhập thành công!');
        setTimeout(() => navigate('/'), 500);
      } else {
        messageApi.error(result.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch {
      messageApi.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F9F9FF] font-sans selection:bg-[#0058BD]/10">
      {contextHolder}

      {/* Left Side - Brand & Visuals */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] relative overflow-hidden bg-[#D8E2FF] items-center justify-center p-12">
        {/* Decorative Blurs */}
        <div className="absolute top-[80px] left-[-80px] w-80 h-80 bg-white/20 rounded-full blur-[32px]" />
        <div className="absolute bottom-[80px] right-[-80px] w-96 h-96 bg-[#0058BD]/10 rounded-full blur-[32px]" />
        
        {/* Background Gradients from Figma */}
        <div className="absolute inset-0 opacity-100 pointer-events-none" style={{ 
          backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(204,221,255,1) 0%, rgba(204,221,255,0) 50%),
            radial-gradient(circle at 50% 0%, rgba(179,217,255,1) 0%, rgba(179,217,255,0) 50%),
            radial-gradient(circle at 100% 0%, rgba(204,238,255,1) 0%, rgba(204,238,255,0) 50%),
            radial-gradient(circle at 100% 100%, rgba(230,238,255,1) 0%, rgba(230,238,255,0) 50%),
            radial-gradient(circle at 0% 100%, rgba(204,225,255,1) 0%, rgba(204,225,255,0) 50%)
          `
        }} />

        <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
          {/* Logo Container */}
          <div className="mb-8">
            <div className="w-16 h-20 bg-white/80 backdrop-blur-[12px] border border-white/50 rounded-[32px] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <Pill className="text-[#0058BD]" size={36} />
            </div>
          </div>

          <h1 className="text-[#001A41] text-[56px] font-extrabold leading-[64px] tracking-[-1.68px] text-center mb-4">
            GPP Care
          </h1>
          
          <p className="text-[#004494] text-[18px] leading-[29.25px] text-center opacity-80 mb-12">
            Elevating your healthcare experience<br />
            through precision, empathy, and innovation.
          </p>

          {/* Floating Glass Cards */}
          <div className="space-y-6 w-full">
            <GlassCard 
              icon={<ShieldCheck className="text-[#006E2F]" size={20} />} 
              iconBg="bg-[#006E2F]/10"
              title="Certified GPP Pharmacy"
              subtitle="Globally recognized standards"
            />
            <GlassCard 
              icon={<Headphones className="text-[#0058BD]" size={20} />} 
              iconBg="bg-[#0058BD]/10"
              title="24/7 Pharmacist Support"
              subtitle="Expert care whenever you need it"
            />
            <GlassCard 
              icon={<Package className="text-[#964400]" size={20} />} 
              iconBg="bg-[#964400]/10"
              title="10,000+ Prescriptions Delivered"
              subtitle="Trusted by thousands across the nation"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F9F9FF]">
        <div className="w-full max-w-[520px]">
          {/* Login Card */}
          <div className="bg-white/75 backdrop-blur-[10px] border border-white/80 rounded-[32px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08),0_10px_15px_-5px_rgba(0,0,0,0.04)] p-[65px]">
            <div className="mb-12">
              <h2 className="text-[#191B23] text-[28px] font-semibold leading-[36px] mb-1">Sign In</h2>
              <p className="text-[#414754] text-[16px] leading-[24px]">Access your medical dashboard and history.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
              {/* Email */}
              <div className="space-y-3">
                <label className="block text-[#191B23] text-[16px] font-semibold px-1">Email Address</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: { value: EMAIL_REGEX, message: 'Invalid email address' },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="name@example.com"
                      className="!h-[60px] !rounded-[24px] !bg-white !border-[rgba(193,198,214,0.6)] hover:!border-[#0058BD] focus:!border-[#0058BD] focus:!shadow-none !px-[25px] !text-[16px] placeholder:!text-[rgba(114,119,133,0.5)] transition-all"
                      status={errors.email ? 'error' : ''}
                    />
                  )}
                />
                {errors.email && <p className="text-[#DC2626] text-xs px-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[#191B23] text-[16px] font-semibold">Password</label>
                  <a href="#" className="text-[#0058BD] text-[16px] hover:underline transition-all">Forgot password?</a>
                </div>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      size="large"
                      placeholder="Enter your password"
                      iconRender={(visible) => (visible ? <Eye size={18} className="text-[#727785]" /> : <EyeOff size={18} className="text-[#727785]" />)}
                      className="!h-[60px] !rounded-[24px] !bg-white !border-[rgba(193,198,214,0.6)] hover:!border-[#0058BD] focus:!border-[#0058BD] focus:!shadow-none !px-[25px] !text-[16px] placeholder:!text-[rgba(114,119,133,0.5)] transition-all"
                      status={errors.password ? 'error' : ''}
                    />
                  )}
                />
                {errors.password && <p className="text-[#DC2626] text-xs px-1">{errors.password.message}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center px-1">
                <Controller
                  name="remember"
                  control={control}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Checkbox
                      {...rest}
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      className="text-[#414754] text-[15px]"
                    >
                      Keep me signed in
                    </Checkbox>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<ArrowRight size={18} className="mt-0.5" />}
                iconPosition="end"
                className="!h-[60px] !rounded-[24px] !text-[16px] !font-semibold !border-none shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #0058BD 0%, #0C70EA 100%)',
                }}
              >
                Sign in to Dashboard
              </Button>
            </form>

            <div className="mt-[41px] pt-[41px] border-t border-[rgba(193,198,214,0.2)] text-center">
              <p className="text-[#414754] text-[16px]">
                Don't have an account?{' '}
                <a href="#" className="text-[#0058BD] font-semibold hover:underline">Create Account</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function GlassCard({ icon, iconBg, title, subtitle }) {
  return (
    <div className="backdrop-blur-[10px] bg-white/75 border border-white/40 rounded-[24px] p-[25px] flex items-center gap-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08),0_10px_15px_-5px_rgba(0,0,0,0.04)] relative">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[#191B23] text-[16px] font-semibold leading-[24px]">{title}</h4>
        <p className="text-[#414754] text-[12px] leading-[18px]">{subtitle}</p>
      </div>
    </div>
  );
}
