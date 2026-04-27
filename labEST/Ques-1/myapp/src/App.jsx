import React, { useState, memo } from 'react';

const HeavyList = memo(({ items }) => {
  console.log("List rendered!"); 
  
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      label: `Item ${i + 1}`,
    }))
  );

  const addItem = () => {
    const newItem = {
      id: items.length, 
      label: `Item ${items.length + 1}`
    };
    setItems([...items, newItem]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>React.memo Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Counter: <strong>{count}</strong></p>
        
        {/* Buttons side-by-side */}
        <button onClick={() => setCount(count + 1)} style={{ marginRight: '10px' }}>
          Increase Counter (No List Render)
        </button>

        <button onClick={addItem}>
          Add to List (Triggers List Render)
        </button>
      </div>

      <hr />
      
      <HeavyList items={items} />
    </div>
  );
}