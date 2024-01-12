import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';

const initialTotal: number = 130


const expenseAtom = atomWithStorage<string>('expense', '');
const reasonAtom = atomWithStorage<string>('reason', '');
const logAtom = atomWithStorage<{ expense: string; reason: string }[]>('log', [], {
  getItem: async (key: string) => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : [];
  },
  setItem: async (key: string, newValue: { expense: string; reason: string }[]) => {
    const valueToStore = JSON.stringify(newValue);
    localStorage.setItem(key, valueToStore);
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key);
  }
});
const totalAtom = atomWithStorage<number>('total', initialTotal);

function App() {
  
  function getMonday(d: Date): string {
    let date = new Date(d);
    date.setHours(0, 0, 0, 0); // Reset time to avoid DST issues
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    date.setDate(diff);

    // Format the date as MM-DD-YYYY
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let dayOfMonth = String(date.getDate()).padStart(2, '0');
    let year = date.getFullYear();
    return `${month}-${dayOfMonth}-${year}`;
  }

  const date: string = getMonday(new Date());
  // State for form inputs
  const [expense, setExpense] = useAtom(expenseAtom);
  const [reason, setReason] = useAtom(reasonAtom);
  const [log, setLog] = useAtom(logAtom);
  const [total, setTotal] = useAtom(totalAtom);



  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'expense') {
      setExpense(value);
    } else if (id === 'reason') {
      setReason(value);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseAmount = parseFloat(expense); // Convert expense to a number
    if (!isNaN(expenseAmount)) {
      const newLogEntry = { expense, reason };
      setLog([...log, newLogEntry]);
      setTotal(currentTotal => currentTotal - expenseAmount); // Update total
    }
    setExpense('');
    setReason('');
  };

  const handleDelete = (index: number) => {
    const deletedExpense = parseFloat(log[index].expense);
    const updatedLog = log.filter((_, i) => i !== index);
    setLog(updatedLog);
    setTotal(currentTotal => currentTotal + deletedExpense); // Update total
  };

  const handleDeleteAll = () => {
    setLog([]); // Clear the log
    setTotal(initialTotal); // Reset the total to the initial value
  };
  
  return (  
    <div className="h-screen w-full bg-bottom-left md:bg-center bg-cover bg-[url('/money.png')] bg-no-repeat p-5 flex flex-col gap-5 justify-center items-center p-4">

      <div className='bg-white rounded-lg md:w-1/2 w-5/6 drop-shadow-md p-4'>
        <h1 className=" flex justify-center">Week of {date}</h1>
        <h2 className=" flex justify-center text-2xl">Total: ${total.toFixed(2)}</h2>
      </div>    
      

      <div className='md:w-1/2 w-5/6 bg-white flex flex-col justify-center items-center rounded-lg drop-shadow-md p-4'>
        <p className='pb-4'>Enter Expense and Reason:</p>
        <form className='flex justify-center'>
            <div className="flex flex-col">
              <div className='flex flex-col lg:flex-row pb-4'>
                    <input type="text" id="expense" className="text-center focus:outline-[#344e41]" value={expense} onChange={handleInputChange} placeholder="50" required/>
                    <input type="text" id="reason" className='text-center focus:outline-[#344e41]' value={reason} onChange={handleInputChange} placeholder="groceries" required/>
              </div>

            <button type="button" onClick={handleSubmit} className="text-white bg-[#dda15e] hover:bg-[#bc6c25] p-1 rounded-lg">Submit</button>
          </div>  
        </form>
      </div>

      <div className='md:w-1/2 w-5/6 bg-white flex flex-col justify-center rounded-lg drop-shadow-md p-4'>
      <h2 className=' flex justify-center'>Log for Week {date}</h2>
        <ul className=' flex-col justify-center items-center'>
          {log.map((entry, index) => (
            <li key={index} className='flex flex-row items-center justify-center'>
            ${entry.expense} for {entry.reason}
            <button onClick={() => handleDelete(index)} style={{ marginLeft: '10px' }}>
                x
            </button>
            </li>
          ))} 
        </ul>
        <button onClick={handleDeleteAll} className=''>Clear All</button>
      </div>

    </div>
  ) 
}

export default App
