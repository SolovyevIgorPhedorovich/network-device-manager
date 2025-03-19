import React, { useState } from 'react';
import './ConnectModal.css'; // Импортируем стили

interface ConnectModalProps {
    deviceName: string;
    onConnect: (username: string, password: string) => void;
    onClose: () => void;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ deviceName, onConnect, onClose }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = () => {
        onConnect(username, password);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Подключение к {deviceName}</h2>
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="modal-input"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modal-input"
                />
                <button onClick={handleSubmit} className="modal-button connect-button">
                    Подключиться
                </button>
                <button onClick={onClose} className="modal-button cancel-button">
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default ConnectModal;