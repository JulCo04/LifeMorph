import React from 'react';

interface SwitchProps {
    isToggled: boolean;
    onToggle: () => void;
}

const Switch: React.FC<SwitchProps> = ({ isToggled, onToggle }) => {

    const handleToggle = () => {
        onToggle();
    };

    return (
        <label className='switch'>
            <input type="checkbox" checked={isToggled} onChange={handleToggle} />
            <span className='slider' />
        </label>
    );
};

export default Switch;
