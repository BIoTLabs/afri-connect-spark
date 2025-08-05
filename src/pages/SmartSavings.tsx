import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSavings } from '@/hooks/useSavings';
import { useKYC } from '@/hooks/useKYC';
import { 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Zap,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SmartSavings = () => {
  const { toast } = useToast();
  const { isKYCApproved } = useKYC();
  const { 
    loading, 
    accounts, 
    goals, 
    rules, 
    transactions, 
    createSavingsAccount, 
    createSavingsGoal, 
    createAutoSaveRule,
    makeDeposit,
    makeWithdrawal 
  } = useSavings();

  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const [newGoal, setNewGoal] = useState({
    savings_account_id: '',
    title: '',
    description: '',
    target_amount: '',
    target_date: ''
  });

  const [newRule, setNewRule] = useState({
    savings_account_id: '',
    rule_type: 'fixed_amount' as 'fixed_amount' | 'percentage' | 'round_up',
    amount: '',
    percentage: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    trigger_condition: ''
  });

  const [transactionData, setTransactionData] = useState({
    savings_account_id: '',
    amount: '',
    description: '',
    savings_goal_id: ''
  });

  if (!isKYCApproved()) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-warning/10 to-primary/10 border-warning/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">KYC Verification Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Complete your identity verification to access Smart Savings features.
              </p>
              <Button onClick={() => window.location.href = '/kyc'}>
                Complete Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalGoals = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
  const goalProgress = totalGoals > 0 ? (goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0) / totalGoals) * 100 : 0;

  const handleCreateAccount = async () => {
    await createSavingsAccount();
    setShowCreateAccount(false);
  };

  const handleCreateGoal = async () => {
    await createSavingsGoal({
      savings_account_id: newGoal.savings_account_id,
      title: newGoal.title,
      description: newGoal.description,
      target_amount: Number(newGoal.target_amount),
      target_date: newGoal.target_date || undefined
    });
    setNewGoal({ savings_account_id: '', title: '', description: '', target_amount: '', target_date: '' });
    setShowCreateGoal(false);
  };

  const handleCreateRule = async () => {
    await createAutoSaveRule({
      savings_account_id: newRule.savings_account_id,
      rule_type: newRule.rule_type,
      amount: newRule.rule_type === 'fixed_amount' ? Number(newRule.amount) : undefined,
      percentage: newRule.rule_type === 'percentage' ? Number(newRule.percentage) : undefined,
      frequency: newRule.frequency,
      trigger_condition: newRule.trigger_condition
    });
    setNewRule({ savings_account_id: '', rule_type: 'fixed_amount', amount: '', percentage: '', frequency: 'monthly', trigger_condition: '' });
    setShowCreateRule(false);
  };

  const handleDeposit = async () => {
    await makeDeposit(
      transactionData.savings_account_id,
      Number(transactionData.amount),
      transactionData.description,
      transactionData.savings_goal_id || undefined
    );
    setTransactionData({ savings_account_id: '', amount: '', description: '', savings_goal_id: '' });
    setShowDeposit(false);
  };

  const handleWithdraw = async () => {
    await makeWithdrawal(
      transactionData.savings_account_id,
      Number(transactionData.amount),
      transactionData.description
    );
    setTransactionData({ savings_account_id: '', amount: '', description: '', savings_goal_id: '' });
    setShowWithdraw(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Smart Savings</h1>
            <p className="text-muted-foreground">Grow your money with intelligent saving strategies</p>
          </div>
          {accounts.length === 0 && (
            <Dialog open={showCreateAccount} onOpenChange={setShowCreateAccount}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Savings Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Start your savings journey with a Smart Savings account earning 4.5% annual interest.
                  </p>
                  <Button onClick={handleCreateAccount} disabled={loading} className="w-full">
                    {loading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {accounts.length > 0 && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{totalBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{goalProgress.toFixed(1)}%</div>
                  <Progress value={goalProgress} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-warning/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.5%</div>
                  <p className="text-xs text-muted-foreground">Annual interest rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Accounts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My Accounts</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          Deposit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make Deposit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Account</Label>
                            <Select onValueChange={(value) => setTransactionData(prev => ({ ...prev, savings_account_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map(account => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.account_name} - {account.account_number}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Amount (₦)</Label>
                            <Input
                              type="number"
                              value={transactionData.amount}
                              onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Goal (Optional)</Label>
                            <Select onValueChange={(value) => setTransactionData(prev => ({ ...prev, savings_goal_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select goal" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No specific goal</SelectItem>
                                {goals.map(goal => (
                                  <SelectItem key={goal.id} value={goal.id}>
                                    {goal.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleDeposit} disabled={loading} className="w-full">
                            {loading ? 'Processing...' : 'Deposit'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowDownLeft className="w-4 h-4 mr-1" />
                          Withdraw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make Withdrawal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Account</Label>
                            <Select onValueChange={(value) => setTransactionData(prev => ({ ...prev, savings_account_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map(account => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.account_name} - ₦{Number(account.balance).toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Amount (₦)</Label>
                            <Input
                              type="number"
                              value={transactionData.amount}
                              onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                            />
                          </div>
                          <Button onClick={handleWithdraw} disabled={loading} className="w-full">
                            {loading ? 'Processing...' : 'Withdraw'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accounts.map(account => (
                    <div key={account.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{account.account_name}</p>
                        <p className="text-sm text-muted-foreground">{account.account_number}</p>
                        <Badge variant="outline" className="mt-1">
                          {account.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₦{Number(account.balance).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">4.5% APY</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Goals Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Savings Goals</CardTitle>
                  <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Savings Goal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Account</Label>
                          <Select onValueChange={(value) => setNewGoal(prev => ({ ...prev, savings_account_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.account_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Goal Title</Label>
                          <Input
                            value={newGoal.title}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Emergency Fund"
                          />
                        </div>
                        <div>
                          <Label>Target Amount (₦)</Label>
                          <Input
                            type="number"
                            value={newGoal.target_amount}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Target Date (Optional)</Label>
                          <Input
                            type="date"
                            value={newGoal.target_date}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleCreateGoal} disabled={loading} className="w-full">
                          {loading ? 'Creating...' : 'Create Goal'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No savings goals yet</p>
                    </div>
                  ) : (
                    goals.map(goal => {
                      const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                      return (
                        <div key={goal.id} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{goal.title}</h4>
                            <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                              {goal.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>₦{Number(goal.current_amount).toLocaleString()}</span>
                              <span>₦{Number(goal.target_amount).toLocaleString()}</span>
                            </div>
                            <Progress value={Math.min(progress, 100)} />
                            <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% complete</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Auto-Save Rules */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Auto-Save Rules</CardTitle>
                <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Zap className="w-4 h-4 mr-1" />
                      Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Auto-Save Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Account</Label>
                        <Select onValueChange={(value) => setNewRule(prev => ({ ...prev, savings_account_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.account_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Rule Type</Label>
                        <Select onValueChange={(value) => setNewRule(prev => ({ ...prev, rule_type: value as any }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rule type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="round_up">Round Up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newRule.rule_type === 'fixed_amount' && (
                        <div>
                          <Label>Amount (₦)</Label>
                          <Input
                            type="number"
                            value={newRule.amount}
                            onChange={(e) => setNewRule(prev => ({ ...prev, amount: e.target.value }))}
                          />
                        </div>
                      )}
                      {newRule.rule_type === 'percentage' && (
                        <div>
                          <Label>Percentage (%)</Label>
                          <Input
                            type="number"
                            value={newRule.percentage}
                            onChange={(e) => setNewRule(prev => ({ ...prev, percentage: e.target.value }))}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Frequency</Label>
                        <Select onValueChange={(value) => setNewRule(prev => ({ ...prev, frequency: value as any }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateRule} disabled={loading} className="w-full">
                        {loading ? 'Creating...' : 'Create Rule'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No auto-save rules configured</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rules.map(rule => (
                      <div key={rule.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{rule.rule_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {rule.rule_type === 'fixed_amount' && `₦${Number(rule.amount).toLocaleString()} ${rule.frequency}`}
                            {rule.rule_type === 'percentage' && `${rule.percentage}% ${rule.frequency}`}
                            {rule.rule_type === 'round_up' && `Round up transactions ${rule.frequency}`}
                          </p>
                        </div>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map(transaction => (
                      <div key={transaction.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === 'deposit' || transaction.transaction_type === 'auto_save' ? 'bg-success/20' : 
                            transaction.transaction_type === 'withdrawal' ? 'bg-destructive/20' : 'bg-primary/20'
                          }`}>
                            {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'auto_save' ? 
                              <ArrowUpRight className="w-4 h-4 text-success" /> :
                              transaction.transaction_type === 'withdrawal' ? 
                              <ArrowDownLeft className="w-4 h-4 text-destructive" /> :
                              <TrendingUp className="w-4 h-4 text-primary" />
                            }
                          </div>
                          <div>
                            <p className="font-medium capitalize">{transaction.transaction_type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.transaction_type === 'deposit' || transaction.transaction_type === 'auto_save' || transaction.transaction_type === 'interest' 
                              ? 'text-success' : 'text-destructive'
                          }`}>
                            {transaction.transaction_type === 'withdrawal' ? '-' : '+'}₦{Number(transaction.amount).toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {accounts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <PiggyBank className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Your Savings Journey</h3>
              <p className="text-muted-foreground mb-6">
                Create your first savings account and start earning 4.5% annual interest with intelligent auto-save features.
              </p>
              <Button onClick={() => setShowCreateAccount(true)} className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartSavings;