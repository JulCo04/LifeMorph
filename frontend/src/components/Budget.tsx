import React, { useState, useEffect } from 'react';

interface BudgetProps {
    userId: number;
}

const Budget: React.FC<BudgetProps> = ({ userId }) => {
    const [incomeTable, setIncomeTable] = useState<any[]>([]);
    const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
    const [variableExpenses, setVariableExpenses] = useState<any[]>([]);
    const [budgetSummary, setBudgetSummary] = useState<any[]>([]);
    const [totalBudgetIncome, setTotalBudgetIncome] = useState<string>('0.00');
    const [totalActualIncome, setTotalActualIncome] = useState<string>('0.00');
    const [totalBudgetFixedExpense, setTotalBudgetFixedExpense] = useState<string>('0.00');
    const [totalActualFixedExpense, setTotalActualFixedExpense] = useState<string>('0.00');
    const [totalBudgetVariableExpense, setTotalBudgetVariableExpense] = useState<string>('0.00');
    const [totalActualVariableExpense, setTotalActualVariableExpense] = useState<string>('0.00');
    const [totalBudgetExpense, setTotalBudgetExpense] = useState<string>('0.00');
    const [totalActualExpense, setTotalActualExpense] = useState<string>('0.00');
    const [netBudgetProfit, setNetBudgetProfit] = useState<string>('0.00');
    const [netActualProfit, setNetActualProfit] = useState<string>('0.00');

    function buildPath(route: string) {
        if (process.env.NODE_ENV === "production") {
          return 'https://' + process.env.REACT_APP_PROD_API_ENVIRONMENT + '/' + route;
        } else {
          return  "http://localhost:3001/" + route;
        }
    }

    const fetchIncomeTable = async () => {
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-income-table/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setIncomeTable(result.data);
            } else {
                console.error('Failed to fetch income table data');
            }
        } catch (error: any) {
            console.error('Error fetching income table data:', error.message);
        }
    };

    const fetchFixedExpenses = async () => {
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-fixed-expenses/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setFixedExpenses(result.data);
            } else {
                console.error('Failed to fetch fixed expenses data');
            }
        } catch (error: any) {
            console.error('Error fetching fixed expenses data:', error.message);
        }
    };

    const fetchVariableExpenses = async () => {
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-variable-expenses/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setVariableExpenses(result.data);
            } else {
                console.error('Failed to fetch variable expenses data');
            }
        } catch (error: any) {
            console.error('Error fetching variable expenses data:', error.message);
        }
    };

    const fetchBudgetSummary = async () => {
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-budget-summary/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setBudgetSummary(result.data);
                const summary = result.data[0];
                setTotalBudgetIncome(summary.totalBudgetIncome);
                setTotalActualIncome(summary.totalActualIncome);
                setTotalBudgetFixedExpense(summary.totalBudgetFixedExpense);
                setTotalActualFixedExpense(summary.totalActualFixedExpense);
                setTotalBudgetVariableExpense(summary.totalBudgetVariableExpense);
                setTotalActualVariableExpense(summary.totalActualVariableExpense);
                setTotalBudgetExpense(summary.totalBudgetExpense);
                setTotalActualExpense(summary.totalActualExpense);
                setNetBudgetProfit(summary.netBudgetProfit);
                setNetActualProfit(summary.netActualProfit);
            } else {
                console.error('Failed to fetch budget summary table');
            }
        } catch (error: any) {
            console.error('Error fetching budget summary table:', error.message);
        }
    };

    const updateBudgetIncome = async (index: number) => {
        if (userId === null) return;

        try {
            const income = incomeTable[index];
            const response = await fetch(buildPath('api/update-budget-income-table'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    budgetIncome: income.budgetIncome,
                    categoryName: income.categoryName,
                    userId,
                }),
            });

            if (response.ok) {
                console.log('Successfully updated budget income');
            } else {
                console.error('Failed to update budget income');
            }
        } catch (error: any) {
            console.error('Error updating budget income:', error.message);
        }
    };

    const updateBudgetFixedExpenses = async (index: number) => {
        if (userId === null) return;

        try {
            const expense = fixedExpenses[index];
            const response = await fetch(buildPath('api/update-budget-fixed-table'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    budgetExpense: expense.budgetExpense,
                    categoryId: expense.categoryId,
                    userId,
                }),
            });

            if (response.ok) {
                console.log('Successfully updated budget fixed expense');
            } else {
                console.error('Failed to update budget fixed expense');
            }
        } catch (error: any) {
            console.error('Error updating budget fixed expense:', error.message);
        }

    };

    const updateBudgetVariableExpenses = async (index: number) => {
        if (userId === null) return;

        try {
            const expense = variableExpenses[index];
            const response = await fetch(buildPath('api/update-budget-variable-table'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    budgetExpense: expense.budgetExpense,
                    categoryId: expense.categoryId,
                    userId,
                }),
            });

            if (response.ok) {
                console.log('Successfully updated budget fixed expense');
            } else {
                console.error('Failed to update budget fixed expense');
            }
        } catch (error: any) {
            console.error('Error updating budget fixed expense:', error.message);
        }
    };

    useEffect(() => {
        if (userId !== null) {
            fetchIncomeTable();
            fetchFixedExpenses();
            fetchVariableExpenses();
            fetchBudgetSummary();
        }
    }, []);

    const handleBudgetChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number, type: string) => {
        const value = event.target.value;

        if (type === 'income') {
            console.log("Handling Income Change");
            const updatedIncomeTable = [...incomeTable];
            updatedIncomeTable[index].budgetIncome = value;
            await updateBudgetIncome(index);
        } else if (type === 'fixed') {
            const updatedFixedExpenses = [...fixedExpenses];
            updatedFixedExpenses[index].budgetExpense = value;
            await updateBudgetFixedExpenses(index);

        } else if (type === 'variable') {
            const updatedVariableExpenses = [...variableExpenses];
            updatedVariableExpenses[index].budgetExpense = value;
            await updateBudgetVariableExpenses(index);
        }

        await fetchBudgetSummary();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">Budget Planner</h1>
            <div className="flex gap-8 rounded-md">
                {/* Income Section */}
                <div className='flex flex-col h-[75vh] rounded-br-md'>
                    <h2 className="text-xl font-semibold mb-4">Income</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-green-400 text-gray-600 uppercase text-sm">
                                <th className="text-black py-3 px-6 text-left">Category</th>
                                <th className="text-black py-3 px-6 text-center">Budget</th>
                                <th className="text-black py-3 px-6 text-right">Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomeTable.map((income, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-3 px-6 text-left">{income.categoryName}</td>
                                    <td className="py-3 px-6 text-right">
                                        <input
                                            type="number"
                                            value={income.budgetIncome}
                                            onChange={(event) => handleBudgetChange(event, index, 'income')}
                                            className="border rounded px-2 py-1 text-right w-32"
                                            min="0"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="py-3 px-6 text-right">{income.actualIncome}</td>
                                </tr>
                            ))}
                            <tr className="border-b">
                                <td className="py-3 px-6 text-left">Total Income</td>
                                <td className="py-3 px-6 text-right">{totalBudgetIncome}</td>
                                <td className="py-3 px-6 text-right">{totalActualIncome}</td>
                            </tr>
                        </tbody>
                    </table>
                    {/* Net Profit Section */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Net Profit</h2>
                        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-green-400 text-gray-600 uppercase text-sm">
                                    <th className="text-black py-3 px-6 text-left">Category</th>
                                    <th className="text-black py-3 px-6 text-right">Budget</th>
                                    <th className="text-black py-3 px-6 text-right">Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-3 px-6 text-left">Net Budget Profit</td>
                                    <td className="py-3 px-6 text-right">{netBudgetProfit}</td>
                                    <td className="py-3 px-6 text-right">{netActualProfit}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fixed Expenses Section */}
                <div className='flex flex-col h-[75vh] rounded-md'>
                    <h2 className="text-xl font-semibold mb-4">Fixed Expenses</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-green-400 text-gray-600 uppercase text-sm">
                                <th className="text-black py-3 px-6 text-left w-24">Category</th>
                                <th className="text-black py-3 px-6 text-center w-24">Budget</th>
                                <th className="text-black py-3 px-6 text-right w-24">Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fixedExpenses.map((expense, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-3 px-6 text-left w-24">{expense.categoryName}</td>
                                    <td className="py-3 px-6 text-right">
                                        <input
                                            type="number"
                                            value={expense.budgetExpense}
                                            onChange={(event) => handleBudgetChange(event, index, 'fixed')}
                                            className="border rounded px-2 py-1 text-right w-32"
                                            min="0"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="py-3 px-6 text-right">{expense.actualExpense}</td>
                                </tr>
                            ))}
                            <tr className="border-b">
                                <td className="py-3 px-6 text-left">Total Fixed Expenses</td>
                                <td className="py-3 px-6 text-right">{totalBudgetFixedExpense}</td>
                                <td className="py-3 px-6 text-right">{totalActualFixedExpense}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Variable Expenses Section */}
                <div className='flex flex-col h-[75vh] rounded-md'>
                    <h2 className="text-xl font-semibold mb-4">Variable Expenses</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-green-400 text-gray-600 uppercase text-sm">
                                <th className="text-black py-3 px-6 text-left">Category</th>
                                <th className="text-black py-3 px-6 text-center">Budget</th>
                                <th className="text-black py-3 px-6 text-right">Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variableExpenses.map((expense, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-3 px-6 text-left">{expense.categoryName}</td>
                                    <td className="py-3 px-6 text-right">
                                        <input
                                            type="number"
                                            value={expense.budgetExpense}
                                            onChange={(event) => handleBudgetChange(event, index, 'variable')}
                                            className="border rounded px-2 py-1 text-right w-32"
                                            min="0"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="py-3 px-6 text-right">{expense.actualExpense}</td>
                                </tr>
                            ))}
                            <tr className="border-b">
                                <td className="py-3 px-6 text-left">Total Variable Expenses</td>
                                <td className="py-3 px-6 text-right">{totalBudgetVariableExpense}</td>
                                <td className="py-3 px-6 text-right">{totalActualVariableExpense}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Budget;
