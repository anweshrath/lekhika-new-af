import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign,
  Download,
  Calendar,
  Globe
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { dbService } from '../../services/database'

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      const data = await dbService.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const revenueData = [
    { month: 'Jan', revenue: 15000, users: 120, books: 450 },
    { month: 'Feb', revenue: 18000, users: 150, books: 520 },
    { month: 'Mar', revenue: 22000, users: 180, books: 680 },
    { month: 'Apr', revenue: 25000, users: 220, books: 750 },
    { month: 'May', revenue: 28000, users: 280, books: 890 },
    { month: 'Jun', revenue: 32000, users: 320, books: 1020 }
  ]

  const userGrowthData = [
    { month: 'Jan', newUsers: 45, totalUsers: 120 },
    { month: 'Feb', newUsers: 30, totalUsers: 150 },
    { month: 'Mar', newUsers: 30, totalUsers: 180 },
    { month: 'Apr', newUsers: 40, totalUsers: 220 },
    { month: 'May', newUsers: 60, totalUsers: 280 },
    { month: 'Jun', newUsers: 40, totalUsers: 320 }
  ]

  const contentTypeData = [
    { name: 'eBooks', value: 45, color: '#3B82F6' },
    { name: 'Reports', value: 25, color: '#8B5CF6' },
    { name: 'Guides', value: 20, color: '#F59E0B' },
    { name: 'Whitepapers', value: 10, color: '#10B981' }
  ]

  const geographicData = [
    { country: 'United States', users: 120, percentage: 38 },
    { country: 'United Kingdom', users: 45, percentage: 14 },
    { country: 'Canada', users: 32, percentage: 10 },
    { country: 'Germany', users: 28, percentage: 9 },
    { country: 'Australia', users: 25, percentage: 8 },
    { country: 'Others', users: 70, percentage: 21 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Revenue', 
            value: '$125,000', 
            change: '+25%', 
            icon: DollarSign, 
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
          },
          { 
            label: 'Active Users', 
            value: '320', 
            change: '+12%', 
            icon: Users, 
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
          },
          { 
            label: 'Books Generated', 
            value: '1,020', 
            change: '+18%', 
            icon: BookOpen, 
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
          },
          { 
            label: 'Avg Quality Score', 
            value: '94%', 
            change: '+3%', 
            icon: TrendingUp, 
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {metric.change} from last period
                </p>
              </div>
              <div className={`p-3 rounded-xl ${metric.bgColor} ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Growth Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#F9FAFB', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#F9FAFB', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Content Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Content Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contentTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {contentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {contentTypeData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Geographic Distribution
          </h3>
          <div className="space-y-4">
            {geographicData.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {country.country}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {country.users} users
                  </span>
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {country.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          AI Agent Performance Metrics
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              name: 'Research Agent', 
              avgTime: '2.3 min',
              successRate: '98.5%',
              totalJobs: '1,250',
              color: 'text-blue-600',
              bgColor: 'bg-blue-100 dark:bg-blue-900/20'
            },
            { 
              name: 'Writer Agent', 
              avgTime: '4.7 min',
              successRate: '96.8%',
              totalJobs: '1,180',
              color: 'text-purple-600',
              bgColor: 'bg-purple-100 dark:bg-purple-900/20'
            },
            { 
              name: 'Editor Agent', 
              avgTime: '1.8 min',
              successRate: '99.2%',
              totalJobs: '1,120',
              color: 'text-green-600',
              bgColor: 'bg-green-100 dark:bg-green-900/20'
            }
          ].map((agent, index) => (
            <div key={index} className={`p-6 rounded-xl ${agent.bgColor}`}>
              <h4 className={`font-semibold ${agent.color} mb-4`}>
                {agent.name}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.avgTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className={`text-sm font-medium ${agent.color}`}>
                    {agent.successRate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.totalJobs}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminAnalytics
