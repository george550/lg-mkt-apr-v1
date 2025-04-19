import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

interface EarningsData {
  totalEarnings: number;
  recentEarnings: { date: string; amount: number }[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="text-sm text-gray-600">{format(parseISO(label), "MMM d, yyyy")}</p>
        <p className="text-sm font-bold text-primary">
          ${payload[0].value?.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
};

export default function SellerEarnings() {
  const { user } = useAuth();

  const { data: earnings, isLoading, error } = useQuery<EarningsData>({
    queryKey: ["/api/dashboard/seller/earnings"],
    enabled: !!user,
  });

  // Generate dates for the last 30 days for a complete chart
  const generateEmptyData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i).toISOString().split("T")[0];
      data.push({ date, amount: 0 });
    }
    return data;
  };

  // Merge existing earnings data with empty data to fill gaps
  const chartData = () => {
    if (!earnings || !earnings.recentEarnings) return generateEmptyData();
    
    const emptyData = generateEmptyData();
    const earningsMap = new Map(
      earnings.recentEarnings.map((item) => [item.date, item.amount])
    );
    
    return emptyData.map((item) => ({
      ...item,
      amount: (earningsMap.get(item.date) || 0) / 100, // Convert cents to dollars
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading earnings data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((earnings?.totalEarnings || 0) / 100).toFixed(2)}
            </div>
            <CardDescription>Lifetime earnings</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${calculateMonthlyEarnings(earnings?.recentEarnings || [])}
            </div>
            <CardDescription>Current month earnings</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Available for Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((earnings?.totalEarnings || 0) / 100).toFixed(2)}
            </div>
            <CardDescription>Ready to withdraw</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
          <CardDescription>Your earnings for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            {earnings ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData()}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), "MMM d")}
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">No earnings data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Manage your payout settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Connect a payment method to receive earnings from your sales.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium">
              Connect Payment Method
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to calculate monthly earnings
function calculateMonthlyEarnings(earnings: { date: string; amount: number }[]): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyTotal = earnings.reduce((total, earning) => {
    const earningDate = new Date(earning.date);
    if (
      earningDate.getMonth() === currentMonth &&
      earningDate.getFullYear() === currentYear
    ) {
      return total + earning.amount;
    }
    return total;
  }, 0);
  
  return (monthlyTotal / 100).toFixed(2);
}
