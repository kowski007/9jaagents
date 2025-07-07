import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Minus, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Banknote,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  DollarSign,
  Clock,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastEnhanced } from "@/hooks/useToastEnhanced";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/Layout";

const withdrawalSchema = z.object({
  amount: z.number().min(100, "Minimum withdrawal is ₦100"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  accountName: z.string().min(1, "Account name is required")
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

export default function SellerWalletPage() {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToastEnhanced();
  const queryClient = useQueryClient();
  const [showBalance, setShowBalance] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: isAuthenticated
  });

  // Fetch wallet transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    enabled: isAuthenticated
  });

  // Fetch withdrawal requests
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/wallet/withdrawals'],
    enabled: isAuthenticated
  });

  // Fetch seller orders for earnings overview
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/seller/orders'],
    enabled: isAuthenticated
  });

  // Withdrawal form
  const withdrawalForm = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      bankName: "",
      accountNumber: "",
      accountName: ""
    }
  });

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormData) => {
      const response = await apiRequest('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      showSuccess("Withdrawal Requested", "Your withdrawal request has been submitted for review");
      setIsWithdrawModalOpen(false);
      withdrawalForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/withdrawals'] });
    },
    onError: (error: any) => {
      showError("Withdrawal Failed", error.message || "Failed to process withdrawal");
    }
  });

  const handleWithdrawal = (data: WithdrawalFormData) => {
    withdrawalMutation.mutate(data);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(Number(amount));
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'commission':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate earnings overview
  const totalSales = transactions
    .filter((t: any) => t.type === 'sale' && t.status === 'success')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const pendingWithdrawals = withdrawals
    .filter((w: any) => w.status === 'pending')
    .reduce((sum: number, w: any) => sum + parseFloat(w.amount), 0);

  const completedWithdrawals = withdrawals
    .filter((w: any) => w.status === 'processed')
    .reduce((sum: number, w: any) => sum + parseFloat(w.amount), 0);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">Please log in to access your seller wallet.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your earnings and withdrawals</p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-green-600">
                    {showBalance ? formatCurrency(wallet?.balance || 0) : "••••••"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingWithdrawals)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Withdrawn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-600">{formatCurrency(completedWithdrawals)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6" />
              <span>Wallet Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Minus className="h-4 w-4" />
                    <span>Withdraw Funds</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Earnings</DialogTitle>
                  </DialogHeader>
                  <Form {...withdrawalForm}>
                    <form onSubmit={withdrawalForm.handleSubmit(handleWithdrawal)} className="space-y-4">
                      <FormField
                        control={withdrawalForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₦)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-gray-600">
                              Available: {formatCurrency(wallet?.balance || 0)}
                            </p>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawalForm.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawalForm.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawalForm.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={withdrawalMutation.isPending}
                      >
                        {withdrawalMutation.isPending ? "Processing..." : "Submit Withdrawal Request"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Statement</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Transactions and Withdrawals */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'sale' || transaction.type === 'commission'
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'sale' || transaction.type === 'commission' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : withdrawals.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No withdrawal requests</p>
                ) : (
                  <div className="space-y-4">
                    {withdrawals.map((withdrawal: any) => (
                      <div key={withdrawal.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Bank: {withdrawal.bankName}</p>
                          <p>Account: {withdrawal.accountNumber} - {withdrawal.accountName}</p>
                          <p>Requested: {new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                          {withdrawal.adminNotes && (
                            <p className="text-blue-600">Note: {withdrawal.adminNotes}</p>
                          )}
                          {withdrawal.processedAt && (
                            <p className="text-green-600">
                              Processed: {new Date(withdrawal.processedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}