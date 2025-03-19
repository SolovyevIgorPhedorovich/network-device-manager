import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './TerminalComponent.css'; // Импортируем стили

interface TerminalComponentProps {
    deviceName: string;
    ip: string;
    username: string;
    password: string;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ deviceName, ip, username, password }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [isConnecting, setIsConnecting] = useState<boolean>(true); // Состояние подключения
    let commandBuffer = "";
    let isMorePrompt = false;

    const brokerURL = "http://localhost:8081/terminal/ws";
    const onConnect = ["/app/ssh.connect", `${ip}:22:${username}:${password}`];
    const subscribeTo = "/topic/ssh.response";

    useEffect(() => {
        if (!ip || !username || !password) {
            console.error("Недостаточно данных для подключения");
            return;
        }

        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        if (terminalRef.current) {
            term.open(terminalRef.current);
            fitAddon.fit();
        }

        // Создание WebSocket-клиента
        const socket = new SockJS(brokerURL);
        const stompClient = over(socket);

        stompClient.connect({}, () => {
            console.log("WebSocket connected");
            setIsConnecting(false); // Подключение установлено
            term.write('\r\nПодключение установлено!\r\n'); // Сообщение об успешном подключении
            if (onConnect) stompClient.send(onConnect[0], {}, onConnect[1]);

            // Подписка к WebSocket
            if (subscribeTo) {
                stompClient.subscribe(subscribeTo, (message: any) => {
                    const output = message.body;
                    isMorePrompt = output.includes("--More--");
                    if (term) {
                        term.write(output); // Выводим сообщение в терминал
                    }
                });
            }
        }, (error: any) => {
            console.error("WebSocket connection error:", error);
            setIsConnecting(false); // Остановка анимации при ошибке
            term.write(`\r\nОшибка подключения к ${deviceName}!\r\n`); // Сообщение об ошибке
        });

        term.onData((data) => {
            if (!isMorePrompt) {
                if (data === '\r' || data === '\n') {
                    stompClient.send('/app/ssh.command', {}, commandBuffer + data);
                    commandBuffer = '';
                } else if (data === '\x7F') { // Обработка backspace
                    if (commandBuffer.length !== 0) {
                        commandBuffer = commandBuffer.slice(0, -1);
                        if (term) {
                            term.write('\b \b');
                        }
                    }
                } else {
                    if (term) {
                        term.write(data);
                    }
                    commandBuffer += data;
                }
            } else {
                stompClient.send('/app/ssh.signal', {}, data);
            }
        });

        // Очистка при размонтировании
        return () => {
            if (term) {
                console.log("Terminal disposed");
                term.dispose();
            }
            if (stompClient) {
                console.log("WebSocket disconnected");
                stompClient.disconnect(() => {});
            }
        };
    }, [ip, username, password]); // Зависимости useEffect

    return (
        <div className="terminal-container">
            <div className="terminal" ref={terminalRef} style={{ width: '100%', height: '500px' }} />
            {isConnecting && (
                <div className="connecting-overlay">
                    <div className="spinner"></div>
                    <p>Подключение...</p>
                </div>
            )}
        </div>
    );
};

export default TerminalComponent;