import React from 'react';
import { TiDeleteOutline } from "react-icons/ti";
import { useState, useEffect } from 'react';


interface CashFlowTrackerProps {
    userId: number;
}

const CashFlowTracker: React.FC<CashFlowTrackerProps> = ({ userId }) => {
    
    const [rows, setRows] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [sums, setSums] = useState<any[]>([]);
    const [userTotal, setUserTotal] = useState<number | null>(null);
    const [income, setIncome] = useState<number | null>(null);
    const [expense, setExpense] = useState<number | null>(null);
    const [fixed, setFixed] = useState<number | null>(null);
    const [variable, setVariable] = useState<number | null>(null);
    const [categoryInputValue, setCategoryInputValue] = useState('');
    const [categoryIsValid, setCategoryIsValid] = useState(true);

    const termOptions = {
        0: 'Variable',
        1: 'Fixed'
    };

    const flowOptions = {
        0: 'Expense',
        1: 'Income'
    };

    function buildPath(route: string) {
        if (process.env.NODE_ENV === "production") {
          return process.env.REACT_APP_PROD_API_ENVIRONMENT + route;
        } else {
          return  "http://localhost:3001/" + route;
        }
    }

    const fetchRows = async () => {
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-rows/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setRows(result.data);
            } else {
                console.error('Failed to fetch Rows data');
            }
        } catch (error: any) {
            console.error('Error fetching Rows data:', error.message);
        }
    };

    const fetchCategories = async () => {
        console.log(`Fetching categories: ${userId}`);
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-categories/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setCategories(result.data); // Update state with categories data
            } else {
                console.error('Failed to fetch categories data');
            }
        } catch (error: any) {
            console.error('Error fetching categories data:', error.message);
        }
    };

    const fetchSums = async () => {
        if (userId === null) return;

        try {
            const response = await fetch(buildPath(`api/finance-sums/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setSums(result.data); // Update state with categories data
                // Extract user total
                const userTotalSum = result.data.find((sum: any) => sum.name === 'UserTotal');
                setUserTotal(userTotalSum ? parseFloat(userTotalSum.total) : null);

                const incomeSum = result.data.find((sum: any) => sum.name === 'Income');
                setIncome(incomeSum ? parseFloat(incomeSum.total) : null);

                const expenseSum = result.data.find((sum: any) => sum.name === 'Expense');
                setExpense(expenseSum ? parseFloat(expenseSum.total) : null);

                const fixedSum = result.data.find((sum: any) => sum.name === 'Fixed');
                setFixed(fixedSum ? parseFloat(fixedSum.total) : null);

                const variableSum = result.data.find((sum: any) => sum.name === 'Variable');
                setVariable(variableSum ? parseFloat(variableSum.total) : null);
                
            } else {
                console.error('Failed to fetch categories data');
            }
        } catch (error: any) {
            console.error('Error fetching categories data:', error.message);
        }
    };

    const updateRow = async (row: any) => {
        try {
            const { name, categoryId, term, date, flow, total, rowId, userId } = row;
            console.log(row);
            const response = await fetch(buildPath('api/update-tracking-row'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, categoryId, term, date, flow, total, rowId, userId }),
            });

            if (!response.ok) {
                console.error('Failed to update tracking Row');
            }
        } catch (error: any) {
            console.error('Error updating tracking Row:', error.message);
        }

        // Update Totals
        await fetchCategories();
        await fetchSums();
        console.log("Row Updated");

    };

    const handleInputChange = async (rowId: any, field: any, value: any) => {
        setRows((prevRows: any) =>
            prevRows.map((row: any) =>
                row.rowId === rowId ? { ...row, [field]: value } : row
            )
        );

        const updatedRow = rows.find((row) => row.rowId === rowId);
        const updatedData = { ...updatedRow, [field]: value };
        await updateRow(updatedData);

    };

    const handleRowCategoryInputChange = async (rowId: any, categoryId: number, term: number) => {
        setRows((prevRows: any) =>
            prevRows.map((row: any) =>
                row.rowId === rowId ? { ...row, ['categoryId']: categoryId, ['term']: term } : row
            )
        );

        const updatedRow = rows.find((row) => row.rowId === rowId);
        const updatedData = { ...updatedRow, ['categoryId']: categoryId, ['term']: term };
        await updateRow(updatedData);

    };

    const getCategoryDetails = (categoryId: any) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? { name: category.name, total: category.total } : { name: 'Unknown Category', total: 0 };
    };

    const addTrackingNewRow = async () => {
        if (userId === null) return;

        const todaysDate = new Date()
        const offset = todaysDate.getTimezoneOffset()
        const formattedTodaysDate = new Date(todaysDate.getTime() - (offset*60*1000)).toISOString().split('T')[0]

        const wageCategory = categories.find(category => category.name === 'Wage');
        const wageId = wageCategory ? wageCategory.categoryId : null;

        const newRow = {
            name: '',
            categoryId: wageId,
            term: 1,
            date: formattedTodaysDate ,
            flow: 1, // At 1 because wage is the first category
            total: 0,
            userId: userId,
        };

        try {
            const response = await fetch(buildPath('api/insert-tracking-row'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRow),
            });

            if (!response.ok) {
                console.error('Failed to add tracking Row');
            }
        } catch (error: any) {
            console.error('Error adding tracking Row:', error.message);
        }
    };

    const handleTrackingRowInsert = async () => {
        await addTrackingNewRow();
        await fetchRows();
    };

    const deleteTrackingRow = async (rowId: any) => {
        try {
          const response = await fetch(buildPath('api/delete-tracking-row'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rowId }),
          });
      
          if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
          }
      
          const data = await response.json();
          await fetchRows();
        } catch (error) {
          console.error('Error deleting tracking row:', error);
        }
    };

    const handleTrackingRowDelete = async (rowId: any) => {
        await deleteTrackingRow(rowId);
        await fetchRows();
        await fetchSums();
        await fetchCategories();
    };

    const deleteCategory = async (categoryId: any, userId: any) => {
        try {
            // Make API request to delete the category
            const response = await fetch(buildPath('api/delete-category'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryId, userId }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete category');
            }
    
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleDeleteCategory = async (categoryId: any, userId: any) => {
        await deleteCategory(categoryId, userId);
        await fetchCategories();
        await fetchRows();
    };

    const handleCategoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryInputValue(event.target.value);
        // Validate input length on change
        setCategoryIsValid(event.target.value.length > 0);
      };
    
    const handleAddCategory = async () => {
        if (categoryInputValue.trim().length === 0) {
            // If input is empty, set the border to red
            setCategoryIsValid(false);
            return;
        }

        try {
            // Proceed with adding the category
            const response = await fetch(buildPath('api/insert-category'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
            },
                body: JSON.stringify({
                    name: categoryInputValue,
                    userId: userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error adding category');
            }
            fetchCategories();
            const data = await response.json();
            // Clear the input after adding the category
            setCategoryInputValue('');
            setCategoryIsValid(true); // Reset validity
        } catch (error) {
            console.error('Error ad+ding category:', error);
        }
    };


    useEffect(() => {
        // Fetch user data from local storage
        if (userId !== null) {
            fetchRows();
            fetchCategories();
            fetchSums();
        }

    }, []);


    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Cash Flow Tracker</h1>
            <div className='flex gap-8 rounded-md'>
                {/* Statistics and Categories Section */}
                <div className='flex flex-col h-[75vh] rounded-br-md pb-5 gap-4'>
                    {/* Statistics */}
                    <div className='flex flex-col w-96 shadow-md'>
                        <span className='bg-green-400 text-center font-bold text-lg rounded-t-md'>Metrics</span>
                        <div className='flex flex-col p-5 rounded-b-md bg-slate-100'>
                            <div className='mb-2 text-2xl flex flex-col justify-center items-center text-center'>
                                <span className='font-semibold'>Total</span>
                                <span className='border-2 px-9 rounded-md'>
                                    ${userTotal !== null ? userTotal.toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className='mb-2 text-xl flex justify-between w-full px-4 border-b border-gray-300'>
                                <span className='font-semibold text-green-600 w-24'>Income:</span>
                                <span>${income !== null ? income.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className='mb-2 text-xl flex justify-between w-full px-4 border-b border-gray-300'>
                                <span className='font-semibold text-red-600 w-24'>Expense:</span>
                                <span>${expense !== null ? expense.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className='mb-2 text-xl flex justify-between w-full px-4 border-b border-gray-300'>
                                <span className='font-semibold w-24'>Fixed:</span>
                                <span>${fixed !== null ? fixed.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className='mb-2 text-xl flex justify-between w-full px-4'>
                                <span className='font-semibold w-24'>Variable:</span>
                                <span>${variable !== null ? variable.toFixed(2) : '0.00'}</span>
                            </div>
                        </div>
                    </div>
                    

                    {/* Categories */}
                    <div className='flex flex-col w-96 h-96 bg-slate-100 rounded-md shadow-md overflow-y-auto'>
                        <span className='bg-green-400 text-center font-bold text-lg rounded-t-md'>Categories</span>
                        <div className='flex flex-col p-5 rounded-b-md overflow-y-auto bg-slate-100'>
                            {/* <div className='flex items-center justify-center gap-4 my-4'>
                                <input
                                    className={`rounded-md border text-sm h-fit w-fit py-1 px-4 ${!categoryIsValid ? 'border-red-500' : 'border-gray-300'}`}
                                    value={categoryInputValue}
                                    onChange={handleCategoryInputChange}
                                />
                                <button
                                    className='rounded-md border text-sm bg-green-400 h-fit w-fit py-1 px-4'
                                    onClick={handleAddCategory}
                                >
                                    Add
                                </button>
                            </div> */}
                            
                            {categories.map((category, index) => (
                                <div
                                    key={category.categoryId}
                                    className={`mb-2 text-lg flex justify-between w-full px-4 gap-20 ${index < categories.length - 1 ? 'border-b border-gray-300' : ''}`}
                                >
                                    <span className='font-semibold'>{category.name}:</span>
                                    <div className='flex items-center justify-center gap-2'>
                                        <span>${category.total}</span>
                                        {/* {category.categoryId !== null && userId !== null && (
                                            <TiDeleteOutline 
                                                className='cursor-pointer hover:text-green-500' 
                                                onClick={() => handleDeleteCategory(category.categoryId, userId)} 
                                            />
                                        )} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Table Section */}
                <div className='flex flex-col h-[73vh] overflow-y-auto rounded-md bg-slate-200 shadow-md'>
                    {/* Heading */}
                    <div className='flex bg-green-400 h-10 min-h-10 items-center gap-2 px-2 text-center w-full'>
                        <p className='w-36'>Date</p>
                        <p className='w-44'>Total</p>
                        <p className='w-44'>Name</p>
                        <p className='w-48'>Category</p>
                        <p className='w-28'>Flow</p>
                        <p className='w-20'>Actions</p>
                    </div>
                    {/* Table Contents */}
                    {rows.length > 0 ? (
                        <div className='flex flex-col border bg-slate-100'>
                            {rows.map((row) => (
                                <div key={row.rowId} className='flex rounded items-center gap-2 px-2 py-2 w-full border-gray-500'>
                                    {/* Date */}
                                    <input
                                        type="date"
                                        value={row.date}
                                        className='rounded h-10 text-center w-36'
                                        onChange={(e) => handleInputChange(row.rowId, 'date', e.target.value)}
                                    />
                                    {/* Total */}
                                    <input
                                        type="number"
                                        value={row.total}
                                        className='text-lg rounded h-10 text-center w-44 border-gray-500'
                                        onChange={(e) => handleInputChange(row.rowId, 'total', e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                    {/* Name */}
                                    <input
                                        type="text"
                                        value={row.name}
                                        className='text-lg rounded h-10 text-center w-44 border-gray-500'
                                        onChange={(e) => handleInputChange(row.rowId, 'name', e.target.value)}
                                    />
                                    {/* Category */}
                                    <select
                                        className="rounded h-10 text-center w-48 border-gray-500"
                                        value={row.categoryId || categories[0]?.categoryId}
                                        onChange={(e) => {
                                            const selectedCategoryId = parseInt(e.target.value);
                                            console.log(selectedCategoryId);
                                            if(!selectedCategoryId){
                                                const selectedCategory = categories.find(category => category.categoryId === 1);
                                                handleRowCategoryInputChange(row.rowId, selectedCategoryId, selectedCategory.term);
                                            } else {
                                                const selectedCategory = categories.find(category => category.categoryId === selectedCategoryId);
                                                handleRowCategoryInputChange(row.rowId, selectedCategoryId, selectedCategory.term);
                                            }
                                        }}
                                        >
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Flow */}                                
                                    {   categories && categories.find(category => category.categoryId === row.categoryId)?.name === "Wage" ? (
                                        <div className={`rounded h-10 text-center w-28 flex items-center justify-center bg-white border border-gray-500`}>
                                            Income
                                        </div>
                                    ) : (
                                        <select
                                            className="rounded h-10 text-center w-28 border-gray-500"
                                            value={row.flow}
                                            onChange={(e) => handleInputChange(row.rowId, 'flow', parseInt(e.target.value))}
                                        >
                                            {Object.entries(flowOptions).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    )}                           
                                    {/* Delete */}
                                    <button
                                        className='h-10 w-20 px-2 border text-red-500 border-red-500 rounded-md hover:bg-red-500 hover:text-white'
                                        onClick={() => handleTrackingRowDelete(row.rowId)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            <div className='flex border p-4 rounded items-center justify-center gap-2 w-full'>
                                <button onClick={handleTrackingRowInsert} className='bg-green-400 rounded px-5 hover:bg-blue-400'>
                                    Add New Row
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex border p-4 rounded items-center justify-center gap-2 w-full bg-slate-100'>
                            <button onClick={handleTrackingRowInsert} className='bg-green-400 rounded px-5 hover:bg-blue-400'>
                                Add New Row
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
    );
};

export default CashFlowTracker;

// Have tracker for each month
// - Lock months that have passed
// - Once a year has passed save all the data into a document
// Fix screen width issue (changing screen size)
