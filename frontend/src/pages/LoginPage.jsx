import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Checkbox, Typography, message, Divider } from 'antd';
import { Lock, Mail, Pill } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

const { Title, Text } = Typography;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
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
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call — replace with real endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      login(
        { email: data.email, name: 'Dược sĩ Admin' },
        'mock-jwt-token'
      );

      messageApi.success('Đăng nhập thành công!');
    } catch {
      messageApi.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      {contextHolder}
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
              <Pill size={32} className="text-white" />
            </div>
            <Title level={3} className="!mb-1">
              GPP Manager
            </Title>
            <Text type="secondary">
              Hệ thống quản lý Nhà thuốc GPP
            </Text>
          </div>

          <Divider className="!mt-0 !mb-6" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: EMAIL_REGEX,
                    message: 'Email không hợp lệ',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder="admin@pharmacy.vn"
                    prefix={<Mail size={18} className="text-gray-400" />}
                    status={errors.email ? 'error' : ''}
                    autoComplete="email"
                  />
                )}
              />
              {errors.email && (
                <Text type="danger" className="text-xs mt-1 block">
                  {errors.email.message}
                </Text>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu tối thiểu 6 ký tự',
                  },
                }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder="Nhập mật khẩu"
                    prefix={<Lock size={18} className="text-gray-400" />}
                    status={errors.password ? 'error' : ''}
                    autoComplete="current-password"
                  />
                )}
              />
              {errors.password && (
                <Text type="danger" className="text-xs mt-1 block">
                  {errors.password.message}
                </Text>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between mb-6">
              <Controller
                name="remember"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox
                    {...rest}
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  >
                    Ghi nhớ đăng nhập
                  </Checkbox>
                )}
              />
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={(e) => e.preventDefault()}
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="!h-11 !rounded-lg !font-medium"
            >
              Đăng nhập
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <Text type="secondary" className="text-xs">
              &copy; {new Date().getFullYear()} GPP Manager. Hệ thống quản lý nhà thuốc.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
