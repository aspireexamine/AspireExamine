import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AnalyticsData } from '@/types';
import { TrendingUp, Users, FileText, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsProps {
  data: AnalyticsData;
}

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function Analytics({ data }: AnalyticsProps) {
  const pieData = data.subjectPerformance.map((item, index) => ({
    name: item.subject,
    value: item.avgScore,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Comprehensive insights into platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Students', value: data.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Total Papers', value: data.totalPapers.toString(), icon: FileText, color: 'text-purple-600' },
          { label: 'Test Attempts', value: data.totalAttempts.toLocaleString(), icon: Target, color: 'text-green-600' },
          { label: 'Average Score', value: `${data.averageScore}%`, icon: Trophy, color: 'text-orange-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className="border-2 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                  <metric.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Attempts Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-xl">Monthly Test Attempts</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track exam activity over time</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 sm:pt-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.monthlyAttempts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="attempts" fill="#7C3AED" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-xl">Subject Performance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 sm:pt-0">
              <div className="space-y-4">
                {data.subjectPerformance.map((subject, index) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{subject.subject}</span>
                      <span className="font-semibold">{subject.avgScore}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.avgScore}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-xl">Top Performers This Month</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Students with highest scores</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 sm:pt-0">
            <div className="space-y-4">
              {data.topPerformers.map((performer, index) => (
                <motion.div
                  key={performer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{performer.name}</p>
                      <p className="text-xs text-muted-foreground">Top scorer</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold text-sm sm:text-lg px-2 sm:px-3 py-1">
                    {performer.score}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}